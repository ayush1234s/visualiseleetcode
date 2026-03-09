require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendTestEmail() {

  try {

    console.log("EMAIL:", process.env.GMAIL_USER);
    console.log("PASS:", process.env.GMAIL_PASS);

    const transporter = nodemailer.createTransport({

      host: "smtp.gmail.com",
      port: 465,
      secure: true,

      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }

    });

    const info = await transporter.sendMail({

      from: `"Visualize LC" <${process.env.GMAIL_USER}>`,

      to: "ayushsrivastava8899@gmail.com",

      subject: "Test Email From Visualize LC",

      text: "If you received this email, Nodemailer is working successfully 🎉",

      html: `
        <h2>Visualize LC Test Email 🚀</h2>
        <p>If you received this email, Nodemailer is working successfully.</p>
      `

    });

    console.log("Email sent:", info.messageId);

  } catch (error) {

    console.log("Email error:", error);

  }

}

sendTestEmail();