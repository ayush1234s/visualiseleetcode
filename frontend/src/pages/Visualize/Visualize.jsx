import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function Visualize() {

    const [questionNumber, setQuestionNumber] = useState("");
    const [visualData, setVisualData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [userCode, setUserCode] = useState("");
    const [analysis, setAnalysis] = useState(null);

    /* ================= FETCH QUESTION ================= */
    const handleVisualize = async () => {
        if (!questionNumber) {
            setError("Please enter a question number.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setVisualData(null);
            setAnalysis(null);

            const res = await axios.post(
                "http://localhost:5000/api/visualize",
                { questionNumber }
            );

            setVisualData(res.data);

        } catch {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    /* ================= ANALYZE USER CODE ================= */
    const handleAnalyze = async () => {
        if (!userCode) return;

        const res = await axios.post(
            "http://localhost:5000/api/visualize/analyze",
            {
                questionTitle: visualData.question,
                userCode,
            }
        );

        setAnalysis(res.data.analysis);
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">

            {/* ================= INPUT ================= */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 space-y-6">

                <h1 className="text-3xl font-bold text-white">
                    Visualize LeetCode Problem
                </h1>

                <input
                    type="number"
                    placeholder="Enter Question Number"
                    value={questionNumber}
                    onChange={(e) => setQuestionNumber(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white"
                />

                <button
                    onClick={handleVisualize}
                    className="border border-blue-400 text-blue-400 px-6 py-2 rounded-lg hover:bg-blue-400 hover:text-black transition"
                >
                    {loading ? "Loading..." : "Visualize"}
                </button>

                {error && <p className="text-red-400">{error}</p>}
            </div>

            {/* ================= EXPLANATION ================= */}
            {visualData && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8">

                    <h2 className="text-2xl font-bold text-white mb-6">
                        {visualData.question}
                    </h2>

                    <ReactMarkdown
                        components={{
                            pre: () => null,
                            code: () => null,

                            h2: ({ node, ...props }) => {
                                const text = props.children?.toString() || "";

                                return (
                                    <>
                                        <h2 className="text-2xl font-bold mt-10 mb-4 text-purple-400">
                                            {text}
                                        </h2>

                                        {text.includes("C++ Implementation") && (
                                            <div className="bg-[#0d1117] border border-yellow-500 text-yellow-400 p-5 rounded-xl mt-4 text-sm">
                                                ⚠️ <strong>Note:</strong> You have to Debug your Wrong code below in the Debug block then Analyze and You got the issue and Full code Access.
                                            </div>
                                        )}
                                    </>
                                );
                            },
                        }}
                    >
                        {visualData.visualization}
                    </ReactMarkdown>

                </div>
            )}

            {/* ================= DEBUG SECTION ================= */}
            {visualData && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 space-y-6">

                    <h2 className="text-2xl font-bold text-white">
                        🧪 Debug Your Code
                    </h2>

                    <textarea
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        placeholder="Paste your C++ code here..."
                        className="w-full h-60 bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-green-400 font-mono"
                    />

                    <button
                        onClick={handleAnalyze}
                        className="border border-red-400 text-red-400 px-6 py-2 rounded-lg hover:bg-red-400 hover:text-black transition"
                    >
                        Analyze Code
                    </button>

                    {analysis && <AnalysisResult analysis={analysis} />}
                </div>
            )}

        </div>
    );
}

/* ================= ANALYSIS RESULT ================= */
function AnalysisResult({ analysis }) {

  const [showCode, setShowCode] = useState(false);

  const isCorrect = analysis.includes("STATUS: CORRECT");

  const codeStart = analysis.indexOf("## 💻");
  const codeSection = codeStart !== -1 ? analysis.substring(codeStart) : "";

  const beforeCode = codeStart !== -1 ? analysis.substring(0, codeStart) : analysis;

  return (
    <div className="mt-6 space-y-6">

      {/* CORRECT CASE */}
      {isCorrect ? (
        <div className="bg-[#0d1117] p-6 rounded-xl border border-green-500 text-green-400">
          <ReactMarkdown>
            {beforeCode.replace("STATUS: CORRECT", "")}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="bg-[#0d1117] p-6 rounded-xl border border-red-500 text-gray-300">
          <ReactMarkdown>
            {beforeCode.replace("STATUS: WRONG", "")}
          </ReactMarkdown>
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={() => setShowCode(!showCode)}
        className="border border-green-400 text-green-400 px-6 py-2 rounded-lg hover:bg-green-400 hover:text-black transition"
      >
        {showCode ? "Hide Full Code" : "Show Full Code"}
      </button>

      {/* FULL CODE */}
      {showCode && (
        <div className="bg-[#0d1117] p-6 rounded-xl border border-[#30363d] text-green-400 overflow-x-auto">
          <ReactMarkdown>{codeSection}</ReactMarkdown>
        </div>
      )}

    </div>
  );
}