import { Brain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0d1117] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Card Container */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.6)]">

          {/* Top Section - Centered */}
          <div className="flex flex-col items-center text-center space-y-4">

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Brain className="text-blue-400 w-5 h-5" />
              </div>
              <span className="text-lg font-semibold text-white">
                Visualize LC
              </span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              Track your LeetCode & Codeforces progress with
              GitHub-style heatmaps, daily challenges, and
              intelligent visualization tools.
            </p>

          </div>

          {/* Divider (Now visually in middle) */}
          <div className="border-t border-[#30363d] my-6" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>
              © {new Date().getFullYear()} Visualize LC. All rights reserved.
            </p>

            <p>
              Made with ❤️ by Ayush Srivastava
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}