const express = require("express");
const userDetail = express.Router();
const { authorization } = require("../middleware/authentication");


userDetail.use(authorization);
userDetail.get("/userDetail", async (req, res) => {
  try {
    res.send(req.body);
  } catch (error) {
    console.log("something went wrong in get userDetail");
    console.log(error);
  }
});


module.exports = { userDetail };
