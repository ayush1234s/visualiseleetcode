const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendRevisionEmail = async (req, res) => {

  const { email, questionNumber, questionTitle, weekdays } = req.body;

  try {

    console.log("📩 SENDGRID EMAIL API HIT");

    /* ================= IST TIME ================= */

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const date = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    /* ================= UPCOMING DAY ================= */

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
      .replace(/^#\d+\s*-\s*/, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const leetcodeLink = `https://leetcode.com/problems/${slug}/`;

    /* ================= EMAIL ================= */

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER,
      replyTo: process.env.SENDGRID_REPLY_TO || process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER,
      subject: "Your Revision Reminder - Visualize LeetCode",
      headers: {
        "X-Priority": "3",
        "Precedence": "bulk"
      },
      mailSettings: {
        bypassListManagement: { enable: false },
        sandboxMode: { enable: false }
      },
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false }
      },

      // ✅ Anti-spam plain text
      text: `
Hi,

This is your revision reminder for question ${questionNumber} - ${questionTitle}.
Please stay consistent with your learning.

- Visualize LeetCode Team
      `,

      html: `
      <div style="background:#0d1117;padding:40px;font-family:Arial">

        <div style="
          max-width:600px;
          margin:auto;
          background:#161b22;
          border:1px solid #30363d;
          border-radius:12px;
          padding:30px;
          color:#e6edf3">

          <div style="text-align:center">
            <h2 style="color:#58a6ff;margin-bottom:5px">
              Visualize LeetCode
            </h2>
            <p style="color:#8b949e;font-size:14px">
              Smart Revision Planner 🚀
            </p>
          </div>

          <p>Hi,</p>

          <p>
            Greetings from <b>Visualize LeetCode</b> 👋
          </p>

          <p>
            This is your <b>Revision Reminder</b> for the following question.
          </p>

          <!-- QUESTION -->
          <div style="
            background:#0d1117;
            border:1px solid #30363d;
            border-radius:8px;
            padding:15px;
            margin:20px 0">

            <h3 style="color:#79c0ff;margin-top:0">
              Question Details
            </h3>

            <p><b>Question Number:</b> ${questionNumber}</p>
            <p><b>Title:</b> ${questionTitle}</p>
            <p><b>Weekdays:</b> ${weekdays.join(", ")}</p>

          </div>

          <!-- ALERT -->
          <div style="
            background:#0d1117;
            border:1px solid #30363d;
            border-radius:8px;
            padding:15px;
            margin:20px 0">

            <h3 style="color:#79c0ff;margin-top:0">
              Alert Details
            </h3>

            <p><b>Date:</b> ${date}</p>
            <p><b>Time:</b> ${time}</p>
            <p><b>Upcoming Day:</b> ${upcomingDay}</p>
            <p><b>Countdown:</b> ${daysLeft} day(s)</p>
            <p><b>Status:</b> <span style="color:#3fb950">Active</span></p>

          </div>

          <p>
            📌 Stay consistent with your revision schedule.
          </p>

          <!-- BUTTON -->
          <div style="text-align:center;margin:30px 0">

            <a href="${leetcodeLink}"
              style="
              display:inline-block;
              padding:12px 22px;
              background:#238636;
              color:white;
              text-decoration:none;
              font-weight:bold;
              border-radius:6px">

              🚀 Open Question

            </a>

          </div>

          <p>
            Happy Coding! 🚀
          </p>

          <hr style="border-color:#30363d;margin:25px 0"/>

          <p style="font-size:13px;color:#8b949e">
            Best Regards<br/>
            <b>Team Visualize LeetCode</b>
          </p>

          <!-- FOOTER (ANTI-SPAM) -->
          <p style="font-size:12px;color:#8b949e;margin-top:20px">
            You are receiving this email because you scheduled a revision reminder on Visualize LeetCode.
            If this was not you, please ignore this email.
          </p>

        </div>

      </div>
      `
    };

    await sgMail.send(msg);

    console.log("✅ EMAIL SENT SUCCESSFULLY");

    res.json({ success: true });

  } catch (err) {

    console.log("❌ SENDGRID ERROR:", err.response?.body || err.message);

    res.status(500).json({ success: false });

  }

};