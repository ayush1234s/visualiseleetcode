export default function StatsCard({ title, value, color }) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 
                    flex justify-between items-center hover:border-[#58a6ff] 
                    transition-all duration-200">

      <span className="text-sm text-gray-400">{title}</span>

      <span className={`text-sm font-semibold ${color || "text-white"}`}>
        {value}
      </span>
    </div>
  );
}