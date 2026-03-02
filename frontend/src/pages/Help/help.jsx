import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const Help = () => {
  const navigate = useNavigate();

  const [openIndex, setOpenIndex] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState(null);

  const toggleCard = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const generateToken = () => {
    return (
      "TICKET-" +
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const token = generateToken();

      await addDoc(collection(db, "feedback"), {
        name,
        email,
        message,
        ticketId: token,
        createdAt: serverTimestamp(),
      });

      setTicketId(token);

      // Update URL without reload
      navigate(`/help?ticket=${token}`, { replace: true });

      toast.success("Feedback submitted successfully 🚀");

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast.error("Error submitting feedback");
    }

    setLoading(false);
  };

  const helpData = [
    {
      title: "Getting Started",
      content:
        "Learn how to use Visualize Leet Code effectively. Start by exploring the features and visualizations available."
    },
    {
      title: "Troubleshooting",
      content:
        "If you encounter any issues, check our troubleshooting guide for common problems and solutions."
    },
    {
      title: "Username Issues",
      content:
        "If you're having trouble with your username, check our guide on managing and resetting your username. Add your username in the settings page to get personalized features and better experience."
    },
    {
      title: "Visualize Patterns",
      content:
        "If you're having trouble visualizing patterns, check our guide on how to use the visualization tools effectively. Enter the problem number in the search bar and click on the visualize button to see the patterns. and Visualize problem in animated way to understand the problem better."
    },
    {
      title: "Revision",
      content:
        "If you want to revise a problem, check our guide on how to use the revision feature. You can add problems to your revision list and practice them regularly to improve your skills. By adding the week days of the problem to revise this will alert you on your email and mobile notifications to revise the problem on the selected week days. and in calendar you can see the problems added for revision on the selected week days."
    },
    {
      title: "Daily Contest",
      content:
        "If you're participating in a daily contest, check our guide on how to manage and participate in contests effectively. and check daily contest in Visualise Leet Code and remind the contest to your calendar and get notify you before the contest starts."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white py-14 px-6">
      <div className="max-w-4xl mx-auto space-y-14">

        {/* ================= HELP SECTION ================= */}
        <div>
          <h1 className="text-3xl font-semibold mb-6">
            Help Center
          </h1>

          <p className="text-gray-400 mb-10">
            Welcome to the Help Center! If you have any questions or need assistance, you're in the right place.
          </p>

          <div className="space-y-4">
            {helpData.map((item, index) => (
              <div
                key={index}
                className="bg-[#161b22] border border-[#30363d] rounded-xl
                           transition-all duration-300
                           hover:border-[#58a6ff] hover:shadow-lg"
              >
                {/* Header */}
                <button
                  onClick={() => toggleCard(index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <h2 className="text-lg font-semibold">
                    {item.title}
                  </h2>

                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      openIndex === index ? "rotate-180 text-[#58a6ff]" : ""
                    }`}
                  />
                </button>

                {/* Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 px-6 ${
                    openIndex === index
                      ? "max-h-[500px] pb-4 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SUCCESS TICKET ================= */}
        {ticketId && (
          <div className="bg-[#161b22] border border-[#58a6ff] rounded-xl p-6">
            <p className="text-sm text-gray-300">
              ✅ Your support ticket has been generated successfully.
            </p>
            <p className="mt-2 text-sm">
              Ticket ID:{" "}
              <span className="text-[#58a6ff] font-semibold">
                {ticketId}
              </span>
            </p>
          </div>
        )}

        {/* ================= FEEDBACK FORM ================= */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8
                        hover:border-[#58a6ff] hover:shadow-lg transition">

          <h2 className="text-2xl font-semibold mb-4">
            Ask a Question / Feedback
          </h2>

          <p className="text-gray-400 text-sm mb-6">
            Note: Please ask questions related to Visualize Leet Code features,
            username issues, visualization tools, revision alerts, or contest reminders.
            Our assistant will review and respond accordingly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d]
                         rounded-md px-4 py-3
                         focus:outline-none focus:border-[#58a6ff]"
            />

            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d]
                         rounded-md px-4 py-3
                         focus:outline-none focus:border-[#58a6ff]"
            />

            <textarea
              rows="4"
              placeholder="Write your question or feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d]
                         rounded-md px-4 py-3
                         focus:outline-none focus:border-[#58a6ff]"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-[#238636] hover:bg-[#2ea043]
                         px-6 py-3 rounded-md text-white
                         transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Help;