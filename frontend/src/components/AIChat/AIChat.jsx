import { useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, Send, Sparkles, Trash2, UserRound, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { API_BASE_URL } from "../../config/api";

const getUserId = () => {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem("userId", id);
  }
  return id;
};

const formatMessageTime = (timestamp) => new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
}).format(new Date(timestamp));

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const chatSessionRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setProfileLoading(true);
    getDoc(doc(db, "users", getUserId()))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.exists() ? snapshot.data() : {};
        if (data.aiProfile?.name && data.aiProfile?.email) setProfile(data.aiProfile);
      })
      .catch((error) => {
        console.error("Could not load AI profile:", error);
        if (active) setProfileError("Could not connect to Firebase. Please try opening the assistant again.");
      })
      .finally(() => active && setProfileLoading(false));
    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileLoading(true);
    const details = { name: name.trim(), email: email.trim().toLowerCase() };
    try {
      await setDoc(doc(db, "users", getUserId()), { aiProfile: details }, { merge: true });
      setProfile(details);
    } catch (error) {
      console.error("Could not save AI profile:", error);
      setProfileError("We could not save your details. Check your connection and try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    const chatSession = chatSessionRef.current;
    const history = messages;
    setMessages((current) => [...current, { role: "user", content, sentAt: Date.now() }]);
    setDraft("");
    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, conversation: history.slice(-8) }),
      });
      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        const localHost = /localhost|127\.0\.0\.1/i.test(API_BASE_URL);
        const hint = localHost
          ? "This page is using a local backend URL. Set VITE_BACKEND_URL to your deployed backend, then redeploy the frontend."
          : "The deployed backend may be missing the /api/chat route. Deploy the latest backend, then try again.";
        throw new Error(response.status === 404
          ? `AI chat endpoint returned 404. ${hint}`
          : `The AI server returned an unexpected response. ${hint}`);
      }
      if (!response.ok) throw new Error(data.error || "Could not get an AI response.");
      if (typeof data.reply !== "string") throw new Error("The AI server response was incomplete. Please try again.");
      if (chatSession === chatSessionRef.current) {
        setMessages((current) => [...current, { role: "assistant", content: data.reply, sentAt: Date.now() }]);
      }
    } catch (error) {
      if (chatSession === chatSessionRef.current) {
        setMessages((current) => [...current, { role: "assistant", content: `Sorry, I couldn't respond just now. ${error.message}`, sentAt: Date.now() }]);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <section aria-label="Visualize LC AI chat" className="fixed bottom-24 right-3 z-[120] flex h-[min(620px,calc(100dvh-8rem))] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] text-white shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:right-6">
          <header className="flex shrink-0 items-center justify-between border-b border-[#30363d] bg-[#111821] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300"><Bot size={22} /></div>
              <div><h2 className="text-sm font-semibold">Visualize LC AI</h2><p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Your DSA learning companion</p></div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && <button type="button" onClick={() => { chatSessionRef.current += 1; setMessages([]); }} aria-label="Clear entire chat" title="Clear chat" className="rounded-lg p-2 text-gray-400 transition hover:bg-red-400/10 hover:text-red-300"><Trash2 size={17} /></button>}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close AI chat" className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"><X size={18} /></button>
            </div>
          </header>

          {profileLoading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400"><LoaderCircle className="mr-2 animate-spin" size={17} />Loading your chat…</div>
          ) : !profile ? (
            <div className="flex flex-1 flex-col justify-center overflow-y-auto p-5">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300"><Sparkles size={21} /></div>
              <h3 className="text-lg font-semibold">Let’s get to know you</h3>
              <p className="mb-5 mt-1.5 text-sm leading-6 text-gray-400">Share your name and email to start chatting. I’ll remember your name for next time.</p>
              <form onSubmit={saveProfile} className="space-y-3">
                <label className="block text-xs font-medium text-gray-300">Full Name<input required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#30363d] bg-[#080b0f] px-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-400" /></label>
                <label className="block text-xs font-medium text-gray-300">Email Address<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#30363d] bg-[#080b0f] px-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-400" /></label>
                {profileError && <p role="alert" className="text-xs leading-5 text-red-300">{profileError}</p>}
                <button disabled={profileLoading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-60">{profileLoading ? <LoaderCircle size={16} className="animate-spin" /> : "Start chatting"}</button>
              </form>
              <p className="mt-4 text-[11px] leading-5 text-gray-500">Your details are saved to your Visualize LC Firebase profile.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-[#30363d]/70 px-4 py-3 text-sm leading-6 text-gray-300">Hi {profile.name}! You can ask anything about your problem in Visualize LC.</div>
              <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4" aria-live="polite">
                {messages.length === 0 && <div className="rounded-xl border border-[#30363d] bg-[#111821] p-3.5 text-sm leading-6 text-gray-300">Ask about an approach, an algorithm, or a tricky test case. Paste your code and I’ll point out mistakes; the reference answer is on the <a href="/visualize" onClick={() => setOpen(false)} className="text-blue-300 underline underline-offset-2">Visualize page</a>.</div>}
                {messages.map((item, index) => {
                  const isUser = item.role === "user";
                  const Avatar = isUser ? UserRound : Bot;
                  return (
                    <div key={`${index}-${item.role}`} className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <div aria-label={isUser ? "You" : "Visualize LC AI"} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-blue-500/15 text-blue-300" : "bg-violet-500/15 text-violet-300"}`}><Avatar size={15} /></div>
                      <div className={`flex min-w-0 max-w-[82%] flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${isUser ? "rounded-tr-md bg-blue-600 text-white" : "rounded-tl-md border border-[#30363d] bg-[#111821] text-gray-200"}`}><ReactMarkdown components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>, ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>, ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>, code: ({ children }) => <code className="rounded bg-black/20 px-1 py-0.5 text-[0.9em]">{children}</code> }}>{item.content}</ReactMarkdown></div>
                        <time dateTime={new Date(item.sentAt || Date.now()).toISOString()} className="mt-1 px-1 text-[10px] leading-4 text-gray-500">{formatMessageTime(item.sentAt || Date.now())}</time>
                      </div>
                    </div>
                  );
                })}
                {sending && <div className="flex items-center gap-2 text-xs text-gray-400"><LoaderCircle size={14} className="animate-spin" />Thinking…</div>}
                <div ref={endRef} />
              </div>
              <form onSubmit={sendMessage} className="flex shrink-0 items-end gap-2 border-t border-[#30363d] bg-[#111821] p-3">
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={12000} aria-label="Message Visualize LC AI" placeholder="Ask anything…" className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-[#30363d] bg-[#080b0f] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-400" />
                <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-45"><Send size={17} /></button>
              </form>
            </>
          )}
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close Visualize LC AI" : "Open Visualize LC AI"} title="Chat with Visualize LC AI" className="fixed bottom-5 right-5 z-[120] flex h-14 w-14 items-center justify-center rounded-full border border-blue-300/30 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_10px_35px_rgba(37,99,235,0.45)] transition hover:scale-105 hover:shadow-[0_12px_40px_rgba(37,99,235,0.6)] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-[#0d1117] sm:bottom-6 sm:right-6">{open ? <X size={23} /> : <Bot className="ai-float" size={26} />}</button>
    </>
  );
}
