const { answerChatMessage } = require("../utils/aiClient");

exports.replyToChat = async (req, res) => {
  const { message, conversation, attachments } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Please enter a message." });
  }
  if (message.length > 12000) {
    return res.status(413).json({ error: "Please keep messages under 12,000 characters." });
  }

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
    const reply = await answerChatMessage(message.trim(), Array.isArray(conversation) ? conversation : [], safeAttachments);
    res.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error.message);
    res.status(503).json({ error: "The AI is unavailable right now. Please try again shortly." });
  }
};
