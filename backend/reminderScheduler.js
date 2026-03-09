const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { db } = require("./firebaseAdmin");

/* ================= EMAIL TRANSPORT ================= */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

/* ================= WEEKDAY ================= */

const days = [
  "Sunday","Monday","Tuesday",
  "Wednesday","Thursday","Friday","Saturday"
];

/* ================= CRON JOB ================= */
/* Runs everyday at 9 AM */

cron.schedule("0 9 * * *", async () => {

  console.log("Checking revision reminders...");

  const today = days[new Date().getDay()];

  const snapshot = await db.collection("revisionTasks").get();

  for (const doc of snapshot.docs) {

    const data = doc.data();

    if (data.weekdays.includes(today)) {

      /* ================= CREATE LEETCODE LINK ================= */

      const slug = data.questionTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g,"")
        .trim()
        .replace(/\s+/g,"-");

      const link =
        `https://leetcode.com/problems/${slug}/description/`;

      /* ================= SAVE REMINDER (FOR BELL) ================= */

      await db.collection("reminders").add({

        questionNumber: data.questionNumber,
        questionTitle: data.questionTitle,
        email: data.email,
        weekday: today,
        createdAt: new Date(),
        type: "reminder"

      });

      /* ================= EMAIL TEMPLATE ================= */

      const mailOptions = {

        from: `"Visualize LeetCode" <${process.env.GMAIL_USER}>`,

        to: data.email,

        subject: "🚨 Visualize LeetCode Reminder",

        html: `

        <div style="background:#0d1117;padding:40px;font-family:Arial">

        <div style="
        max-width:600px;
        margin:auto;
        background:#161b22;
        border:1px solid #30363d;
        border-radius:10px;
        padding:30px;
        color:#e6edf3">

        <h2 style="color:#58a6ff">Visualize LeetCode</h2>

        <p>Hi,</p>

        <p>
        Greetings from <b>Visualize LeetCode</b> 👋
        </p>

        <p>
        This is your <b>Reminder Alert</b> for the following question.
        </p>

        <h3 style="color:#79c0ff">Question Details</h3>

        <p><b>Question Number:</b> ${data.questionNumber}</p>

        <p><b>Title:</b> ${data.questionTitle}</p>

        <p>
        <b>Weekday:</b> ${today} -
        <span style="color:#f85149">
        Today is your revision day. Do not miss it!
        </span>
        </p>

        <div style="margin-top:20px">

        <a href="${link}"
        style="
        padding:12px 20px;
        background:#238636;
        color:white;
        text-decoration:none;
        border-radius:6px;
        font-weight:bold">

        🚀 Open Question

        </a>

        </div>

        <p style="margin-top:25px">
        Revise this question today before you lose this day.
        </p>

        <hr style="border-color:#30363d">

        <p style="font-size:13px;color:#8b949e">

        Best Regards<br>
        <b>Team Visualize LeetCode</b>

        </p>

        </div>
        </div>

        `
      };

      /* ================= SEND EMAIL ================= */

      await transporter.sendMail(mailOptions);

      console.log("Reminder sent:", data.email);

    }

  }

});