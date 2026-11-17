const { answerChatMessage } = require("../utils/aiClient");
const { db } = require("../firebaseAdmin");

const NOTICE = "Aapki privacy ke liye personal information wala message chat se hata diya gaya hai. Kripya phone number, email, address, password ya card details share na karein.";
const BLOCK_NOTICE = "Aapki chat security violations ke kaaran permanently block kar di gayi hai. Aapko aisi activity ke liye karyawahi ya penalty ka saamna karna pad sakta hai.";
const personalInfoPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|(?:\+?\d[\d\s().-]{7,}\d)|\b(?:password|passcode|otp|social security|aadhaar|aadhar|pan number|credit card|debit card|cvv)\s*(?:is|:|-)?\s*[A-Z0-9\-/]{4,}/i;
const threatPattern = /\b(?:i(?:'ll| will)?\s+)?(?:hack|hacked|hacking)\s+(?:you|your|the)?\s*(?:server|sever|system|website|account)?\b|\b(?:i|we)\s+(?:control|own)\s+your\s+(?:server|sever|system|website)\b|\b(?:take|bring)\s+(?:your|the)\s+(?:server|sever|site|website)\s+down\b/i;

const securityRef = (userId) => db.collection("aiChatSecurity").doc(userId);

exports.getChatStatus = async (req, res) => {
  const userId = typeof req.query.userId === "string" ? req.query.userId : "";
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(userId)) return res.status(400).json({ error: "Invalid chat user." });
  try {
    const snapshot = await securityRef(userId).get();
    const data = snapshot.exists ? snapshot.data() : {};
    return res.json({ blocked: Boolean(data.blocked), warningCount: Number(data.warningCount) || 0, notice: data.blocked ? BLOCK_NOTICE : "" });
  } catch (error) {
    console.error("AI chat status error:", error.message);
    return res.status(503).json({ error: "Chat security status is unavailable." });
  }
};

exports.replyToChat = async (req, res) => {
  const { message, conversation, attachments } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Please enter a message." });
  }
  if (message.length > 12000) {
    return res.status(413).json({ error: "Please keep messages under 12,000 characters." });
  }
  const userId = req.body?.userId;
  if (typeof userId !== "string" || !/^[A-Za-z0-9_-]{8,128}$/.test(userId)) return res.status(400).json({ error: "Invalid chat user." });

  if (attachments !== undefined && !Array.isArray(attachments)) {
    return res.status(400).json({ error: "Attachments must be a list of files." });
  }
  if (attachments?.length > 3) {
    return res.status(413).json({ error: "Please attach no more than 3 files per message." });
  }
  if (attachments?.some((item) => item && typeof item.data === "string" && item.data.length > 8 * 1024 * 1024)) {
    return res.status(413).json({ error: "An attached image is too large. Please choose a smaller image." });
  }
  const safeAttachments = (attachments || []).filter((item) => item && typeof item.name === "string")
    .map(({ name, type, data, text }) => ({
      name: name.slice(0, 180),
      type: typeof type === "string" ? type.slice(0, 120) : "application/octet-stream",
      data: typeof data === "string" && data.length <= 8 * 1024 * 1024 ? data : "",
      text: typeof text === "string" ? text.slice(0, 100000) : "",
    }));
  const imageAttachments = safeAttachments.filter((item) => item.type.startsWith("image/") && item.data.startsWith("data:image/"));
  if (imageAttachments.length > 3) {
    return res.status(413).json({ error: "Please attach no more than 3 images per message." });
  }

  try {
    const ref = securityRef(userId);
    const payload = [message, ...(attachments || []).map((item) => `${item?.name || ""} ${item?.text || ""}`)].join("\n");
    if (personalInfoPattern.test(payload)) {
      return res.status(200).json({ action: "personal_info_removed", notice: NOTICE });
    }
    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const state = snapshot.exists ? snapshot.data() : {};
      if (state.blocked) return { blocked: true, warningCount: Number(state.warningCount) || 3 };
      if (threatPattern.test(message)) {
        const warningCount = (Number(state.warningCount) || 0) + 1;
        const blocked = warningCount >= 3;
        transaction.set(ref, { warningCount, blocked, updatedAt: new Date().toISOString() }, { merge: true });
        return { blocked, warningCount };
      }
      return { blocked: false, warningCount: Number(state.warningCount) || 0 };
    });
    if (result.blocked) return res.status(403).json({ action: "blocked", blocked: true, warningCount: result.warningCount, notice: BLOCK_NOTICE });
    if (threatPattern.test(message)) return res.status(200).json({ action: "warning", warningCount: result.warningCount, notice: `Security warning ${result.warningCount} of 3. ${BLOCK_NOTICE}` });
    const reply = await answerChatMessage(message.trim(), Array.isArray(conversation) ? conversation : [], safeAttachments);
    res.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error.message);
    res.status(503).json({ error: "The AI is unavailable right now. Please try again shortly." });
  }
};
