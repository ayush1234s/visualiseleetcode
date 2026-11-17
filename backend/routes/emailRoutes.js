const express = require("express");
const {
  sendRevisionEmail,
  handleCompleteQuestion,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/send-revision-email", sendRevisionEmail);
router.get("/complete", handleCompleteQuestion);
router.post("/complete", handleCompleteQuestion);

module.exports = router;
