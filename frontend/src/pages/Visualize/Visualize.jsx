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

    const [hindiExplain, setHindiExplain] = useState("");
    const [hindiLoading, setHindiLoading] = useState(false);

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
            setHindiExplain("");

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

    /* ================= ANALYZE CODE ================= */

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

    /* ================= HINDI EXPLAIN ================= */

    const handleHindiExplain = async () => {

        setHindiLoading(true);

        const res = await axios.post(
            "http://localhost:5000/api/visualize/hindi",
            {
                questionTitle: visualData.question,
                explanation: visualData.visualization,
            }
        );

        setHindiExplain(res.data.hindi);

        setHindiLoading(false);

    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">

            {/* INPUT */}

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

            {/* ================= ENGLISH EXPLANATION ================= */}

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
                                                ⚠️ <strong>Note:</strong> If you want to see the code for the solution,

                                                paste your code in the Debug section below and analyze it.

                                                The AI ​​will point out your mistakes and tell you how to fix them, and then also give you the full correct code.
                                            </div>
                                        )}
                                    </>
                                );

                            },
                        }}
                    >
                        {visualData.visualization}
                    </ReactMarkdown>

                    {/* HINDI BUTTON */}

                    <div className="mt-8">

                        <button
                            onClick={handleHindiExplain}
                            className="border border-yellow-400 text-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition"
                        >
                            {hindiLoading ? "Explaining..." : "Explain in Hindi 🇮🇳"}
                        </button>

                    </div>

                </div>

            )}

            {/* ================= HINDI EXPLANATION ================= */}

            {hindiExplain && (

                <div className="bg-[#161b22] border border-yellow-500 rounded-2xl p-8">

                    <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                        🇮🇳 Hindi Explanation
                    </h2>

                    <ReactMarkdown
                        components={{
                            h2: ({ node, ...props }) => (
                                <h2 className="text-2xl font-bold text-yellow-400 mt-8 mb-4">
                                    {props.children}
                                </h2>
                            ),
                        }}
                    >
                        {hindiExplain}
                    </ReactMarkdown>

                    <div className="bg-[#0d1117] border border-yellow-500 text-yellow-400 p-5 rounded-xl mt-6 text-sm">
                        ⚠️ <strong>Note:</strong> Agar aap solution ka code dekhna chahte ho,
                        toh neeche Debug section mein apna code paste karo aur Analyze karo.
                        AI aapki galti batayega aur fix kaise krein ye bhi batayega, aur phir aapko full correct code milega.
                    </div>

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
    const codeSection =
        codeStart !== -1 ? analysis.substring(codeStart) : "";

    const beforeCode =
        codeStart !== -1 ? analysis.substring(0, codeStart) : analysis;

    return (

        <div className="mt-6 space-y-6">

            {isCorrect ? (

                <div className="bg-[#0d1117] p-6 rounded-xl border border-green-500 text-white-400">
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

            <button
                onClick={() => setShowCode(!showCode)}
                className="border border-green-400 text-green-400 px-6 py-2 rounded-lg hover:bg-green-400 hover:text-black transition"
            >
                {showCode ? "Hide Full Code" : "Show Full Code"}
            </button>

            {showCode && (

                <div className="bg-[#0d1117] p-6 rounded-xl border border-[#30363d] text-green-400 overflow-x-auto">
                    <ReactMarkdown>{codeSection}</ReactMarkdown>
                </div>

            )}

        </div>

    );

}