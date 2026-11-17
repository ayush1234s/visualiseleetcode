import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Brain, Camera, Clock3, Code2, FileText, LoaderCircle, Paperclip, Send, ShieldAlert, Sparkles, Trash2, UserRound, X } from "lucide-react";
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

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
  reader.readAsDataURL(file);
});

const prepareImage = async (file) => {
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.78));
  } finally {
    URL.revokeObjectURL(source);
  }
};

const TEXT_FILE_EXTENSIONS = /\.(txt|md|csv|json|js|jsx|ts|tsx|html|css|py|java|cpp|c|h|sql|xml|yaml|yml|log)$/i;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const CHAT_BUTTON_SIZE = 56;

const getInitialChatPosition = () => {
  const fallback = { x: window.innerWidth - 36, y: window.innerHeight - 36 };
  try {
    const saved = JSON.parse(localStorage.getItem("aiChatPosition") || "null");
    if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) {
      return {
        x: Math.max(CHAT_BUTTON_SIZE / 2 + 8, Math.min(window.innerWidth - CHAT_BUTTON_SIZE / 2 - 8, saved.x)),
        y: Math.max(CHAT_BUTTON_SIZE / 2 + 8, Math.min(window.innerHeight - CHAT_BUTTON_SIZE / 2 - 8, saved.y)),
      };
    }
  } catch {
    // Ignore an invalid saved position and use the default corner.
  }
  return fallback;
};

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [screenshotting, setScreenshotting] = useState(false);
  const [chatPosition, setChatPosition] = useState(getInitialChatPosition);
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const endRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);
  const suppressNextClickRef = useRef(false);
  const chatSessionRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setProfileLoading(true);
    getDoc(doc(db, "users", getUserId()))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.exists() ? snapshot.data() : {};
        const savedName = data.aiProfile?.name || localStorage.getItem("aiUserName");
        if (savedName) setProfile({ name: savedName });
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

  useEffect(() => {
    const handleResize = () => {
      const nextViewport = { width: window.innerWidth, height: window.innerHeight };
      setViewport(nextViewport);
      setChatPosition((current) => ({
        x: Math.max(CHAT_BUTTON_SIZE / 2 + 8, Math.min(nextViewport.width - CHAT_BUTTON_SIZE / 2 - 8, current.x)),
        y: Math.max(CHAT_BUTTON_SIZE / 2 + 8, Math.min(nextViewport.height - CHAT_BUTTON_SIZE / 2 - 8, current.y)),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startDragging = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: chatPosition.x, y: chatPosition.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragChatButton = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    const nextPosition = {
      x: Math.max(CHAT_BUTTON_SIZE / 2 + 8, Math.min(window.innerWidth - CHAT_BUTTON_SIZE / 2 - 8, drag.x + dx)),
      y: Math.max(CHAT_BUTTON_SIZE / 2 + 8, Math.min(window.innerHeight - CHAT_BUTTON_SIZE / 2 - 8, drag.y + dy)),
    };
    drag.lastPosition = nextPosition;
    setChatPosition(nextPosition);
  };

  const finishDragging = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
      suppressNextClickRef.current = true;
      const finalPosition = drag.lastPosition || chatPosition;
      setChatPosition(finalPosition);
      localStorage.setItem("aiChatPosition", JSON.stringify(finalPosition));
    }
    dragRef.current = null;
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileLoading(true);
    const details = { name: name.trim() };
    try {
      await setDoc(doc(db, "users", getUserId()), { aiProfile: details }, { merge: true });
      localStorage.setItem("aiUserName", details.name);
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
    if ((!content && attachments.length === 0) || sending) return;
    const chatSession = chatSessionRef.current;
    const history = messages;
    const messageText = content || "Please take a look at the attached file(s).";
    const sentAttachments = attachments;
    setMessages((current) => [...current, { role: "user", content: messageText, attachments: sentAttachments, sentAt: Date.now() }]);
    setDraft("");
    setAttachments([]);
    setAttachmentError("");
    setSending(true);
    try {
      if (!sentAttachments.length && /\b(time|date|today|what day|current time|current date|samay|waqt|tareekh|aaj ki date|aaj ka din|abhi kitne baje)\b/i.test(content)) {
        const now = new Date();
        const reply = `Abhi aapke local time ke hisaab se **${new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(now)}** hai. ⏰`;
        if (chatSession === chatSessionRef.current) setMessages((current) => [...current, { role: "assistant", content: reply, sentAt: Date.now() }]);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversation: history.slice(-8).map(({ role, content: itemContent }) => ({ role, content: itemContent })),
          attachments: sentAttachments.map(({ name: fileName, type, data, text }) => ({ name: fileName, type, data, text })),
        }),
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

  const addFiles = async (fileList) => {
    setAttachmentError("");
    const files = Array.from(fileList || []);
    const remaining = Math.max(0, 3 - attachments.length);
    if (files.length > remaining) {
      setAttachmentError("You can attach up to 3 files per message.");
      return;
    }
    const next = [];
    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setAttachmentError(`${file.name} is over 8 MB. Please choose a smaller file.`);
        continue;
      }
      try {
        if (file.type.startsWith("image/")) {
          const blob = await prepareImage(file);
          if (!blob) throw new Error(`Could not prepare ${file.name}.`);
          const data = await readAsDataUrl(blob);
          next.push({ id: crypto.randomUUID(), name: file.name, type: "image/jpeg", data, preview: URL.createObjectURL(blob) });
        } else {
          const text = TEXT_FILE_EXTENSIONS.test(file.name) ? (await file.text()).slice(0, 100000) : "";
          next.push({ id: crypto.randomUUID(), name: file.name, type: file.type || "application/octet-stream", text, size: file.size });
        }
      } catch (error) {
        setAttachmentError(error.message || `Could not add ${file.name}.`);
      }
    }
    setAttachments((current) => [...current, ...next].slice(0, 3));
  };

  const captureScreenshot = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setAttachmentError("Screenshot capture is not supported in this browser. Try attaching an image instead.");
      return;
    }
    setAttachmentError("");
    flushSync(() => {
      setScreenshotting(true);
      setOpen(false);
    });
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser" }, audio: false, preferCurrentTab: true });
      const displaySurface = stream.getVideoTracks()[0]?.getSettings().displaySurface;
      if (displaySurface && displaySurface !== "browser") throw new Error("Please choose this browser tab in the sharing dialog to capture the website.");
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
      if (!blob) throw new Error("Could not capture this tab. Please try again.");
      const file = new File([blob], `website-screenshot-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.jpg`, { type: "image/jpeg" });
      await addFiles([file]);
      setOpen(true);
    } catch (error) {
      if (error.name !== "NotAllowedError" && error.name !== "AbortError") setAttachmentError(error.message || "Could not take a screenshot.");
      setOpen(true);
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
      setScreenshotting(false);
    }
  };

  const panelOnRight = chatPosition.x >= viewport.width / 2;
  const panelOnBottom = chatPosition.y >= viewport.height / 2;

  return (
    <>
      {open && !screenshotting && (
        <section aria-label="Visualize LC AI chat" style={{ left: panelOnRight ? "auto" : 12, right: panelOnRight ? 12 : "auto", top: panelOnBottom ? "auto" : 88, bottom: panelOnBottom ? 88 : "auto" }} className="fixed z-[120] flex h-[min(680px,calc(100dvh-8rem))] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] text-white shadow-[0_24px_80px_rgba(0,0,0,0.62)]">
          <header className="flex shrink-0 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 text-[#58a6ff] shadow-sm"><Brain size={22} /><Sparkles className="absolute -right-1 -top-1 rounded-full bg-[#161b22] p-0.5 text-cyan-300" size={15} /></div>
              <div><h2 className="text-sm font-bold tracking-wide">Visualize <span className="text-blue-400">LC</span> AI</h2><p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Your coding sidekick</p></div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && <button type="button" onClick={() => { chatSessionRef.current += 1; messages.flatMap((item) => item.attachments || []).forEach((file) => file.preview && URL.revokeObjectURL(file.preview)); setMessages([]); }} aria-label="Clear entire chat" title="Clear chat" className="rounded-xl p-2.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"><Trash2 size={16} /></button>}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close AI chat" className="rounded-xl p-2.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"><X size={18} /></button>
            </div>
          </header>

          {profileLoading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400"><LoaderCircle className="mr-2 animate-spin" size={17} />Loading your chat…</div>
          ) : !profile ? (
            <div className="flex flex-1 flex-col justify-center overflow-y-auto p-5">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300"><Sparkles size={21} /></div>
              <h3 className="text-lg font-semibold">Let’s get to know you</h3>
              <p className="mb-5 mt-1.5 text-sm leading-6 text-gray-400">What should your coding sidekick call you? I’ll remember your name next time.</p>
              <form onSubmit={saveProfile} className="space-y-3">
                <label className="block text-xs font-medium text-gray-300">Your name<input required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#30363d] bg-[#080b0f] px-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-300" /></label>
                {profileError && <p role="alert" className="text-xs leading-5 text-red-300">{profileError}</p>}
                <button disabled={profileLoading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">{profileLoading ? <LoaderCircle size={16} className="animate-spin" /> : "Let’s go ✨"}</button>
              </form>
              <p className="mt-4 text-[11px] leading-5 text-gray-500">Your details are saved to your Visualize LC Firebase profile.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-[#30363d]/70 bg-[#0d1117] px-4 py-3"><p className="text-sm font-semibold text-white">Hey {profile.name}, what are we solving today?</p><p className="mt-1 text-xs text-gray-400">Your DSA and website questions, answered.</p><div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">{[{ icon: <Code2 size={13}/>, label: "Explain DSA" }, { icon: <Clock3 size={13}/>, label: "Current time" }].map(({ icon, label }) => <button key={label} type="button" onClick={() => setDraft(label === "Current time" ? "What time is it right now?" : "Explain DSA with a simple example")} className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-[11px] font-medium text-gray-300 transition hover:border-blue-400/60 hover:text-blue-300">{icon}{label}</button>)}</div></div>
              <div className="flex items-start gap-2.5 border-b border-[#30363d]/70 bg-amber-400/[0.035] px-4 py-2.5 text-[10px] leading-[1.45] text-gray-400"><ShieldAlert className="mt-px shrink-0 text-amber-300/80" size={14}/><span>Keep personal details private. Never share your phone, address, or credit/debit card number here.</span></div>
              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5" aria-live="polite">
                {messages.length === 0 && <div className="flex min-h-full flex-col items-center justify-center pb-4 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-[#58a6ff]"><Brain size={29}/></div><h3 className="text-base font-semibold text-gray-100">Big idea or tiny bug?</h3><p className="mt-2 max-w-[260px] text-xs leading-5 text-gray-500">Ask about Visualize LC, DSA, or paste your code and we’ll figure it out together.</p><p className="mt-4 text-[10px] text-gray-600">Try a prompt above to get started</p></div>}
                {messages.map((item, index) => {
                  const isUser = item.role === "user";
                  const Avatar = UserRound;
                  return (
                    <div key={`${index}-${item.role}`} className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <div aria-label={isUser ? "You" : "Visualize LC AI"} className={`mb-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isUser ? "bg-blue-500/10 text-blue-300" : "bg-cyan-500/10 text-cyan-300"}`}>{isUser ? <Avatar size={14} /> : <Brain size={15}/>}</div>
                      <div className={`flex min-w-0 max-w-[84%] flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <span className={`mb-1.5 px-1 text-[10px] font-semibold tracking-wide ${isUser ? "text-blue-300/80" : "text-cyan-300/80"}`}>{isUser ? "YOU" : "VISUALIZE LC AI"}</span>
                        <div className={`rounded-2xl px-4 py-3 text-[13px] leading-[1.65] ${isUser ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md border border-[#30363d] bg-[#161b22] text-gray-200"}`}>
                          {item.attachments?.length > 0 && <div className={`mb-2 grid gap-2 ${item.attachments.some((file) => file.type.startsWith("image/")) ? "grid-cols-2" : "grid-cols-1"}`}>{item.attachments.map((file) => file.type.startsWith("image/") ? <a key={file.id} href={file.preview || file.data} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-white/10"><img src={file.preview || file.data} alt={file.name} className="max-h-40 w-full object-cover"/><span className="block truncate bg-black/20 px-2 py-1 text-[10px]">{file.name}</span></a> : <div key={file.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-2.5 py-2"><FileText size={16} className="shrink-0 opacity-70"/><span className="min-w-0 flex-1 truncate text-xs">{file.name}</span><span className="shrink-0 text-[10px] opacity-60">{file.text ? "included" : "attached"}</span></div>)}</div>}
                          <ReactMarkdown components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>, ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>, ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>, code: ({ children }) => <code className={`rounded-md px-1.5 py-0.5 font-mono text-[0.9em] ${isUser ? "bg-white/15 text-white" : "bg-black/30 text-cyan-100"}`}>{children}</code>, pre: ({ children }) => <pre className="my-2 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/30 p-3 font-mono text-xs">{children}</pre>, a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-cyan-300 underline underline-offset-2">{children}</a> }}>{item.content}</ReactMarkdown>
                        </div>
                        <div className={`mt-1.5 flex items-center gap-1 px-1 text-[10px] text-slate-600 ${isUser ? "flex-row-reverse" : ""}`}><time dateTime={new Date(item.sentAt || Date.now()).toISOString()}>{formatMessageTime(item.sentAt || Date.now())}</time>{isUser && <span className="text-cyan-400">✓✓</span>}</div>
                      </div>
                    </div>
                  );
                })}
                {sending && <div className="flex items-end gap-2.5"><div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300"><Brain size={15}/></div><div className="rounded-2xl rounded-bl-md border border-[#30363d] bg-[#161b22] px-4 py-3"><span className="mb-2 block text-[10px] font-semibold tracking-wide text-cyan-300/80">VISUALIZE LC AI</span><div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.25s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.12s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300"/><span className="ml-1 text-[11px] text-gray-500">Thinking</span></div></div></div>}
                <div ref={endRef} />
              </div>
              <form onSubmit={sendMessage} className="shrink-0 border-t border-[#30363d] bg-[#161b22] px-4 pb-3 pt-3 sm:px-5">
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.html,.css,.py,.java,.cpp,.sql" className="hidden" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} />
                {attachments.length > 0 && <div className="mb-2 flex gap-2 overflow-x-auto pb-1">{attachments.map((file) => <div key={file.id} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#141c28]">{file.type.startsWith("image/") ? <img src={file.preview} alt={file.name} className="h-full w-full object-cover"/> : <div className="flex h-full flex-col items-center justify-center px-1 text-cyan-100"><FileText size={17}/><span className="w-full truncate text-center text-[8px]">{file.name}</span></div>}<button type="button" aria-label={`Remove ${file.name}`} onClick={() => { if (file.preview) URL.revokeObjectURL(file.preview); setAttachments((current) => current.filter((item) => item.id !== file.id)); }} className="absolute right-0.5 top-0.5 rounded-full bg-black/75 p-0.5 text-white"><X size={11}/></button></div>)}</div>}
                {attachmentError && <p role="alert" className="mb-2 text-[11px] text-rose-300">{attachmentError}</p>}
                <div className="flex items-end gap-2 rounded-xl border border-[#30363d] bg-[#0d1117] p-2 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/10">
                  <button type="button" disabled={attachments.length >= 3} onClick={() => fileInputRef.current?.click()} aria-label="Attach photos or documents" title="Attach photos or documents" className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-[#21262d] hover:text-[#58a6ff] disabled:opacity-30"><Paperclip size={17}/></button>
                  <button type="button" disabled={attachments.length >= 3 || screenshotting} onClick={captureScreenshot} aria-label="Take website screenshot" title="Take screenshot of this tab" className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-[#21262d] hover:text-[#58a6ff] disabled:opacity-30"><Camera size={17}/></button>
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={12000} aria-label="Message Visualize LC AI" placeholder="Message your coding sidekick..." className="max-h-28 min-h-10 flex-1 resize-y bg-transparent px-2.5 py-2 text-[13px] leading-5 text-white outline-none placeholder:text-slate-600" />
                  <button type="submit" disabled={(!draft.trim() && attachments.length === 0) || sending} aria-label="Send message" className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-30"><Send className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={16} /></button>
                </div>
                <p className="mt-1.5 text-center text-[9px] text-slate-600">Images and text files are readable by AI; PDF/Word files attach as references. Screenshots capture this tab.</p>
                <p className="mt-2 text-center text-[10px] tracking-wide text-slate-600">ENTER TO SEND <span className="mx-1 text-slate-700">·</span> SHIFT + ENTER FOR NEW LINE</p>
              </form>
            </>
          )}
        </section>
      )}
      {!screenshotting && <button type="button" onPointerDown={startDragging} onPointerMove={dragChatButton} onPointerUp={finishDragging} onPointerCancel={finishDragging} onClick={() => { if (suppressNextClickRef.current) { suppressNextClickRef.current = false; return; } setOpen((value) => !value); }} style={{ left: chatPosition.x - CHAT_BUTTON_SIZE / 2, top: chatPosition.y - CHAT_BUTTON_SIZE / 2, touchAction: "none" }} aria-label={open ? "Close Visualize LC AI or drag to move" : "Open Visualize LC AI or drag to move"} title="Drag to move · click to chat" className="fixed z-[120] flex h-14 w-14 cursor-grab items-center justify-center rounded-full border border-blue-400/40 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-[0_8px_28px_rgba(37,99,235,0.38)] transition hover:scale-105 hover:brightness-110 active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-[#0d1117]">{open ? <X size={22} /> : <Brain className="ai-float" size={26} />}</button>}
    </>
  );
}
