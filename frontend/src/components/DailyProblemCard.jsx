export default function DailyProblemCard({ problem }) {
  if (!problem) return null;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">

      <h2 className="text-lg font-semibold">
        LeetCode Problem of the Day
      </h2>

      <p className="text-sm text-gray-500">
        Daily coding challenge
      </p>

      <h3 className="text-md font-medium">
        {problem.title}
      </h3>

      <div className="flex gap-3">
        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">
          {problem.difficulty}
        </span>
      </div>

      <a
        href={problem.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center bg-[#0d1117] border border-[#30363d] py-3 rounded-lg hover:border-[#58a6ff] transition"
      >
        Solve Problem
      </a>
    </div>
  );
}