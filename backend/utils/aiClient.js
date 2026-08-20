const OpenAI = require("openai");
const axios = require("axios");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

let cachedProblems = null;
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

/* ================= FETCH REAL LEETCODE QUESTION ================= */

const fetchLeetCodeQuestion = async (questionNumber) => {
  try {
    const now = Date.now();
    if (!cachedProblems || now - lastCacheTime > CACHE_DURATION) {
      const response = await axios.get(
        "https://leetcode.com/api/problems/all/",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json, text/plain, */*",
          },
          timeout: 10000,
        }
      );
      if (response.data && response.data.stat_status_pairs) {
        cachedProblems = response.data.stat_status_pairs;
        lastCacheTime = now;
      }
    }

    if (cachedProblems) {
      const problem = cachedProblems.find(
        (p) => p.stat.frontend_question_id == questionNumber
      );
      if (problem && problem.stat) {
        return {
          title: problem.stat.question__title,
          slug: problem.stat.question__title_slug,
        };
      }
    }
  } catch (err) {
    console.error("Error fetching LeetCode problem list:", err.message);
  }

  // Fallback if network request fails or question id not matched directly
  return {
    title: `LeetCode Problem #${questionNumber}`,
    slug: "",
  };
};

/* ================= AI HELPER WITH MODEL FALLBACK ================= */

const getAICompletion = async (prompt, temperature = 0.2) => {
  const models = ["groq/compound-mini", "groq/compound", "qwen/qwen3.6-27b"];
  let lastError = null;

  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
      });
      if (completion.choices && completion.choices[0]?.message?.content) {
        return completion.choices[0].message.content;
      }
    } catch (err) {
      console.warn(`Model ${model} failed: ${err.message}. Trying next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models failed to respond.");
};

/* ================= GENERATE ENGLISH EXPLANATION ================= */

const generateVisualization = async (questionNumber) => {
  const problem = await fetchLeetCodeQuestion(questionNumber);

  const prompt = `
You are a senior C++ DSA teacher.

Explain the following LeetCode problem clearly.

Problem Title: ${problem.title}

Structure your response EXACTLY like this:

# ${problem.title}

## 🧠 Simple Explanation
Explain what the question is asking in simple terms.

## 🎯 Pattern Used
Explain which DSA pattern is used and why.

## 🪜 Step-by-Step Breakdown
Use a real example and explain step by step.

## 💻 C++ Implementation
Provide clean C++ code inside

class Solution {
public:

};

## ⚡ Brute Force Approach
Explain brute force solution.

## ⏱ Time Complexity
Explain why.

## 🧠 Space Complexity
Explain why.

IMPORTANT:
Use only C++ code.
Do not use Python.
`;

  const content = await getAICompletion(prompt, 0.2);

  return {
    question: `#${questionNumber} - ${problem.title}`,
    visualization: content,
  };
};


/* ================= ANALYZE USER CODE ================= */

const analyzeUserCode = async (questionTitle, userCode) => {
  const prompt = `
You are a strict C++ LeetCode judge.

Question:
${questionTitle}

User Code:
${userCode}

First check if the code is logically correct.

If CORRECT:

Return exactly:

STATUS: CORRECT

## ✅ Your Code is Correct
Explain briefly why the logic works.

## 💻 Full Correct Code
Provide a clean optimal C++ solution.

-----------------------

If WRONG:

Return exactly:

STATUS: WRONG

## ❌ Issues in Your Code
Explain mistakes clearly.

## 🔧 How To Fix
Explain what changes are required.

## 💻 Corrected C++ Code
Provide fixed working code.
`;

  const content = await getAICompletion(prompt, 0.1);
  return content;
};


/* ================= HINDI EXPLANATION ================= */

const generateHindiExplanation = async (questionTitle, explanation) => {
  const prompt = `
You are a friendly DSA teacher.

Explain the following LeetCode problem in **very simple Hindi**.

Start like this:

Namaste Students 👋
Main Visualize Leetcode AI hoon.

Then explain the problem.

Sections required:

## 🧠 Simple Explanation

## 🎯 Pattern Used

## 🪜 Step-by-Step Breakdown

## ⚡ Brute Force Approach

## ⏱ Time Complexity

## 🧠 Space Complexity

IMPORTANT RULES:

1. Do NOT show any code.
2. Only explain concept.
3. Use very easy Hindi.
4. Use small examples.

Question:
${questionTitle}

Explanation:
${explanation}
`;

  const content = await getAICompletion(prompt, 0.3);
  return content;
};


/* ================= EXPORT ================= */

module.exports = {
  generateVisualization,
  analyzeUserCode,
  generateHindiExplanation,
};