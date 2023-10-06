const nodemailer = require("nodemailer");
require("dotenv").config()

async function sendMail(userEmail, friendName) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.clientEmail,
        pass: process.env.clientPassword,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.clientEmail,
      to: userEmail,
      Subject: "Welcome to Our Conversation Application!",
      text: `
       Dear ${friendName},

       We're thrilled to welcome you to our conversation application! Thank you for choosing us as your platform 
       for meaningful discussions and engaging conversations. We're confident that you'll find our application to 
       be a valuable tool for connecting with others and sharing your thoughts
      
       We're excited to have you as part of our community and look forward to seeing the conversations you'll 
       start and join. Your unique perspective and insights will contribute to making our platform even better.

       Thank you for choosing our conversation application. Let the conversations begin!
       
       Warm regards,

       Raushan Sharma
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.send("send mail");
  } catch (error) {
    console.log("wrong in /mail");
  }
}

module.exports = { sendMail };