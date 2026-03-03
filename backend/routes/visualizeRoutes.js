const express = require("express");
const router = express.Router();

const {
  handleVisualize,
  handleAnalyze,
} = require("../controllers/visualizeController");

router.post("/", handleVisualize);
router.post("/analyze", handleAnalyze);

module.exports = router;