import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LoaderCircle, RefreshCw, WifiOff } from "lucide-react";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home/Home";
import Settings from "./pages/Settings/Settings";
import DailyContest from "./pages/DailyContest/DailyContest";
import Help from "./pages/Help/help";
import Visualize from "./pages/Visualize/Visualize";
import Revision from "./pages/Revision/Revision";
import useInternetStatus from "./hooks/useInternetStatus";
import AIChat from "./components/AIChat/AIChat";

function App() {
  const { online, markOnline } = useInternetStatus();
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (online) setConnectionError(false);
  }, [online]);

  const checkConnection = async () => {
    if (!navigator.onLine) {
      setConnectionError(true);
      return;
    }

    setCheckingConnection(true);
    setConnectionError(false);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(`${window.location.origin}/favicon.ico?connection-check=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });
      markOnline();
    } catch {
      setConnectionError(true);
    } finally {
      window.clearTimeout(timeout);
      setCheckingConnection(false);
    }
  };

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

      <AIChat />

      {!online && <OfflineScreen checking={checkingConnection} hasError={connectionError} onCheck={checkConnection} />}
    </div>
  );
}

function OfflineScreen({ checking, hasError, onCheck }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex min-h-screen items-center justify-center overflow-y-auto bg-[#070b11]/90 px-5 py-10 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-title"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(59,130,246,0.15),transparent_55%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-[#30363d] bg-[#111821]/95 p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:p-9">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-blue-400/20 bg-blue-500/10 shadow-[0_0_45px_rgba(59,130,246,0.12)]">
          <img src="/logoBrain.png" alt="Visualize LC logo" className="h-14 w-14 object-contain" />
        </div>
        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-300">
          <WifiOff size={14} /> You’re offline
        </div>
        <h1 id="offline-title" className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">Hey there!</h1>
        <p className="mt-3 text-sm leading-7 text-gray-300 sm:text-base">
          Your internet connection is lost. Please reconnect to continue your preparation.
        </p>
        <button
          type="button"
          onClick={onCheck}
          disabled={checking}
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-wait disabled:opacity-70"
        >
          {checking ? <LoaderCircle size={17} className="animate-spin" /> : <RefreshCw size={16} />}
          {checking ? "Checking connection…" : "Check internet connection"}
        </button>
        {hasError && (
          <p role="alert" className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2.5 text-sm text-red-300">
            Connection lost. Go ahead and reconnect, then try again.
          </p>
        )}
        <p className="mt-5 text-xs text-gray-500">This page will return automatically once you’re back online.</p>
      </div>
    </div>
  );
}

export default App;
