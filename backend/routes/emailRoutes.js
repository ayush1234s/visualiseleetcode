const express = require("express");
const { sendRevisionEmail } = require("../controllers/emailController");

const router = express.Router();

// This route is for revision reminder email only.
router.post("/send-revision-email", sendRevisionEmail);

module.exports = router;