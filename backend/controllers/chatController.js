const { answerChatMessage } = require("../utils/aiClient");

exports.replyToChat = async (req, res) => {
  const { message, conversation } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Please enter a message." });
  }
  if (message.length > 12000) {
    return res.status(413).json({ error: "Please keep messages under 12,000 characters." });
  }

  try {
    const reply = await answerChatMessage(message.trim(), Array.isArray(conversation) ? conversation : []);
    res.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error.message);
    res.status(503).json({ error: "The AI is unavailable right now. Please try again shortly." });
  }
};
