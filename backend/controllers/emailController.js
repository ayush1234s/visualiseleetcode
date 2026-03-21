const nodemailer = require("nodemailer");
const path = require("path");

exports.sendRevisionEmail = async (req, res) => {

  const { email, questionNumber, questionTitle, weekdays } = req.body;

  try {

    console.log("📩 EMAIL API HIT");

    /* ================= DATE & TIME ================= */

    const now = new Date();

    const date = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    /* ================= UPCOMING WEEKDAY ================= */

    const dayMap = {
      Sunday:0, Monday:1, Tuesday:2, Wednesday:3,
      Thursday:4, Friday:5, Saturday:6
    };

    const today = now.getDay();

    let upcomingDay = "";
    let daysLeft = 7;

    weekdays.forEach(day=>{
      const diff = (dayMap[day] - today + 7) % 7 || 7;
      if(diff < daysLeft){
        daysLeft = diff;
        upcomingDay = day;
      }
    });

    /* ================= LEETCODE LINK ================= */

    const slug = questionTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const leetcodeLink = `https://leetcode.com/problems/${slug}/description/`;

    /* ================= DEBUG ================= */

    console.log("EMAIL USER:", process.env.GMAIL_USER);
    console.log("EMAIL PASS:", process.env.GMAIL_PASS ? "LOADED" : "NOT LOADED");

    /* ================= TRANSPORT ================= */

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      },
      requireTLS: true,
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000
    });

    /* ================= EMAIL TEMPLATE ================= */

    const mailOptions = {

      from: `"Visualize LeetCode" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "📌 Visualize LeetCode Revision Alert",

      html: `
      <div style="background:#0d1117;padding:40px;font-family:Arial">
        <div style="max-width:620px;margin:auto;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:30px;color:#e6edf3">

          <h2 style="color:#58a6ff;text-align:center">Visualize LeetCode</h2>

          <p>Hi,</p>

          <p>This is your <b>Revision Alert</b>.</p>

          <p><b>Question:</b> ${questionNumber} - ${questionTitle}</p>
          <p><b>Weekdays:</b> ${weekdays.join(", ")}</p>

          <p><b>Upcoming:</b> ${upcomingDay}</p>
          <p><b>Countdown:</b> ${daysLeft} day(s)</p>

          <div style="margin:20px 0;text-align:center">
            <a href="${leetcodeLink}" 
              style="padding:10px 20px;background:#238636;color:white;text-decoration:none;border-radius:6px">
              Open Question
            </a>
          </div>

          <p>Happy Coding 🚀</p>

        </div>
      </div>
      `,

      attachments: [
        {
          filename: "logoBrain.png",
          path: path.join(__dirname, "../assets/logoBrain.png"),
          cid: "logoBrain"
        }
      ]

    };

    /* ================= SEND EMAIL ================= */

    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ EMAIL SENT SUCCESSFULLY");
      return res.json({ success: true });

    } catch (mailErr) {
      console.log("❌ MAIL ERROR:", mailErr);
      return res.status(500).json({ success: false });
    }

  } catch (err) {

    console.log("❌ MAIN ERROR:", err);
    res.status(500).json({ success: false });

  }

};