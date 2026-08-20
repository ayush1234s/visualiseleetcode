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
    console.error("handleVisualize Error:", error);
    res.status(500).json({
      error: error.message || "Visualization failed"
    });
  }
};

/* ================= CODE ANALYZE ================= */

const handleAnalyze = async (req, res) => {
  try {
    const { questionTitle, userCode, language } = req.body;

    if (!userCode)
      return res.status(400).json({
        error: "Code required"
      });

    const result = await analyzeUserCode(
      questionTitle,
      userCode,
      language
    );

    res.json({
      analysis: result
    });

  } catch (error) {
    console.error("handleAnalyze Error:", error);
    res.status(500).json({
      error: error.message || "Analysis failed"
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
    console.error("handleHindiExplain Error:", error);
    res.status(500).json({
      error: error.message || "Hindi explanation failed"
    });
  }
};

module.exports = {
  handleVisualize,
  handleAnalyze,
  handleHindiExplain
};