const OpenAI = require("openai");
const axios = require("axios");
const { getLeetCodeProblem } = require("./leetcodeDictionary");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

let cachedProblems = null;
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

/* ================= FETCH REAL LEETCODE QUESTION ================= */

const fetchLeetCodeQuestion = async (questionNumber) => {
  // 1. Instant verified dictionary check
  const local = getLeetCodeProblem(questionNumber);
  if (local) {
    return {
      title: local.title,
      slug: local.slug,
    };
  }

  // 2. Try online problem catalog if available
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
          timeout: 4000,
          proxy: false,
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
    // Cloudflare blocks public axios requests without cookies
  }

  // Fallback
  return {
    title: `LeetCode Problem #${questionNumber}`,
    slug: "",
  };
};

/* ================= AI HELPER WITH MODEL FALLBACK ================= */

const getAICompletion = async (prompt, temperature = 0.2) => {
  const models = [process.env.GROQ_MODEL || "qwen/qwen3.8-27b"];
  const maxCompletionTokens = Number(
    process.env.GROQ_MAX_COMPLETION_TOKENS || 700
  );
  let lastError = null;

  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_completion_tokens: maxCompletionTokens,
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
You are a senior C++ DSA teacher and LeetCode expert.

Explain the following LeetCode problem clearly.
Problem #${questionNumber}: ${problem.title}

Structure your response EXACTLY like this:

# ${problem.title.replace(/^LeetCode Problem #\d+/, "Problem #" + questionNumber)}

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

  // Extract clean title
  let cleanTitle = problem.title || "";
  if (!problem.slug || cleanTitle.includes("LeetCode Problem #")) {
    const titleMatch = content.match(/^#\s*(.+)$/m);
    if (titleMatch && !titleMatch[1].includes("LeetCode Problem #")) {
      cleanTitle = titleMatch[1].replace(/^#?\d+\s*[-:]\s*/, "").trim();
    }
  }

  // Derive slug for direct official LeetCode link
  const slug = (problem.slug || cleanTitle)
    .toLowerCase()
    .replace(/^#?\d+\s*[-:]\s*/, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  // Official LeetCode URL with /description/
  const leetcodeUrl = slug
    ? `https://leetcode.com/problems/${slug}/description/`
    : `https://leetcode.com/problemset/all/?search=${questionNumber}`;

  return {
    question: `#${questionNumber} - ${cleanTitle || problem.title}`,
    questionNumber: Number(questionNumber),
    questionTitle: cleanTitle || problem.title,
    slug,
    leetcodeUrl,
    visualization: content,
  };
};

/* ================= ANALYZE USER CODE ================= */

const analyzeUserCode = async (questionTitle, userCode, language = "cpp") => {
  const normalizedLanguage = language?.toLowerCase();
  const langName =
    normalizedLanguage === "java"
      ? "Java"
      : normalizedLanguage === "python"
      ? "Python"
      : "C++";

  if (
    normalizedLanguage === "python" &&
    /\bpublic\s+(?:class|static|void)\b|\bclass\s+\w+\s*\{|\bSystem\.out\b/.test(
      userCode
    )
  ) {
    return `STATUS: WRONG

## ❌ Language Mismatch
You Entered Java Code In Python, Please enter the correct code in python.`;
  }

  const prompt = `
You are a strict ${langName} LeetCode judge.

Question:
${questionTitle}

User Code (${langName}):
${userCode}

IMPORTANT:
1. First line MUST be:
   - "STATUS: CORRECT" if user code is correct
   - "STATUS: WRONG" if user code has bugs / errors

2. If STATUS: WRONG:
   - Explain the bug clearly
   - Explain what is wrong in the user's logic
   - Provide the fix
   - Then provide full correct ${langName} code under:
     ## 💻 Full Correct ${langName} Code

3. If STATUS: CORRECT:
   - Provide time & space complexity
   - Give 1 small optimization tip
`;

  return await getAICompletion(prompt, 0.1);
};

/* ================= HINDI EXPLANATION ================= */

const generateHindiExplanation = async (questionTitle, explanation) => {
  const prompt = `
You are an expert DSA teacher who explains concepts in Hinglish (Hindi written in English alphabet) in a very friendly and clear way, like Striver or Love Babbar.

Question:
${questionTitle}

English Explanation:
${explanation}

Explain this entire question and solution in Hinglish.
Use simple, clear Hindi words written in English letters.
Explain:
1. Question kya bol raha hai simple words mein.
2. Konsa pattern use hoga aur kyu.
3. Example ke sath dry run / step-by-step logic.
4. Time aur Space Complexity.

Keep the structure clean with markdown headings.
`;

  return await getAICompletion(prompt, 0.3);
};

module.exports = {
  fetchLeetCodeQuestion,
  generateVisualization,
  analyzeUserCode,
  generateHindiExplanation,
};
