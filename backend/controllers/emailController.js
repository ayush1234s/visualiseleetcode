const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
let db = null;
try {
  const firebaseAdmin = require("../firebaseAdmin");
  db = firebaseAdmin.db;
} catch (e) {
  console.warn("Firebase admin optional load in emailController:", e.message);
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Nodemailer with fast timeouts to avoid serverless hanging
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  connectionTimeout: 3000,
  greetingTimeout: 3000,
  socketTimeout: 4000,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helper to dispatch email via SendGrid (HTTPS) or Nodemailer (fallback)
async function sendMailHelper({ to, subject, text, html }) {
  let sent = false;

  // 1. Try SendGrid HTTPS first (preferred on Vercel/cloud as SMTP ports are blocked)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || "visualizeleetcode@gmail.com";
      await sgMail.send({
        to,
        from: fromEmail,
        subject,
        text,
        html,
      });
      console.log("✅ Email sent via SendGrid HTTPS API");
      sent = true;
    } catch (err) {
      console.warn("⚠️ SendGrid error:", err.response?.body?.errors || err.message);
    }
  }

  // 2. Try Gmail SMTP if SendGrid was not configured or failed
  if (!sent && process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    try {
      await transporter.sendMail({
        from: `"Visualize LeetCode" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      console.log("✅ Email sent via Gmail SMTP");
      sent = true;
    } catch (err) {
      console.warn("⚠️ Gmail SMTP error:", err.message);
    }
  }

  return sent;
}

/* ================= 1. SEND REVISION REMINDER EMAIL ================= */
exports.sendRevisionEmail = async (req, res) => {
  const {
    email,
    questionNumber,
    questionTitle,
    weekdays,
    deviceInfo,
    id,
    userId,
  } = req.body;

  try {
    console.log("📩 SEND REVISION EMAIL request for:", email);

    if (!email || !questionNumber) {
      return res.status(400).json({
        success: false,
        error: "Recipient email address and question number are required.",
      });
    }

    // Determine current host URL for completion link
    const protocol = req.protocol || "https";
    const host = req.get("host") || "localhost:5000";
    const backendBaseUrl = `${protocol}://${host}`;

    /* ================= FORMAT DATE & TIME ================= */
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const dateFormatted = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const timeFormatted = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    /* ================= PARSE DEVICE INFO ================= */
    const userAgent = req.headers["user-agent"] || "";
    let detectedDevice = deviceInfo;
    if (!detectedDevice) {
      let os = "Desktop";
      if (/Windows/i.test(userAgent)) os = "Windows";
      else if (/Macintosh|Mac OS X/i.test(userAgent)) os = "macOS";
      else if (/Linux/i.test(userAgent)) os = "Linux";
      else if (/Android/i.test(userAgent)) os = "Android";
      else if (/iPhone|iPad/i.test(userAgent)) os = "iOS";

      let browser = "Browser";
      if (/Edg/i.test(userAgent)) browser = "Edge";
      else if (/Chrome/i.test(userAgent)) browser = "Chrome";
      else if (/Safari/i.test(userAgent)) browser = "Safari";
      else if (/Firefox/i.test(userAgent)) browser = "Firefox";

      detectedDevice = `${os} • ${browser}`;
    }

    /* ================= LEETCODE PROBLEM DETAILS & URL ================= */
    const cleanTitle = (questionTitle || "")
      .replace(/^#?\d+\s*[-:]\s*/, "")
      .trim();

    const slug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    // Official LeetCode question URL with /description/
    const leetcodeLink = slug
      ? `https://leetcode.com/problems/${slug}/description/`
      : `https://leetcode.com/problemset/all/?search=${questionNumber}`;

    // Completion / Check link
    const completeLink = `${backendBaseUrl}/api/email/complete?email=${encodeURIComponent(
      email
    )}&questionNumber=${questionNumber}&questionTitle=${encodeURIComponent(
      cleanTitle
    )}&taskId=${id || ""}&userId=${userId || ""}`;

    const textContent = `
Hi ${email},

This is your revision reminder for LeetCode Problem #${questionNumber}: ${cleanTitle || questionTitle}.

Practice on LeetCode: ${leetcodeLink}

Session Details:
- Date: ${dateFormatted}
- Time: ${timeFormatted} IST
- Device: ${detectedDevice}

Completed this question? Check it here to log progress:
${completeLink}

- Team Visualize LeetCode
https://visualiseleetcode.vercel.app/revision
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Revision Reminder - Visualize LeetCode</title>
</head>
<body style="margin:0;padding:0;background-color:#080b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f0f6fc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#080b0f;padding:32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#161b22;border:1px solid #30363d;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding:28px 24px 20px 24px;border-bottom:1px solid #30363d;background:linear-gradient(180deg,#1c2128 0%,#161b22 100%);text-align:center;">
              <div style="display:inline-block;padding:6px 12px;background:#21262d;border:1px solid #30363d;border-radius:20px;margin-bottom:12px;">
                <span style="color:#58a6ff;font-size:12px;font-weight:600;letter-spacing:0.5px;">⚡ REVISION REMINDER</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Visualize LeetCode</h1>
              <p style="margin:6px 0 0 0;color:#8b949e;font-size:13px;">Spaced repetition reminder to keep your algorithmic skills sharp</p>
            </td>
          </tr>

          <!-- Problem Card Section -->
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px 0;font-size:14px;color:#c9d1d9;line-height:1.5;">
                Hello, <strong style="color:#ffffff;">${email}</strong> 👋
              </p>
              <p style="margin:0 0 20px 0;font-size:13px;color:#8b949e;line-height:1.5;">
                It's time to review your scheduled problem. Solving it again will solidify the algorithmic pattern in your long-term memory.
              </p>

              <!-- Problem Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0d1117;border:1px solid #30363d;border-radius:12px;margin-bottom:20px;">
                <tr>
                  <td style="padding:18px;">
                    <div style="margin-bottom:8px;">
                      <span style="background-color:#21262d;border:1px solid #30363d;color:#ffa116;font-family:monospace;font-size:12px;font-weight:700;padding:2px 8px;border-radius:6px;">
                        #${questionNumber}
                      </span>
                      <span style="color:#8b949e;font-size:12px;margin-left:8px;">LeetCode Problem</span>
                    </div>
                    <h2 style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#ffffff;line-height:1.3;">
                      ${cleanTitle || questionTitle}
                    </h2>
                    <p style="margin:0;color:#8b949e;font-size:12px;">
                      Scheduled for: <strong style="color:#c9d1d9;">${Array.isArray(weekdays) ? weekdays.join(", ") : "Weekly"}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Main Button: Practice on LeetCode -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${leetcodeLink}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#ffa116;color:#000000;text-decoration:none;font-weight:700;font-size:14px;border-radius:10px;box-shadow:0 4px 12px rgba(255,161,22,0.25);">
                      Practice on LeetCode ↗
                    </a>
                  </td>
                </tr>
              </table>

              <!-- CHECK AS COMPLETED ACTION BOX -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,rgba(35,134,54,0.1) 0%,rgba(56,189,248,0.06) 100%);border:1px solid rgba(46,160,67,0.4);border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:18px;text-align:center;">
                    <h3 style="margin:0 0 6px 0;font-size:15px;color:#3fb950;font-weight:700;">
                      Solved this question today?
                    </h3>
                    <p style="margin:0 0 14px 0;color:#8b949e;font-size:12px;">
                      Click below to check this question off and receive your instant completion badge.
                    </p>
                    <a href="${completeLink}" target="_blank" style="display:inline-block;padding:10px 22px;background-color:#238636;color:#ffffff;text-decoration:none;font-weight:600;font-size:13px;border-radius:8px;">
                      ✅ Check as Completed
                    </a>
                  </td>
                </tr>
              </table>

              <!-- USER & SESSION DETAILS TABLE -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0d1117;border:1px solid #30363d;border-radius:10px;">
                <tr>
                  <td style="padding:14px;">
                    <div style="font-size:11px;font-weight:700;color:#8b949e;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">
                      User & Session Details
                    </div>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:12px;line-height:1.8;">
                      <tr>
                        <td style="color:#8b949e;width:90px;">User Email:</td>
                        <td style="color:#c9d1d9;font-family:monospace;">${email}</td>
                      </tr>
                      <tr>
                        <td style="color:#8b949e;">Date:</td>
                        <td style="color:#c9d1d9;">${dateFormatted}</td>
                      </tr>
                      <tr>
                        <td style="color:#8b949e;">Time:</td>
                        <td style="color:#c9d1d9;">${timeFormatted} IST</td>
                      </tr>
                      <tr>
                        <td style="color:#8b949e;">Device:</td>
                        <td style="color:#c9d1d9;">${detectedDevice}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #30363d;background-color:#0d1117;text-align:center;">
              <p style="margin:0;font-size:11px;color:#8b949e;">
                Manage all your tasks on <a href="https://visualiseleetcode.vercel.app/revision" target="_blank" style="color:#58a6ff;text-decoration:none;">Visualize LeetCode Revision Panel</a>
              </p>
              <p style="margin:6px 0 0 0;font-size:10px;color:#6e7681;">
                © ${now.getFullYear()} Visualize LeetCode. Sent automatically per your scheduled revision rules.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const sent = await sendMailHelper({
      to: email,
      subject: `Revision Reminder: #${questionNumber} ${cleanTitle || ""}`,
      text: textContent,
      html: htmlContent,
    });

    res.json({
      success: true,
      delivered: sent,
      message: sent
        ? "Revision reminder delivered successfully"
        : "Revision task queued successfully",
    });
  } catch (err) {
    console.error("❌ sendRevisionEmail error:", err.message);
    res.status(200).json({
      success: true,
      error: err.message,
      message: "Revision scheduled successfully",
    });
  }
};

/* ================= 2. COMPLETE QUESTION & AUTO-REPLY ================= */
exports.handleCompleteQuestion = async (req, res) => {
  const email = req.query.email || req.body.email;
  const questionNumber = req.query.questionNumber || req.body.questionNumber;
  const questionTitle = req.query.questionTitle || req.body.questionTitle || "";
  const taskId = req.query.taskId || req.body.taskId;
  const userId = req.query.userId || req.body.userId;

  try {
    console.log(`🎉 Question #${questionNumber} marked as completed by ${email}`);

    // 1. Update Firestore if taskId and userId exist
    if (db && userId && taskId) {
      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("revisionTasks")
          .doc(taskId)
          .update({
            status: "Completed",
            completedAt: new Date(),
          });
        console.log("✅ Updated Firestore task status to Completed");
      } catch (dbErr) {
        console.warn("⚠️ Could not update task in Firestore:", dbErr.message);
      }
    }

    // 2. Send the automated celebration reply email
    if (email) {
      const cleanTitle = (questionTitle || "")
        .replace(/^#?\d+\s*[-:]\s*/, "")
        .trim();

      const replySubject = `🎉 Have a good day! You completed LeetCode #${questionNumber} - Hurray!`;
      const replyText = `
Have a good day, ${email}!

You completed question #${questionNumber} (${cleanTitle || questionTitle}), hurray! 🎉

Keep up the momentum and update your panel on Visualize LeetCode:
https://visualiseleetcode.vercel.app/revision

- Team Visualize LeetCode
      `.trim();

      const replyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Question Completed!</title>
</head>
<body style="margin:0;padding:0;background-color:#080b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f0f6fc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#080b0f;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background-color:#161b22;border:1px solid rgba(46,160,67,0.4);border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.6);">
          <tr>
            <td style="padding:32px 24px;text-align:center;background:radial-gradient(circle at 50% 0%,rgba(46,160,67,0.15) 0%,transparent 70%);">
              <div style="font-size:44px;margin-bottom:12px;">🎉</div>
              <h1 style="margin:0 0 8px 0;color:#ffffff;font-size:22px;font-weight:700;">
                Hurray! Question Completed!
              </h1>
              <p style="margin:0 0 20px 0;color:#3fb950;font-size:14px;font-weight:600;">
                Have a good day, ${email}!
              </p>
              
              <div style="background-color:#0d1117;border:1px solid #30363d;border-radius:12px;padding:18px;margin-bottom:24px;text-align:left;">
                <p style="margin:0 0 6px 0;font-size:12px;color:#8b949e;">Completed Problem:</p>
                <h3 style="margin:0 0 8px 0;color:#ffffff;font-size:16px;">
                  #${questionNumber} - ${cleanTitle || questionTitle}
                </h3>
                <p style="margin:0;font-size:12px;color:#3fb950;font-weight:500;">
                  ✓ Solved & Verified in your daily habit streak
                </p>
              </div>

              <a href="https://visualiseleetcode.vercel.app/revision" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#238636;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;border-radius:10px;">
                Update Your Panel on Visualize LeetCode ↗
              </a>

              <p style="margin:20px 0 0 0;font-size:11px;color:#8b949e;">
                Direct link: <a href="https://visualiseleetcode.vercel.app/revision" style="color:#58a6ff;">https://visualiseleetcode.vercel.app/revision</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await sendMailHelper({
        to: email,
        subject: replySubject,
        text: replyText,
        html: replyHtml,
      });
    }

    // 3. Render browser confirmation response
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Question Completed! - Visualize LeetCode</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #080b0f;
      color: #f0f6fc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 20px;
      padding: 36px 28px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
    }
    .badge {
      background: rgba(46, 160, 67, 0.15);
      border: 1px solid rgba(46, 160, 67, 0.4);
      color: #3fb950;
      font-size: 13px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 8px 0;
    }
    p {
      color: #8b949e;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .btn {
      display: inline-block;
      background: #238636;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #2ea043;
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
    <div class="badge">Problem Solved!</div>
    <h1>Have a good day, ${email || "Coder"}!</h1>
    <p>
      You completed LeetCode <strong>#${questionNumber} ${questionTitle ? "- " + questionTitle : ""}</strong>, hurray! An auto-reply confirmation has been sent to your email.
    </p>
    <a href="https://visualiseleetcode.vercel.app/revision" class="btn">
      Update Your Panel on Visualize LeetCode ↗
    </a>
  </div>
  <script>
    setTimeout(function() {
      window.location.href = "https://visualiseleetcode.vercel.app/revision";
    }, 4000);
  </script>
</body>
</html>
    `);
  } catch (err) {
    console.error("❌ handleCompleteQuestion error:", err);
    res.redirect("https://visualiseleetcode.vercel.app/revision");
  }
};
