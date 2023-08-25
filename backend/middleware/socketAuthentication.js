const { ChatUserModel } = require("../model/userModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// Socket.IO middleware
let socketAuthorization = async (socket, next) => {
  let token = socket.handshake.auth.token; 
    if (!token) {
        return next(new Error("Not Authorized 1"));
      } else {
        try {
          var decoded = jwt.verify(token, process.env.SECRET_KEY);
          if (!decoded) {
            return next(new Error("Not Authorized 2"));
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
              socket.userDetail = userDetail;
              next(); 
            } else {
              return next(new Error("Not Authorized 3"));
            }
          }
        } catch (error) {
          return next(new Error("Token Invalid"));
        }
      }
};

module.exports = { socketAuthorization };

