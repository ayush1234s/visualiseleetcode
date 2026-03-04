const {
  generateVisualization,
  analyzeUserCode,
  generateHindiExplanation
} = require("../utils/aiClient");

/* ================= VISUALIZE ================= */

const handleVisualize = async (req, res) => {
  try {

    const { questionNumber } = req.body;

    if (!questionNumber)
      return res.status(400).json({
        error: "Question number required"
      });

    const result = await generateVisualization(questionNumber);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      error: "Visualization failed"
    });
  }
};

/* ================= CODE ANALYZE ================= */

const handleAnalyze = async (req, res) => {
  try {

    const { questionTitle, userCode } = req.body;

    if (!userCode)
      return res.status(400).json({
        error: "Code required"
      });

    const result = await analyzeUserCode(
      questionTitle,
      userCode
    );

    res.json({
      analysis: result
    });

  } catch (error) {
    res.status(500).json({
      error: "Analysis failed"
    });
  }
};

/* ================= HINDI EXPLANATION ================= */

const handleHindiExplain = async (req, res) => {
  try {

    const { questionTitle, explanation } = req.body;

    const hindi = await generateHindiExplanation(
      questionTitle,
      explanation
    );

    res.json({ hindi });

  } catch (error) {

    res.status(500).json({
      error: "Hindi explanation failed"
    });

  }
};

module.exports = {
  handleVisualize,
  handleAnalyze,
  handleHindiExplain
};