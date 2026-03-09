const express = require("express");
const { sendRevisionEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/send-revision-email", sendRevisionEmail);

module.exports = router;