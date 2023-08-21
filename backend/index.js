const express = require("express");
const {server, app} = require("./router/chatRouter")
const { connection } = require("./config/connection");
const { githubLoginRouter } = require("./router/githubLogin");
const { googleLoginRouter } = require("./router/googleLogin");
const { userDetail } = require("./router/users")
const cors = require("cors");
require("dotenv").config();


app.use(cors());
app.use(express.json());
app.use(githubLoginRouter);
app.use(googleLoginRouter);
app.use(userDetail);

const port = process.env.PORT || 3571;
server.listen(port, async () => {
  try {
    await connection;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Something went wrong in connecting to the database");
    console.log(error);
  }
  console.log(`Server is running on port ${port}`);
});
