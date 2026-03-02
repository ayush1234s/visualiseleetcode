const axios = require("axios");
const generateVisualization = require("../utils/openaiClient");

exports.visualizeQuestion = async (req, res) => {
  try {
    const { questionNumber } = req.body;

    if (!questionNumber) {
      return res.status(400).json({ error: "Question required" });
    }

    // 🔹 Fetch question from LeetCode
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            difficulty
            content
          }
        }
      `,
        variables: { titleSlug: questionNumber }
      }
    );

    const question = response?.data?.data?.question;

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // 🔹 Call OpenAI
    const explanation = await generateVisualization(
      question.title,
      question.difficulty
    );

    res.json({
      title: question.title,
      difficulty: question.difficulty,
      explanation
    });

  } catch (error) {
    console.error("Visualize Error:", error.message);
    res.status(500).json({ error: "Visualization failed" });
  }
};