const nodemailer = require("nodemailer");
const path = require("path");

exports.sendRevisionEmail = async (req, res) => {

  const { email, questionNumber, questionTitle, weekdays, id } = req.body;

  try {

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

    /* ================= TICKET ================= */

    const ticketId = "VL-" + Math.floor(10000 + Math.random()*90000);

    /* ================= LEETCODE LINK ================= */

    const slug = questionTitle
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, "")
  .trim()
  .replace(/\s+/g, "-");

const leetcodeLink = `https://leetcode.com/problems/${slug}/description/`;

    /* ================= TRANSPORT ================= */

    const transporter = nodemailer.createTransport({
      host:"smtp.gmail.com",
      port:465,
      secure:true,
      auth:{
        user:process.env.GMAIL_USER,
        pass:process.env.GMAIL_PASS
      }
    });

    /* ================= EMAIL TEMPLATE ================= */

    const mailOptions = {

      from:`"Visualize LeetCode" <${process.env.GMAIL_USER}>`,
      to:email,
      subject:"📌 Visualize LeetCode Revision Alert",

      html:`

<div style="background:#0d1117;padding:40px;font-family:Arial">

<div style="
max-width:620px;
margin:auto;
background:#161b22;
border:1px solid #30363d;
border-radius:12px;
padding:30px;
color:#e6edf3">

<div style="text-align:center">

<img src="cid:logoBrain" width="70"/>

<h2 style="color:#58a6ff;margin-top:10px">
Visualize LeetCode
</h2>

</div>

<p>Hi,</p>

<p>
Greetings from <b>Visualize LeetCode</b> 👋
</p>

<p>
This is your <b>Revision Alert</b> for the following question.
</p>

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
<p><b>Alert Status:</b> ON</p>

</div>

<p>
📌 We will alert you in upcoming weekday as per your selected schedule.
</p>

<div style="text-align:center;margin:30px 0">

<a href="${leetcodeLink}"
style="
display:inline-block;
padding:12px 22px;
background:#238636;
color:white;
text-decoration:none;
font-weight:bold;
border-radius:6px;
transition:0.3s">

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
      `,

      attachments:[
        {
          filename:"logoBrain.png",
          path:path.join(__dirname,"../assets/logoBrain.png"),
          cid:"logoBrain"
        }
      ]

    };

    await transporter.sendMail(mailOptions);

    res.json({success:true});

  } catch(err){

    console.log("EMAIL ERROR:",err);

    res.status(500).json({success:false});

  }

};