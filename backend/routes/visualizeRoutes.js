const express = require("express");
const router = express.Router();

const {
  handleVisualize,
  handleAnalyze,
  handleHindiExplain
} = require("../controllers/visualizeController");

router.post("/", handleVisualize);

router.post("/analyze", handleAnalyze);

router.post("/hindi", handleHindiExplain);

module.exports = router;