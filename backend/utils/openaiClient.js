const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateVisualization(title, difficulty) {
  const prompt = `
Explain the LeetCode problem "${title}" (${difficulty}) in:

1. Simple Explanation
2. Pattern Used
3. Step-by-step Approach
4. Time Complexity
5. Space Complexity

Make it beginner friendly.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
}

module.exports = generateVisualization;