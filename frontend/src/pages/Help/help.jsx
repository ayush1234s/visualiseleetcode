import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown, ArrowUpRight, BookOpen, CheckCircle2, ChevronDown, Code2,
  Compass, HelpCircle, Mail, MessageCircle, Send, Sparkles,
} from "lucide-react";
import { db } from "../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const faq = [
  {
    category: "About the site",
    question: "What is Visualize Leet Code?",
    answer: "It is a practice companion for people learning problem solving. You can view coding activity from LeetCode and Codeforces, explore visual explanations for problems, review your solutions, and plan revision and contest reminders.",
    hiQuestion: "Visualize Leet Code क्या है?",
    hiAnswer: "यह problem solving सीखने वालों के लिए एक अभ्यास साथी है। यहाँ आप LeetCode और Codeforces की activity देख सकते हैं, सवालों को visual तरीके से समझ सकते हैं, अपने code को देख सकते हैं और revision व contest की याद दिलाने का समय तय कर सकते हैं।",
  },
  {
    category: "About the site",
    question: "Do I need to create an account?",
    answer: "You do not need to sign in. The site creates a browser ID to save your linked usernames and planner data. Your saved settings are associated with this browser, so they may not appear on another device or after clearing browser storage.",
    hiQuestion: "क्या मुझे account बनाना होगा?",
    hiAnswer: "Sign in करने की ज़रूरत नहीं है। यह site आपके usernames और planner की जानकारी save करने के लिए browser ID बनाती है। यह जानकारी इसी browser से जुड़ी रहती है, इसलिए दूसरे device या browser data साफ़ करने पर नहीं दिख सकती।",
  },
  {
    category: "Dashboard",
    question: "How do I connect my LeetCode or Codeforces profile?",
    answer: "Open Settings, enter your public username for either platform, and save. Return to the Dashboard to see the activity and recent submissions the site can load for that profile. A profile must be public and the username must be spelled correctly.",
    hiQuestion: "LeetCode या Codeforces profile कैसे जोड़ूँ?",
    hiAnswer: "Settings खोलें, जिस platform को जोड़ना है उसका public username लिखें और save करें। फिर Dashboard पर जाकर उपलब्ध activity और हाल की submissions देखें। Profile public होना चाहिए और username सही लिखा होना चाहिए।",
  },
  {
    category: "Dashboard",
    question: "What can I see on the Dashboard?",
    answer: "The Dashboard brings your coding activity together: submission heatmaps, a LeetCode difficulty progress view, recent submissions, and the LeetCode problem of the day. Add the matching username in Settings to load platform data.",
    hiQuestion: "Dashboard पर क्या-क्या दिखता है?",
    hiAnswer: "Dashboard पर आपकी coding activity एक जगह दिखती है: submission heatmap, LeetCode के सवालों की difficulty के हिसाब से progress, हाल की submissions और आज का LeetCode सवाल। Data देखने के लिए Settings में उस platform का username जोड़ें।",
  },
  {
    category: "Learning tools",
    question: "How does the problem visualizer work?",
    answer: "Open Visualize, choose or search for a supported problem, then load its explanation. The page can show a step-by-step walkthrough and a pattern diagram. Some explanations can also be requested in Hinglish. Available problems and explanations depend on the data the service returns.",
    hiQuestion: "Problem visualizer कैसे काम करता है?",
    hiAnswer: "Visualize page खोलें, उपलब्ध सवाल चुनें या खोजें और उसकी explanation load करें। वहाँ सवाल को step-by-step समझाया जाता है और pattern का diagram भी दिख सकता है। कुछ explanations Hinglish में भी मिलती हैं। कौन-से सवाल उपलब्ध हैं, यह service के data पर निर्भर करता है।",
  },
  {
    category: "Learning tools",
    question: "Can I run code on the Visualize page?",
    answer: "The built-in editor lets you paste a solution, choose a programming language, check for common syntax issues, and request an analysis with suggestions and a reference solution when available. It is a learning aid; verify your code on the original platform before relying on it.",
    hiQuestion: "क्या Visualize page पर code चला सकता हूँ?",
    hiAnswer: "Built-in editor में अपना solution paste करें, programming language चुनें और आम syntax गलतियाँ देखें। आप code का analysis और सुझाव भी माँग सकते हैं; जहाँ उपलब्ध हो, reference solution भी दिखता है। इसे सीखने में मदद के लिए इस्तेमाल करें और code को original platform पर जाँचें।",
  },
  {
    category: "Learning tools",
    question: "Does the site submit solutions to LeetCode?",
    answer: "No. The editor is for reviewing and analyzing code in this app. To submit a solution or see whether it passes the platform's tests, open the problem on LeetCode and submit it there.",
    hiQuestion: "क्या यह site LeetCode पर solution submit करती है?",
    hiAnswer: "नहीं। यहाँ का editor code समझने और उसका analysis देखने के लिए है। Solution submit करने या platform के tests में जाँचने के लिए सवाल LeetCode पर खोलें और वहीं submit करें।",
  },
  {
    category: "Planning",
    question: "How do revision reminders work?",
    answer: "On the Revision page, enter a problem number, reminder email, and one or more weekdays, then schedule it. Your planned revisions appear in the tracker. You can also create a Google Calendar event. Email delivery depends on the reminder service being available.",
    hiQuestion: "Revision reminders कैसे काम करते हैं?",
    hiAnswer: "Revision page पर सवाल का number, reminder email और एक या अधिक दिन चुनकर schedule करें। तय किए गए revisions tracker में दिखेंगे। आप Google Calendar में भी event जोड़ सकते हैं। Email reminder मिलना reminder service की उपलब्धता पर निर्भर करता है।",
  },
  {
    category: "Planning",
    question: "Can I add a contest to my calendar?",
    answer: "Yes. On Daily Contest, browse the listed contests and use Remind Me to open a Google Calendar event with the contest details. You can also open the contest page from its Join Contest link.",
    hiQuestion: "क्या contest को calendar में जोड़ सकता हूँ?",
    hiAnswer: "हाँ। Daily Contest page पर contest देखें और Remind Me दबाएँ। इससे contest की जानकारी वाला Google Calendar event खुलेगा। Join Contest link से contest page भी खोल सकते हैं।",
  },
  {
    category: "Settings & troubleshooting",
    question: "How do I change the app theme?",
    answer: "Open Settings and choose Light or Dark under the interface theme options. The selected theme applies across the app.",
    hiQuestion: "App की theme कैसे बदलूँ?",
    hiAnswer: "Settings खोलें और interface theme में Light या Dark चुनें। चुनी हुई theme पूरे app पर लागू होगी।",
  },
  {
    category: "Settings & troubleshooting",
    question: "Why is my profile or activity not loading?",
    answer: "Check that the username is correct and the platform profile is public, then save it again in Settings. Also check your internet connection and try refreshing. Platform or service outages can temporarily prevent data from appearing.",
    hiQuestion: "मेरा profile या activity क्यों नहीं दिख रही?",
    hiAnswer: "Username सही है और platform profile public है, यह जाँचें। फिर Settings में username दोबारा save करें। Internet connection देखकर page refresh करें। Platform या service में दिक्कत होने पर data कुछ समय तक नहीं दिख सकता।",
  },
  {
    category: "Settings & troubleshooting",
    question: "How do I report a problem or share an idea?",
    answer: "Use the feedback form below. Include the page or feature you were using and what happened. Please do not include passwords or other private account information. A ticket number appears after a successful submission.",
    hiQuestion: "Problem बताने या अपना idea भेजने का तरीका क्या है?",
    hiAnswer: "नीचे दिए feedback form का इस्तेमाल करें। जिस page या feature पर थे और क्या हुआ, यह लिखें। Password या निजी account जानकारी न भेजें। Feedback सफलतापूर्वक भेजने पर ticket number दिखेगा।",
  },
];

