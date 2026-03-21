const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendRevisionEmail = async (req, res) => {

  const { email, questionNumber, questionTitle, weekdays } = req.body;

  try {

    console.log("📩 SENDGRID EMAIL API HIT");

    const msg = {
      to: email,
      from: process.env.GMAIL_USER, // verified email
      subject: "📌 Visualize LeetCode Revision Alert",

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
      This is your <b>Revision Alert</b> for the following question.
    </p>

    <!-- QUESTION DETAILS -->
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

    <!-- ALERT DETAILS -->
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
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Upcoming Weekday:</b> ${upcomingDay}</p>
      <p><b>Countdown:</b> ${daysLeft} day(s) left</p>
      <p><b>Alert Status:</b> <span style="color:#3fb950">ON</span></p>

    </div>

    <p>
      📌 We will alert you in upcoming weekday as per your selected schedule.
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