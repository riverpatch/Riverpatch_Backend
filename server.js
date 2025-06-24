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

// Enhanced CORS configuration for production deployment
const allowedOrigins = [
  "https://riverpatchnext.vercel.app",
  "https://www.riverpatch.com",
  "http://localhost:3000",
  "https://localhost:3000", // Sometimes needed for local HTTPS
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request from origin:", origin); // Debug log

      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // Set to false unless you need cookies
  })
);

// Explicit preflight handler
app.options("/send-email", (req, res) => {
  const origin = req.get("Origin");
  console.log("OPTIONS request from:", origin);

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  res.status(204).end();
});

app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  });
});

// Nodemailer transporter setup with timeout
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  timeout: 9000, // 9 seconds for Vercel compatibility
});

// POST route to handle form submission
app.post("/send-email", async (req, res) => {
  console.log("POST /send-email called");
  console.log("Request origin:", req.get("Origin"));
  console.log("Request body:", req.body);

  const { firstName, lastName, email, company, budget, message } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !message) {
    console.log("Validation failed - missing required fields");
    return res.status(400).json({ error: "Missing required fields." });
  }

  const currentDateTime = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  const mailOptions = {
    from: `"RiverPatch Studio" <${process.env.EMAIL_USER}>`, // Use EMAIL_USER as sender
    replyTo: email,
    to: process.env.EMAIL_USER,
    subject: `New Project Inquiry from ${firstName} ${lastName} - RiverPatch Studio`,
    text: `
      Date and Time: ${currentDateTime}
      Name: ${firstName} ${lastName}
      Email: ${email}
      Current Website: ${company || "Not provided"}
      Budget: ${budget || "Not specified"}
      Message: ${message}
      
      Sent from RiverPatch Studio | team@riverpatch.com
    `,
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
          <p style="color: #6f7d7f; font-size: 12px; margin: 15px 0 0;">RiverPatch Studio | <a href="mailto:hello@riverpatch.com" style="color: #c0bcf5; text-decoration: none;">team@riverpatch.com</a></p>
        </div>
      </div>
    `,
  };

  try {
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return res.status(200).json({
      message: "Email sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Full email error:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });
    return res.status(500).json({
      error: "Failed to send email.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Export for Vercel serverless functions
module.exports = app;

// Start server locally if not in Vercel environment
if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log("CORS enabled for origins:", allowedOrigins);
  });
}
