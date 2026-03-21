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
      <div style="font-family:Arial;padding:20px">
        <h2>Visualize LeetCode</h2>

        <p><b>Question:</b> ${questionNumber} - ${questionTitle}</p>
        <p><b>Weekdays:</b> ${weekdays.join(", ")}</p>

        <p>Happy Coding 🚀</p>
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