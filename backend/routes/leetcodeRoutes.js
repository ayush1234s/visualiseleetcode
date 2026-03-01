const express = require("express");
const router = express.Router();

const {
  getUserDetails,
  getDailyProblem,
  getRecentSubmissions,
  getLeetCodeContests
} = require("../controllers/leetcodeController");

router.get("/:username", getUserDetails);
router.get("/daily/problem", getDailyProblem);
router.get("/recent/:username", getRecentSubmissions);
router.get("/contests", getLeetCodeContests);

module.exports = router;