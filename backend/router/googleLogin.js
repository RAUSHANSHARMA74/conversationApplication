const express = require("express");
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const { ChatUserModel } = require("../model/userModel");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const googleLoginRouter = express.Router();
require("dotenv").config();


let userEmail;
let userName;

googleLoginRouter.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

googleLoginRouter.use(passport.initialize());
googleLoginRouter.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});



googleLoginRouter.get("/auth/fail", async (req, res) => {
  try {
    res.send("Something went wrong");
  } catch (error) {
    console.error("Error in /auth/fail", error);
    res.status(500).send("Internal Server Error");
  }
});


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // callbackURL: "/auth/google/callback",
      callbackURL: `${process.env.REDIRECT_URL}/auth/google/callback`,

    },
    async (accessToken, refreshToken, profile, done) => {
      userEmail = profile.emails[0].value;
      userName = profile.displayName;
      const googleInformation = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        username: `${profile.name.givenName} ${profile.name.familyName}`,
        photo: profile.photos[0].value,
      };
      const secretKey = process.env.SECRET_KEY; 
      const token = jwt.sign({ userId: googleInformation.id }, secretKey, { expiresIn: '1week' });
      let data = await ChatUserModel.findOne({ id : googleInformation.id });
      try {
        if (data == null) {
          const newChatUser = new ChatUserModel(googleInformation);
          await newChatUser.save();
          done(null, token);
        } else {
          await ChatUserModel.findByIdAndUpdate(data._id, googleInformation);
          done(null, token);
        }
      } catch (error) {
        done(error, false);
      }
    }
  )
);


googleLoginRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

googleLoginRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/fail" }),
  (req, res) => {
    const token = req.user; 
    // res.redirect(`http://localhost:3000/Login/?token=${token}`);
    res.redirect(`${process.env.REDIRECT_FRONTEND}/Login/?token=${token}`);
  }
);

googleLoginRouter.get("/logout", (req, res) => {
  req.logout();
  res.send("User is logged out");
});

module.exports = { googleLoginRouter };
