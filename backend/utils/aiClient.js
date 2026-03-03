const OpenAI = require("openai");
const axios = require("axios");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/* ================= FETCH REAL LEETCODE TITLE ================= */
const fetchLeetCodeQuestion = async (questionNumber) => {
  const response = await axios.get(
    "https://leetcode.com/api/problems/all/"
  );

  const problems = response.data.stat_status_pairs;

  const problem = problems.find(
    (p) => p.stat.frontend_question_id == questionNumber
  );

  if (!problem) throw new Error("Problem not found");

  return {
    title: problem.stat.question__title,
    slug: problem.stat.question__title_slug,
  };
};

/* ================= GENERATE EXPLANATION ================= */
const generateVisualization = async (questionNumber) => {
  const problem = await fetchLeetCodeQuestion(questionNumber);

  const prompt = `
You are a senior C++ DSA teacher.

LeetCode Problem:
Title: ${problem.title}

Explain clearly.

FORMAT:

# ${problem.title}

## 🧠 Simple Explanation

## 🎯 Pattern Used

## 🪜 Step-by-Step Breakdown (Use real example)

## 💻 C++ Implementation 
Use:
class Solution {
public:
};

## ⚡ Brute Force Approach

## ⏱ Time Complexity

## 🧠 Space Complexity
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return {
    question: `#${questionNumber} - ${problem.title}`,
    visualization: completion.choices[0].message.content,
  };
};

/* ================= ANALYZE USER CODE ================= */
const analyzeUserCode = async (questionTitle, userCode) => {

  const prompt = `
You are a strict C++ LeetCode judge.

Question: ${questionTitle}

User Code:
${userCode}

First check:
Is this code logically correct and accepted for LeetCode?

If the code is fully correct:
Return ONLY:

STATUS: CORRECT

Then show:
## ✅ Your Code is Correct
Short explanation why it works.

Then also show:
## 💻 Full Correct Code
Provide clean C++ solution.

-------------------------------------

If the code is WRONG:
Return:

STATUS: WRONG

Then show:

## ❌ Issues in Your Code

## 🔧 How To Fix

## 💻 Corrected C++ Code

Be precise.
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  });

  return completion.choices[0].message.content;
};

module.exports = {
  generateVisualization,
  analyzeUserCode,
};