const copy = {
  en: {
    eyebrow: "A little help goes a long way", title: "How can we help you?",
    intro: "Find quick answers about your coding dashboard, learning tools, and study reminders. Still stuck? Send us a note below.",
    browse: "Browse answers", faq: "Frequently asked questions", faqIntro: "Clear answers to help you get the most from your practice.",
    questions: "questions", contact: "Still have a question?", contactIntro: "Tell us what you’re trying to do and where you got stuck. We’ll take a look.",
    name: "Your name", email: "Email address", message: "Your question or feedback", nameHint: "How should we address you?", emailHint: "you@example.com", messageHint: "Share a little context so we can help…", submit: "Send feedback", sending: "Sending your note…", ticket: "Your message is on its way. Keep this ticket number for reference:", privacy: "Please don’t include passwords or private account details.", sent: "Thanks for reaching out!",
  },
  hi: {
    eyebrow: "थोड़ी सी मदद, बड़ी राहत", title: "हम आपकी कैसे मदद करें?",
    intro: "Dashboard, सीखने के tools और पढ़ाई के reminders के आसान जवाब यहाँ देखें। फिर भी मदद चाहिए? नीचे हमें लिखें।",
    browse: "जवाब देखें", faq: "अक्सर पूछे जाने वाले सवाल", faqIntro: "अपनी practice बेहतर करने के लिए आसान जवाब।",
    questions: "सवाल", contact: "आपका सवाल बाकी है?", contactIntro: "बताएँ कि आप क्या करना चाह रहे थे और कहाँ अटके। हम देखेंगे।",
    name: "आपका नाम", email: "Email address", message: "आपका सवाल या सुझाव", nameHint: "हम आपको किस नाम से बुलाएँ?", emailHint: "you@example.com", messageHint: "थोड़ी जानकारी लिखें ताकि हम मदद कर सकें…", submit: "Feedback भेजें", sending: "आपका संदेश भेज रहे हैं…", ticket: "आपका संदेश भेज दिया गया है। इस ticket number को संभालकर रखें:", privacy: "कृपया password या account की निजी जानकारी न लिखें।", sent: "लिखने के लिए धन्यवाद!",
  },
};

