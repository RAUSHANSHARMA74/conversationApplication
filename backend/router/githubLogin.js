const express = require("express");
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken")
const {ChatUserModel} = require("../model/userModel")
// const {sendMail} = require("../mail/sendMail")
const GitHubStrategy = require("passport-github2").Strategy;
const githubLoginRouter = express.Router();
require("dotenv").config();



let userEmail;
let userName;

githubLoginRouter.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

githubLoginRouter.use(passport.initialize());
githubLoginRouter.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

githubLoginRouter.get("/github/users", async (req, res) => {
  try {
    // let allUsersData = await GithubModel.find();
    // res.send(allUsersData);
    res.send("hello github")
  } catch (error) {
    console.log("something wrong in /github/users");
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});



passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      scope: ["user:email"], // Request the 'user:email' scope to get the user's email
    },
    async function (accessToken, refreshToken, profile, done) {
      userEmail = profile.emails[0].value
      userName = profile.displayName
      let githubInformation = {
        id : profile.id,
        name : profile.displayName,
        email : profile.emails[0].value,
        username : profile.username,
        photo : profile.photos[0].value
      }
      // console.log(profile)
      var token = jwt.sign({userE : profile.emails[0].value }, process.env.secret, { expiresIn: '1h' });
      try {
        let data = await ChatUserModel.findOne({id : githubInformation.id});
        if (data == null) {
          let newChatUser = new ChatUserModel(githubInformation);
          await newChatUser.save();
          done(null, "Login successful");
        } else {
          await ChatUserModel.findByIdAndUpdate(githubInformation.id, githubInformation);
          localStorage.setItem("token", token)
          done(null, "Login successful");
        }
      } catch (error) {
        done(error, false);
      }
    }
  )
);

githubLoginRouter.get(
  "/auth/github",
  passport.authenticate("github")
);

githubLoginRouter.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/fail" }),
  (req, res) => {
    if (req.isAuthenticated()) {
    res.redirect("/github/users")
    console.log("login")
    } else {
      res.redirect("/auth/fail");
    }
  }
);

githubLoginRouter.get("/github/logout", (req, res) => {
  req.logout();
  res.send("user is logged out from GitHub");
});

module.exports = { githubLoginRouter };