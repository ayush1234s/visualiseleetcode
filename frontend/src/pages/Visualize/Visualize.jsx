import { useState, useMemo } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import {
  Brain,
  Code2,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
  Play,
  FileCode,
  Languages,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { SiLeetcode } from "react-icons/si";

import { getLeetCodeProblem } from "../../utils/leetcodeDictionary";

/* ================= STARTER TEMPLATES ================= */
const STARTER_CODE = {
  cpp: `class Solution {
public:
    void solve() {
        // Write your solution here
    }
};`,
  java: `class Solution {
    public void solve() {
        // Write your solution here
    }
}`,
  python: `class Solution:
    def solve(self):
        # Write your solution here
        pass`,
  javascript: `var solve = function() {
    // Write your solution here
};`,
};

const LANGUAGES = [
  { id: "cpp", name: "C++", version: "GCC 13", ext: ".cpp" },
  { id: "java", name: "Java", version: "OpenJDK 17", ext: ".java" },
  { id: "python", name: "Python 3", version: "Python 3.11", ext: ".py" },
  { id: "javascript", name: "JavaScript", version: "Node.js 20", ext: ".js" },
];

/* ================= SYNTAX LINTER ================= */
function checkSyntax(code, lang) {
  if (!code.trim()) return { hasError: false, errors: [] };

  const errors = [];
  const lines = code.split("\n");
  const stack = [];
  const pairs = { ")": "(", "}": "{", "]": "[" };

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let inSingle = false;
    let inDouble = false;

    for (let colIdx = 0; colIdx < line.length; colIdx++) {
      const char = line[colIdx];
      const prevChar = colIdx > 0 ? line[colIdx - 1] : "";

      if (char === "'" && prevChar !== "\\") inSingle = !inSingle;
      if (char === '"' && prevChar !== "\\") inDouble = !inDouble;

      if (!inSingle && !inDouble) {
        if (char === "(" || char === "{" || char === "[") {
          stack.push({ char, line: lineIdx + 1 });
        } else if (char === ")" || char === "}" || char === "]") {
          if (stack.length === 0) {
            errors.push({
              line: lineIdx + 1,
              message: `Unexpected closing '${char}'`,
            });
          } else {
            const last = stack.pop();
            if (last.char !== pairs[char]) {
              errors.push({
                line: lineIdx + 1,
                message: `Mismatched bracket '${char}' (expected '${pairs[char]}')`,
              });
            }
          }
        }
      }
    }

    if (inSingle) errors.push({ line: lineIdx + 1, message: "Unclosed single quote" });
    if (inDouble) errors.push({ line: lineIdx + 1, message: "Unclosed double quote" });

    if (lang === "python") {
      const trimmed = line.trim();
      const needsColon = /^(if|elif|else|for|while|def|class|try|except|finally|with)\b/.test(trimmed);
      if (needsColon && !trimmed.endsWith(":") && !trimmed.endsWith("\\") && !trimmed.includes("#")) {
        errors.push({ line: lineIdx + 1, message: "Missing colon ':' at end of statement" });
      }
    }

    if (lang === "cpp" || lang === "java") {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*") &&
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("#") &&
        !trimmed.endsWith("{") &&
        !trimmed.endsWith("}") &&
        !trimmed.endsWith(";") &&
        !trimmed.endsWith(":") &&
        !trimmed.endsWith(",") &&
        !trimmed.startsWith("public:") &&
        !trimmed.startsWith("private:") &&
        !trimmed.startsWith("protected:") &&
        !/^(if|else|for|while|class|struct|namespace|try|catch)\b/.test(trimmed)
      ) {
        if (/^(int|long|double|float|char|bool|string|vector|auto|return|const|var|let)\b/.test(trimmed)) {
          errors.push({ line: lineIdx + 1, message: "Missing semicolon ';' at end of statement" });
        }
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop();
    errors.push({ line: unclosed.line, message: `Unclosed bracket '${unclosed.char}'` });
  }

  return { hasError: errors.length > 0, errors };
}

export default function Visualize() {
  const [questionNumber, setQuestionNumber] = useState("");
  const [visualData, setVisualData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tab switch between English and Hinglish (Exclusive: one hides the other)
  const [explanationLang, setExplanationLang] = useState("english");

  const [language, setLanguage] = useState("cpp");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userCode, setUserCode] = useState(STARTER_CODE.cpp);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [hindiExplain, setHindiExplain] = useState("");
  const [hindiLoading, setHindiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Graphical pattern step state
  const [activeStep, setActiveStep] = useState(1);

  /* ================= FETCH QUESTION ================= */
  const handleVisualize = async () => {
    if (!questionNumber || Number(questionNumber) <= 0) {
      setError("Please enter a valid LeetCode problem number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setVisualData(null);
      setAnalysis(null);
      setHindiExplain("");
      setExplanationLang("english");
      setActiveStep(1);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/visualize`,
        { questionNumber }
      );

      setVisualData(res.data);
      toast.success(`Problem #${questionNumber} loaded`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load problem. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRECISE LEETCODE URL RESOLVER ================= */
  const parsedQuestion = useMemo(() => {
    if (!visualData) return null;

    const num = visualData.questionNumber || questionNumber;
    const dict = getLeetCodeProblem(num);
    let title = visualData.questionTitle || "";

    if (!title && visualData.question) {
      const match = visualData.question.match(/^#?\d+\s*[-:]\s*(.*)$/);
      title = match ? match[1].trim() : visualData.question;
    }

    if (!title || title.toLowerCase().includes("problem #")) {
      const headingMatch = visualData.visualization?.match(/^#\s*(.+)$/m);
      if (headingMatch && !headingMatch[1].toLowerCase().includes("problem #")) {
        title = headingMatch[1].trim();
      }
    }

    // Clean title for direct slug formation
    const cleanTitle = (dict?.title || title || `Problem #${num}`)
      .replace(/^#?\d+\s*[-:]\s*/, "")
      .replace(/^LeetCode\s+Problem\s+#?\d+\s*[-:]?\s*/i, "")
      .trim();

    // Derived slug: standard LeetCode format
    const derivedSlug = (dict?.slug || visualData.slug || cleanTitle)
      .toLowerCase()
      .replace(/^#?\d+\s*[-:]\s*/, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const directUrl = derivedSlug
      ? `https://leetcode.com/problems/${derivedSlug}/description/`
      : `https://leetcode.com/problemset/all/?search=${num}`;

    return {
      number: num,
      title: cleanTitle || (dict ? dict.title : `Problem #${num}`),
      url: directUrl,
    };
  }, [visualData, questionNumber]);

  /* ================= PATTERN INFO ================= */
  const patternInfo = useMemo(() => {
    if (!visualData?.visualization) return null;

    const vis = visualData.visualization;
    const patternMatch = vis.match(/##\s*🎯\s*Pattern Used([\s\S]*?)(?=##|$)/i);

    const patternsList = [
      { name: "Two Pointers", tag: "Two Pointers", desc: "Left and Right boundary pointers scan inward or outward to find target pairs in O(N)." },
      { name: "Sliding Window", tag: "Sliding Window", desc: "Expands and shrinks a contiguous window range to compute optimal subarray sums or lengths." },
      { name: "Monotonic Stack", tag: "Monotonic Stack", desc: "Stack maintained in sorted order to resolve Next Greater / Previous Smaller Element in O(N)." },
      { name: "Fast & Slow Pointers", tag: "Fast & Slow Pointers", desc: "Floyd's cycle detection moving pointers at speeds 1x and 2x." },
      { name: "Binary Search", tag: "Binary Search", desc: "Repeatedly cuts the search space in half in O(log N) on sorted arrays or monotonic answer ranges." },
      { name: "Dynamic Programming", tag: "Dynamic Programming", desc: "Memoizes subproblem results to avoid exponential recalculation." },
      { name: "Breadth-First Search", tag: "BFS Graph/Tree", desc: "Level-by-level traversal discovering shortest paths and layer states." },
      { name: "Depth-First Search", tag: "DFS Traversal", desc: "Exhaustively visits branches to identify connected components and tree paths." },
      { name: "Hash Map", tag: "Hash Map / Frequency", desc: "Stores previously seen elements for instantaneous O(1) complement lookups." },
      { name: "Prefix Sum", tag: "Prefix Sum", desc: "Precomputes cumulative totals for instant O(1) range queries." },
    ];

    let detected = patternsList.find((p) => new RegExp(p.name, "i").test(vis));

    if (!detected) {
      detected = {
        name: "Optimal Algorithmic Pattern",
        tag: "Optimal Approach",
        desc: "Structured algorithmic decomposition designed to achieve optimal time and memory limits.",
      };
    }

    return {
      name: detected.name,
      tag: detected.tag,
      description: detected.desc,
      rawPatternText: patternMatch ? patternMatch[1].trim() : "",
    };
  }, [visualData]);

  /* ================= SYNTAX CHECK ================= */
  const syntaxCheck = useMemo(() => checkSyntax(userCode, language), [userCode, language]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setLangDropdownOpen(false);
    if (!userCode || userCode === STARTER_CODE[language]) {
      setUserCode(STARTER_CODE[newLang] || "");
    }
  };

  const handleResetCode = () => {
    setUserCode(STARTER_CODE[language] || "");
    toast.success("Code reset");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async () => {
    if (!userCode.trim()) {
      toast.error("Please enter code first");
      return;
    }

    try {
      setAnalyzing(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/visualize/analyze`,
        {
          questionTitle: visualData.question,
          userCode,
          language,
        }
      );
      setAnalysis(res.data.analysis);
      toast.success("Analysis complete");
    } catch (err) {
      toast.error(err.response?.data?.error || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const loadHinglishExplanation = async () => {
    if (hindiExplain) {
      setExplanationLang("hinglish");
      return;
    }

    try {
      setHindiLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/visualize/hindi`,
        {
          questionTitle: visualData.question,
          explanation: visualData.visualization,
        }
      );
      setHindiExplain(res.data.hindi);
      setExplanationLang("hinglish");
      toast.success("Hinglish translation ready");
    } catch (err) {
      toast.error("Could not load Hinglish explanation");
    } finally {
      setHindiLoading(false);
    }
  };

  const codeLines = userCode.split("\n");
  const errorLineSet = new Set(syntaxCheck.errors.map((e) => e.line));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 overflow-x-hidden">
      
      {/* ================= SEARCH INPUT ================= */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Brain className="text-blue-400 w-7 h-7" />
            Visualize LeetCode
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Input any LeetCode problem number to inspect its graphical pattern, step-by-step logic, and debug code.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-2.5 text-gray-500 font-mono text-sm">#</span>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1 for Two Sum, 15 for 3Sum"
              value={questionNumber}
              onChange={(e) => setQuestionNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleVisualize();
              }}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-gray-400 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition"
            />
          </div>

          {/* GREY BUTTON (WITHOUT HOVER: GREY, AFTER HOVER: DARK GREY) */}
          <button
            type="button"
            onClick={handleVisualize}
            disabled={loading}
            className="bg-[#21262d] hover:bg-[#161b22] text-gray-200 hover:text-white border border-[#30363d] hover:border-gray-500 font-medium px-5 py-2.5 rounded-xl text-sm transition cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
          >
            {loading ? "Visualizing..." : "Visualize Problem"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1.5 pt-1">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* ================= QUESTION HEADER & DIRECT LEETCODE URL ================= */}
      {parsedQuestion && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#21262d] text-[#ffa116] font-mono font-bold text-xs border border-[#30363d]">
                #{parsedQuestion.number}
              </span>
              <span className="text-xs text-gray-400 font-medium">Official LeetCode</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {parsedQuestion.title}
            </h2>
          </div>

          {/* EXACT QUESTION OPEN BUTTON */}
          <a
            href={parsedQuestion.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#ffa116] hover:bg-[#ffb03a] text-black font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer self-start sm:self-auto shadow-sm active:scale-95"
          >
            <SiLeetcode size={16} />
            <span>Practice on LeetCode ↗</span>
          </a>
        </div>
      )}

      {/* ================= GRAPHICAL PATTERN VISUALIZER ================= */}
      {patternInfo && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#30363d]/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="text-purple-400" size={18} />
              Graphical Pattern Flow
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              {patternInfo.tag}
            </span>
          </div>

          {/* GRAPHICAL STEP CANVAS */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-white">Interactive Pattern Mechanism</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setActiveStep(step)}
                    className={`w-6 h-6 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeStep === step
                        ? "bg-purple-600 text-white"
                        : "bg-[#21262d] text-gray-400 hover:text-white"
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {/* VISUAL DIAGRAM BASED ON STEP */}
            {activeStep === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="text-xs text-gray-300">
                  <span className="font-bold text-purple-400">Step 1: Initialization & Boundary Setup</span>
                  <p className="text-gray-400 mt-0.5">Establish pointer markers or state containers.</p>
                </div>

                {/* GRAPHICAL POINTER ARRAY BOX */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-3 overflow-x-auto">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-purple-400 font-mono font-bold mb-1">Left (L) ↓</span>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center font-mono font-bold text-white text-sm">
                      arr[0]
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-center font-mono text-gray-400 text-sm">
                    arr[1]
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-center font-mono text-gray-400 text-sm">
                    ...
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold mb-1">Right (R) ↓</span>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center font-mono font-bold text-white text-sm">
                      arr[N-1]
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="text-xs text-gray-300">
                  <span className="font-bold text-blue-400">Step 2: Invariant Check & Branch Pruning</span>
                  <p className="text-gray-400 mt-0.5">Evaluate current window/pointers against the target constraint.</p>
                </div>

                {/* GRAPHICAL DECISION NODE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                    <span className="text-gray-400 block mb-1">If Sum &lt; Target</span>
                    <span className="text-purple-400 font-mono font-bold">Shift L → (L++)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-emerald-400 block mb-1">If Sum == Target</span>
                    <span className="text-white font-mono font-bold">Return Solution ✓</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                    <span className="text-gray-400 block mb-1">If Sum &gt; Target</span>
                    <span className="text-emerald-400 font-mono font-bold">← Shift R (R--)</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="text-xs text-gray-300">
                  <span className="font-bold text-emerald-400">Step 3: Convergence & Linear Time Guarantee</span>
                  <p className="text-gray-400 mt-0.5">Pointers never re-visit elements, guaranteeing optimal execution.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <span>Time Complexity: <strong className="text-white">O(N)</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>Space: <strong className="text-white">O(1) Auxiliary</strong></span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 leading-relaxed border-t border-[#30363d]/60 pt-3">
              {patternInfo.description}
            </p>
          </div>
        </div>
      )}

      {/* ================= EXCLUSIVE ENGLISH VS HINGLISH EXPLANATION ================= */}
      {visualData && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm space-y-5">
          
          {/* TAB HEADER: TOGGLE BETWEEN ENGLISH AND HINGLISH */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d]/80 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="text-blue-400" size={18} />
              Solution Walkthrough
            </h2>

            {/* SEGMENTED TAB TOGGLE (ENGLISH HIDES HINGLISH, HINGLISH HIDES ENGLISH) */}
            <div className="bg-[#0d1117] border border-[#30363d] p-1 rounded-xl flex items-center self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setExplanationLang("english")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  explanationLang === "english"
                    ? "bg-[#21262d] text-white shadow-sm border border-[#30363d]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🇬🇧 English
              </button>

              <button
                type="button"
                onClick={loadHinglishExplanation}
                disabled={hindiLoading}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  explanationLang === "hinglish"
                    ? "bg-[#21262d] text-yellow-400 shadow-sm border border-[#30363d]"
                    : "text-gray-400 hover:text-yellow-400"
                }`}
              >
                {hindiLoading ? "Translating..." : "🇮🇳 Hinglish"}
              </button>
            </div>
          </div>

          {/* VIEW 1: ENGLISH (Completely hides Hinglish) */}
          {explanationLang === "english" && (
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 leading-relaxed animate-fadeIn">
              <ReactMarkdown
                components={{
                  pre: () => null,
                  code: () => null,
                  h2: ({ node, ...props }) => (
                    <h3 className="text-sm sm:text-base font-bold text-white mt-5 mb-2 pb-1 border-b border-[#30363d]/60">
                      {props.children}
                    </h3>
                  ),
                }}
              >
                {visualData.visualization}
              </ReactMarkdown>
            </div>
          )}

          {/* VIEW 2: HINGLISH (Completely hides English) */}
          {explanationLang === "hinglish" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
                🇮🇳 आसान भाषा में हिंदी / Hinglish एक्सप्लेनेशन
              </div>

              {hindiExplain ? (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 leading-relaxed">
                  <ReactMarkdown>{hindiExplain}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-6">
                  <button
                    type="button"
                    onClick={loadHinglishExplanation}
                    disabled={hindiLoading}
                    className="bg-[#21262d] hover:bg-[#161b22] text-yellow-400 border border-[#30363d] px-4 py-2 rounded-xl text-xs font-medium"
                  >
                    {hindiLoading ? "Translating..." : "Load Hinglish Explanation"}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ================= CODE EDITOR & DEBUGGER ================= */}
      {visualData && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d]/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="text-emerald-400" size={18} />
                Code Editor & Debugger
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Paste your solution to check syntax and test edge cases.
              </p>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] px-3 py-1.5 rounded-xl text-xs font-medium text-white hover:border-gray-500 transition cursor-pointer"
              >
                <FileCode size={14} className="text-blue-400" />
                <span>{LANGUAGES.find((l) => l.id === language)?.name}</span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl z-30 p-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleLanguageChange(l.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        language === l.id
                          ? "bg-[#21262d] text-white border border-[#30363d]"
                          : "text-gray-300 hover:bg-[#21262d]"
                      }`}
                    >
                      <span>{l.name}</span>
                      {language === l.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EDITOR CANVAS */}
          <div className="border border-[#30363d] rounded-xl overflow-hidden bg-[#0d1117]">
            {/* Editor Top Bar */}
            <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-gray-300 font-medium">
                  Solution{LANGUAGES.find((l) => l.id === language)?.ext}
                </span>

                {syntaxCheck.hasError ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-medium">
                    <AlertTriangle size={11} />
                    <span>Syntax issue ({syntaxCheck.errors.length})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 size={11} />
                    <span>Syntax ok</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetCode}
                  title="Reset template"
                  className="p-1 hover:text-white transition cursor-pointer"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Copy code"
                  className="p-1 hover:text-white transition cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Error Message Bar */}
            {syntaxCheck.hasError && (
              <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-1.5 text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle size={13} className="shrink-0" />
                <span className="truncate">
                  Line {syntaxCheck.errors[0]?.line}: {syntaxCheck.errors[0]?.message}
                </span>
              </div>
            )}

            {/* Code Lines and Textarea */}
            <div className="flex min-h-[220px] font-mono text-xs sm:text-sm">
              <div className="w-10 bg-[#0d1117] text-gray-600 border-r border-[#30363d]/60 select-none py-3 text-right pr-2 space-y-1 shrink-0">
                {codeLines.map((_, i) => {
                  const lineNum = i + 1;
                  const isErr = errorLineSet.has(lineNum);
                  return (
                    <div
                      key={lineNum}
                      className={`leading-5 text-[11px] ${isErr ? "text-red-400 font-bold" : ""}`}
                    >
                      {lineNum}
                    </div>
                  );
                })}
              </div>

              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="Write your solution here..."
                spellCheck="false"
                className={`flex-1 p-3 bg-transparent text-emerald-400 font-mono text-xs sm:text-sm leading-5 resize-y outline-none ${
                  syntaxCheck.hasError ? "syntax-error-wavy" : ""
                }`}
              />
            </div>
          </div>

          {/* RUN BUTTON: GREY WITHOUT HOVER, DARK GREY ON HOVER */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#161b22] text-gray-200 hover:text-white border border-[#30363d] hover:border-gray-500 font-medium px-5 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Play size={14} />
              <span>{analyzing ? "Analyzing..." : "Run & Analyze"}</span>
            </button>
          </div>

          {analysis && <AnalysisResult analysis={analysis} />}

        </div>
      )}

    </div>
  );
}

function AnalysisResult({ analysis }) {
  const [showCode, setShowCode] = useState(false);
  const isCorrect = analysis.includes("STATUS: CORRECT");
  const codeStart = analysis.indexOf("## 💻");
  const codeSection = codeStart !== -1 ? analysis.substring(codeStart) : "";
  const beforeCode = codeStart !== -1 ? analysis.substring(0, codeStart) : analysis;

  return (
    <div className="mt-5 space-y-4 animate-fadeIn">
      <div
        className={`p-4 rounded-xl border ${
          isCorrect
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}
      >
        <div className="flex items-center gap-2 mb-2 font-semibold text-sm sm:text-base text-white">
          {isCorrect ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={18} className="text-red-400" />
          )}
          <span>{isCorrect ? "Solution Accepted" : "Suggestions & Fixes"}</span>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 mt-2">
          <ReactMarkdown>
            {beforeCode.replace("STATUS: CORRECT", "").replace("STATUS: WRONG", "")}
          </ReactMarkdown>
        </div>
      </div>

      {codeSection && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="text-xs text-blue-400 hover:underline cursor-pointer"
          >
            {showCode ? "Hide Reference Solution" : "View Reference Solution"}
          </button>

          {showCode && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-emerald-400 text-xs font-mono overflow-x-auto">
              <ReactMarkdown>{codeSection}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
