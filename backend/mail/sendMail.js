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
      subject: "Welcome to Our Conversation Application!",
      text: `
      Subject: Welcome to Our Conversation Application! 🎉

      Dear ${friendName},
      
      We are absolutely delighted to have you join our conversation application! 🙌 Thank you for selecting us as your preferred platform for meaningful discussions and engaging conversations. Your decision reflects your commitment to fostering rich dialogues, and we couldn't be more thrilled to have you on board.
      
      We have every confidence that you will find our application to be an invaluable tool for connecting with others and sharing your thoughts. Whether you're starting discussions or joining existing ones, your participation will undoubtedly enrich the community.
      
      Your unique perspective and insights are like the missing puzzle pieces that will help us create a more vibrant and dynamic platform. We genuinely appreciate your contribution, and we eagerly anticipate the thought-provoking conversations you'll initiate.
      
      Once again, thank you for choosing our conversation application to be your hub for dialogue and discourse. Let's kickstart these conversations and make this community thrive!
      
      Warm regards,
      
      Raushan Sharma 🚀
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