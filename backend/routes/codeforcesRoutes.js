const express = require("express");
const router = express.Router();

const {
  getCodeforcesSubmissions
} = require("../controllers/codeforcesController");

router.get("/:username", getCodeforcesSubmissions);

module.exports = router;