import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home/Home";
import Settings from "./pages/Settings/Settings";
import DailyContest from "./pages/DailyContest/DailyContest";
import Help from "./pages/Help/help";
import Visualize from "./pages/Visualize/Visualize";
import Revision from "./pages/Revision/Revision";

function App() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col transition-colors duration-300">
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#161b22",
            color: "#fff",
            border: "1px solid #30363d",
          },
        }}
      />

      {/* Sticky Capsule Navbar */}
      <Navbar />

      <div className="flex flex-1 flex-col w-full">
        {/* Main Content */}
        <main className="flex-1 w-full px-3 sm:px-6 py-4 sm:py-6 md:py-8 pb-24 md:pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/daily-contest" element={<DailyContest />} />
            <Route path="/help" element={<Help />} />
            <Route path="/visualize" element={<Visualize />} />
            <Route path="/revision" element={<Revision />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
