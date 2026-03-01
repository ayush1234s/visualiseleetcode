const express = require("express");
const router = express.Router();

const {
  getCodeforcesSubmissions,
  getCodeforcesContests
} = require("../controllers/codeforcesController");

router.get("/:username", getCodeforcesSubmissions);
router.get("/contests", getCodeforcesContests);

module.exports = router;