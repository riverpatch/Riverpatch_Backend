const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Check required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("EMAIL_USER and EMAIL_PASS must be set in your .env file");
  process.exit(1);
}

// Middleware
app.use(cors()); // Allows requests from your React app
app.use(express.json()); // Parse JSON bodies

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g., dyreland5455@gmail.com
    pass: process.env.EMAIL_PASS, // Your Gmail app password
  },
});

// Verify transporter setup
transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying transporter:", error);
  } else {
    console.log("Transporter verified successfully.");
  }
});

// POST route to handle form submission
app.post("/send-email", (req, res) => {
  const { firstName, lastName, email, company, budget, message } = req.body;

  // Basic validation for required fields
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Get current date and time
  const currentDateTime = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  const mailOptions = {
    from: `"RiverPatch Studio" <${process.env.EMAIL_USER}>`,
    replyTo: email,
    to: process.env.EMAIL_USER, // Your own email address
    subject: `New Project Inquiry from ${firstName} ${lastName} - RiverPatch Studio`,
    // Plain text fallback – remove this property if you want HTML-only emails.
    text: `
      Date and Time: ${currentDateTime}
      Name: ${firstName} ${lastName}
      Email: ${email}
      Current Website: ${company || "Not provided"}
      Budget: ${budget || "Not specified"}
      Message: ${message}
      
      Sent from RiverPatch Studio | team@riverpatch.com
    `,
    // HTML version of the email
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 20px auto; background: linear-gradient(135deg, #001140, #261e67); border-radius: 15px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #261e67; padding: 20px; text-align: center; border-bottom: 4px solid #c0bcf5;">
          <h1 style="color: #defafe; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: 1px;">RiverPatch</h1>
          <p style="color: #c0bcf5; font-size: 16px; margin: 8px 0 0; font-weight: 300;">Elevate your business with Smart Web Solutions</p>
        </div>
        <!-- Body -->
        <div style="padding: 30px; background-color: #e6f2f9; color: #6f7d7f;">
          <h2 style="color: #261e67; font-size: 22px; margin: 0 0 20px; font-weight: 500; border-bottom: 2px solid #ef476f; padding-bottom: 5px; display: inline-block;">New Project Inquiry</h2>
          <table style="width: 100%; border-spacing: 0 10px;">
            <tr>
              <td style="font-weight: 600; color: #261e67; width: 120px; padding: 8px 0;">Date & Time:</td>
              <td style="color: #6f7d7f; padding: 8px 0;">${currentDateTime}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #261e67; width: 120px; padding: 8px 0;">Name:</td>
              <td style="color: #6f7d7f; padding: 8px 0;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #261e67; padding: 8px 0;">Email:</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${email}" style="color: #ef476f; text-decoration: none; font-weight: 500;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #261e67; padding: 8px 0;">Website:</td>
              <td style="color: #6f7d7f; padding: 8px 0;">${
                company || "Not provided"
              }</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #261e67; padding: 8px 0;">Budget:</td>
              <td style="color: #6f7d7f; padding: 8px 0;">${
                budget || "Not specified"
              }</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #261e67; vertical-align: top; padding: 8px 0;">Message:</td>
              <td style="color: #6f7d7f; line-height: 1.5; padding: 8px 0;">${message.replace(
                /\n/g,
                "<br />"
              )}</td>
            </tr>
          </table>
        </div>
        <!-- Footer -->
        <div style="background-color: #001140; padding: 15px; text-align: center; border-top: 1px solid #c0bcf5;">
          <p style="color: #defafe; font-size: 14px; margin: 0 0 10px;">Ready to get started?</p>
          <a href="mailto:${email}" style="display: inline-block; background-color: #ef476f; color: #e6f2f9; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 500; transition: background-color 0.3s;">Reply to ${firstName}</a>
          <p style="color: #6f7d7f; font-size: 12px; margin: 15px 0 0;">RiverPatch Studio | <a href="mailto:team@riverpatch.com" style="color: #c0bcf5; text-decoration: none;">team@riverpatch.com</a></p>
        </div>
      </div>
    `,
  };

  console.log("Sending email with the following options:", mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Failed to send email." });
    }
    console.log("Email sent successfully:", info.response);
    res.status(200).json({ message: "Email sent successfully." });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
