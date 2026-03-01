import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";


import Home from "./pages/Home";
import Settings from "./pages/Settings";

function App() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">

      {/* Toast System */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#161b22",
            color: "#ffffff",
            border: "1px solid #30363d",
          },
          success: {
            iconTheme: {
              primary: "#238636",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ff5555",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* Floating Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Footer */}
     

    </div>
  );
}

export default App;