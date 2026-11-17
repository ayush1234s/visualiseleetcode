const express = require("express");
const { replyToChat, getChatStatus } = require("../controllers/chatController");
const router = express.Router();

router.get("/status", getChatStatus);
router.post("/", replyToChat);

module.exports = router;
