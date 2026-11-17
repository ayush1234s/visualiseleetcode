const express = require("express");
const { replyToChat } = require("../controllers/chatController");
const router = express.Router();

router.post("/", replyToChat);

module.exports = router;
