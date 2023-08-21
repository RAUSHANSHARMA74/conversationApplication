const { ChatUserModel } = require("../model/userModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

let authorization = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    res.send({ message: "Not Authorized 1" });
    return;
  } else {
    try {
      var decoded = jwt.verify(token, process.env.SECRET_KEY);
      if (!decoded) {
        res.send({ message: "Not Authorized 2" });
      } else {
        let userDetail = await ChatUserModel.findOne({
          id: decoded.userId,
        })
          .populate({
            path: "friends friendRequestsSent.myDetail friendRequestsReceived.userDetail",
            select: "_id name email photo",
          })
          .exec();

        if (userDetail != null) {
          // console.log(userDetail);
          req.body["userDetail"] = userDetail;
          next();
        } else {
          res.send({ message: "Not Authorized 3" });
        }
      }
    } catch (error) {
      res.send({ message: "Token Invalid" });
    }
  }
};

module.exports = { authorization };