export default function Help() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => localStorage.getItem("helpLanguage") || "en");
  const [openIndex, setOpenIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const t = copy[language];

  const changeLanguage = (value) => {
    setLanguage(value);
    localStorage.setItem("helpLanguage", value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(language === "hi" ? "कृपया सभी जानकारी भरें।" : "Please fill in all fields.");
      return;
    }
    setLoading(true);
    const id = `TICKET-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    try {
      await addDoc(collection(db, "feedback"), {
        name: name.trim(), email: email.trim(), message: message.trim(),
        ticketId: id, createdAt: serverTimestamp(),
      });
      setTicketId(id);
      navigate(`/help?ticket=${id}`, { replace: true });
      toast.success(t.sent);
      setName(""); setEmail(""); setMessage("");
    } catch {
      toast.error(language === "hi" ? "संदेश नहीं भेजा जा सका। फिर से कोशिश करें।" : "We couldn’t send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(faq.map((item) => item.category))];
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 md:py-10 text-white">
      <div className="flex justify-start mb-6">
        <label className="inline-flex items-center gap-2.5 rounded-xl border border-[#30363d] bg-[#161b22] px-3 py-2 text-xs font-medium text-gray-300 shadow-sm">
          <span>{language === "hi" ? "भाषा" : "Language"}</span>
          <select aria-label="Help page language" value={language} onChange={(e) => changeLanguage(e.target.value)} className="border-0 bg-transparent py-0 pl-1 pr-6 text-sm text-white outline-none focus:ring-0">
            <option value="en">English</option><option value="hi">हिन्दी</option>
          </select>
        </label>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-[#30363d] bg-gradient-to-br from-[#172231] via-[#161b22] to-[#12241f] px-6 py-8 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-300"><Sparkles size={14} />{t.eyebrow}</span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">{t.intro}</p>
          <a href="#faq" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400">{t.browse}<ArrowDown size={16} /></a>
        </div>
        <div className="relative mt-8 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
          {[[Compass, language === "hi" ? "अपनी progress देखें" : "See your progress"], [BookOpen, language === "hi" ? "सवालों को समझें" : "Understand problems"], [MessageCircle, language === "hi" ? "सीधे मदद माँगें" : "Get help when stuck"]].map(([Icon, label]) => <div key={label} className="flex items-center gap-2.5 text-sm text-gray-300"><Icon size={16} className="text-emerald-400" />{label}</div>)}
        </div>
      </section>

      <section id="faq" className="scroll-mt-8 pt-10 sm:pt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><div className="flex items-center gap-2 text-blue-400"><HelpCircle size={17} /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Help center</span></div><h2 className="mt-2 text-2xl font-bold">{t.faq}</h2><p className="mt-1.5 text-sm text-gray-400">{t.faqIntro}</p></div>
          <span className="hidden rounded-full border border-[#30363d] px-3 py-1.5 text-xs text-gray-400 sm:block">{faq.length} {t.questions}</span>
        </div>
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{language === "hi" ? ({ "About the site": "वेबसाइट के बारे में", Dashboard: "डैशबोर्ड", "Learning tools": "सीखने के tools", Planning: "योजना और reminders", "Settings & troubleshooting": "सेटिंग और मदद" }[category]) : category}</h3>
              <div className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22]">
                {faq.map((item, index) => item.category === category && <div key={item.question} className="border-b border-[#30363d] last:border-b-0">
                  <button type="button" aria-expanded={openIndex === index} onClick={() => setOpenIndex(openIndex === index ? null : index)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/[0.025] sm:px-5">
                    <span className="flex items-start gap-3 text-sm font-medium leading-6 text-gray-100 sm:text-[15px]"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-semibold text-blue-300">{String(index + 1).padStart(2, "0")}</span>{language === "hi" ? item.hiQuestion : item.question}</span>
                    <ChevronDown size={17} className={`shrink-0 text-gray-500 transition-transform ${openIndex === index ? "rotate-180 text-blue-400" : ""}`} />
                  </button>
                  {openIndex === index && <div className="animate-fadeIn px-4 pb-4 pl-[3.25rem] pr-10 sm:px-5 sm:pb-5 sm:pl-[3.75rem]"><p className="max-w-3xl text-sm leading-7 text-gray-400">{language === "hi" ? item.hiAnswer : item.answer}</p></div>}
                </div>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-3xl border border-[#30363d] bg-[#161b22] sm:mt-12">
        <div className="grid md:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-[#30363d] bg-gradient-to-br from-[#172231] to-[#161b22] p-6 sm:p-8 md:border-b-0 md:border-r">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><Mail size={21} /></div>
            <h2 className="mt-5 text-2xl font-bold">{t.contact}</h2>
            <p className="mt-2 text-sm leading-7 text-gray-400">{t.contactIntro}</p>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-gray-500"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />{t.privacy}</p>
            {ticketId && <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4"><p className="text-sm leading-6 text-emerald-100">{t.ticket}</p><p className="mt-2 font-mono text-sm font-semibold tracking-wide text-emerald-300">{ticketId}</p></div>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-gray-300">{t.name}<input required maxLength={80} autoComplete="name" type="text" placeholder={t.nameHint} value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10" /></label>
              <label className="block text-xs font-medium text-gray-300">{t.email}<input required maxLength={254} autoComplete="email" type="email" placeholder={t.emailHint} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10" /></label>
            </div>
            <label className="block text-xs font-medium text-gray-300">{t.message}<textarea required maxLength={2000} rows={5} placeholder={t.messageHint} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 w-full resize-y rounded-xl border border-[#30363d] bg-[#0d1117] px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10" /></label>
            <div className="flex flex-col-reverse items-start justify-between gap-3 pt-1 sm:flex-row sm:items-center"><span className="text-xs text-gray-500">{message.length}/2000</span><button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? t.sending : t.submit}<Send size={15} /></button></div>
          </form>
        </div>
      </section>
      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-500"><Code2 size={13} />Built for your next breakthrough<ArrowUpRight size={12} /></div>
    </div>
  );
}
