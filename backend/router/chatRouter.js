const express = require("express");
const { socketAuthorization } = require("../middleware/socketAuthentication");
const { ChatUserModel, MessageModel } = require("../model/userModel");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.use(socketAuthorization);
var allUsersStatus = []
io.on("connection", async (socket) => {
  const userDetailId = socket.userDetail._id.toString();
  // Fetch all user details except the current user
  socket.on("send", async () => {
    try {
      const otherUsers = await ChatUserModel.find().populate({
        path: "friendRequestsSent.myDetail friendRequestsReceived.userDetail",
        select: "_id id name email photo friendRequestsSent.status",
      });
      io.emit("allUsersDetail", {otherUsers, userDetailId, status : true});
    } catch (error) {
      console.error("Socket connection error:", error.message);
      socket.disconnect(); // Disconnect the socket in case of an error
    }
  });

  //send request to friend
  socket.on("sendRequestId", async (id) => {
    try {
      const friendId = id;
      const currentUserId = socket.userDetail._id.toString();

      const currentUser = await ChatUserModel.findById(currentUserId);
      const friend = await ChatUserModel.findById(friendId);

      const checkInYourFriends = currentUser.friends.some(
        (friend) => friend._id.toString() === friendId
      );

      const currentUserFriendRequestCheck = currentUser.friendRequestsSent.some(
        (request) => request.myDetail.toString() === friendId
      );

      const friendRequestsReceived = friend.friendRequestsReceived.some(
        (request) => request.userDetail.toString() === currentUserId
      );

      const currentUserFriendRequestsReceived =
        currentUser.friendRequestsReceived.some(
          (request) => request.userDetail.toString() === friendId
        );

      // console.log(currentUser)

      if (checkInYourFriends) {
        const message = "You are already friends with this user";
        return socket.emit("getSendResponse", { message });
      } else if (currentUserFriendRequestsReceived) {
        const message = "Friend request already received from this user";
        return socket.emit("getSendResponse", { message });
      } else if (friendRequestsReceived) {
        const message = "Friend request already send to this user ";
        return socket.emit("getSendResponse", { message });
      } else if (!currentUserFriendRequestCheck && !friendRequestsReceived) {
        // Update friend's friendRequestsReceived with current user's ID
        const updatedFriend = await ChatUserModel.findByIdAndUpdate(
          friendId,
          { $push: { friendRequestsReceived: { userDetail: currentUserId } } },
          { new: true }
        );

        // Update current user's friendRequestsSent with friend's ID
        const updatedCurrentUser = await ChatUserModel.findByIdAndUpdate(
          currentUserId,
          { $push: { friendRequestsSent: { myDetail: friendId } } },
          { new: true }
        );
      } else if (!friendRequestsReceived) {
        const friendRequestSent = currentUser.friendRequestsSent.find(
          (request) => request.myDetail.toString() === friendId
        );

        if (friendRequestSent && friendRequestSent.status === "accepted") {
          const message = "You are already friends with this user";
          return socket.emit("getSendResponse", { message });
        }

        await ChatUserModel.updateOne(
          { _id: currentUserId, "friendRequestsSent.myDetail": friendId },
          { $set: { "friendRequestsSent.$.status": "pending" } }
        );

        const updatedFriend = await ChatUserModel.findByIdAndUpdate(
          friendId,
          { $push: { friendRequestsReceived: { userDetail: currentUserId } } },
          { new: true }
        );
      } else if (currentUserFriendRequestCheck) {
        const message = "Friend request already sent to this user";
        return socket.emit("getSendResponse", { message });
      }

      const message = "Friend request sent successfully";
      const sender = await ChatUserModel.findById(currentUserId)
        .select("friendRequestsSent")
        .populate({
          path: "friendRequestsSent.myDetail",
          select: "_id name email photo",
        });

      const senderLastData =
        sender.friendRequestsSent[sender.friendRequestsSent.length - 1];

      const receiver = await ChatUserModel.findById(friendId)
        .select("friendRequestsReceived")
        .populate({
          path: "friendRequestsReceived.userDetail",
          select: "_id name email photo",
        });

      const receiverLastData =
        receiver.friendRequestsReceived[
          receiver.friendRequestsReceived.length - 1
        ];

      sender.friendRequestsSent = [senderLastData];
      receiver.friendRequestsReceived = [receiverLastData];

      io.emit("getSendResponse", { message, sender, receiver });
    } catch (error) {
      console.log("Error in handling friend request:", error);
    }
  });

  socket.on("rejectRequestId", async (id) => {
    try {
      const friendId = id;
      const currentUserId = socket.userDetail._id.toString();

      // Update friend's friendRequestsSent status to "rejected"
      await ChatUserModel.updateOne(
        { _id: friendId, "friendRequestsSent.myDetail": currentUserId },
        { $set: { "friendRequestsSent.$.status": "rejected" } }
      );

      // Find the current user and update friendRequestsReceived
      let currentUserDetail = await ChatUserModel.findById(currentUserId);
      currentUserDetail.friendRequestsReceived =
        currentUserDetail.friendRequestsReceived.filter(
          (request) => request.userDetail.toString() !== friendId
        );
      await currentUserDetail.save();

      const sender = await ChatUserModel.findById(friendId)
        .select("friendRequestsSent")
        .populate({
          path: "friendRequestsSent.myDetail",
          select: "_id name email photo",
        });

      const receiver = await ChatUserModel.findById(currentUserId)
        .select("friendRequestsReceived")
        .populate({
          path: "friendRequestsReceived.userDetail",
          select: "_id name email photo",
        });

      const message = "Friend request rejected";
      io.emit("rejectRequestResponse", { message, sender, receiver });
    } catch (error) {
      console.log("Something went wrong in rejectRequest route:", error);
    }
  });

  socket.on("acceptRequestId", async (requestId) => {
    try {
      const friendId = requestId;
      const currentUserId = socket.userDetail._id.toString();

      const messageConnection = new MessageModel({
        sender: friendId,
        receiver: currentUserId,
      });
      await messageConnection.save();

      const currentUser = await ChatUserModel.findOneAndUpdate(
        { _id: currentUserId, "friendRequestsReceived.userDetail": friendId },
        { $pull: { friendRequestsReceived: { userDetail: friendId } } },
        { new: true }
      );

      const friend = await ChatUserModel.findOneAndUpdate(
        { _id: friendId, "friendRequestsSent.myDetail": currentUserId },
        { $set: { "friendRequestsSent.$.status": "accepted" } },
        { new: true }
      );

      const currentUserStatus = await ChatUserModel.findOneAndUpdate(
        { _id: currentUserId, "friendRequestsSent.myDetail": friendId },
        { $set: { "friendRequestsSent.$.status": "accepted" } },
        { new: true }
      );

      if (!friend) {
        const message = "Friend not found or request not valid";
        return socket.emit("acceptRequestResponse", { message });
      }

      if (!currentUser.friends.includes(friendId)) {
        currentUser.friends.push(friendId);
      }
      if (!friend.friends.includes(currentUserId)) {
        friend.friends.push(currentUserId);
      }
      await friend.save();
      await currentUser.save();

      const sender = await ChatUserModel.findById(friendId)
        .select("friendRequestsSent friends")
        .populate({
          path: "friendRequestsSent.myDetail friends",
          select: "_id name email photo",
        });

      const receiver = await ChatUserModel.findById(currentUserId)
        .select("friendRequestsReceived friends")
        .populate({
          path: "friendRequestsReceived.userDetail friends",
          select: "_id name email photo",
        });

      const message = "Successfully accepted request";
      io.emit("acceptRequestResponse", {
        message,
        sender,
        receiver,
      });
    } catch (error) {
      console.log("Something went wrong in accept request:", error);
    }
  });

  socket.on("messageOfUserId", async (userId) => {
    try {
      const friendId = userId;
      const currentUserId = socket.userDetail._id.toString();

      const messages = await MessageModel.findOne({
        $or: [
          { sender: currentUserId, receiver: friendId },
          { sender: friendId, receiver: currentUserId },
        ],
      }); // Only select the messages field

      socket.emit("getAllMessages", messages);
    } catch (error) {
      console.log("Something went wrong in message get:", error);
    }
  });

  socket.on("sendMessage", async ({ connectionId, content }) => {
    try {
      const currentUserId = socket.userDetail._id.toString();
      const saveMessage = await MessageModel.findByIdAndUpdate(
        connectionId,
        {
          $push: { messages: { id: currentUserId, content } },
        },
        { new: true }
      );
      io.emit("receiveMessage", saveMessage.messages);
    } catch (error) {
      console.log("Something went wrong in sending message:", error);
    }
  });
  
  // const allUsersStatus = []
  socket.on('userLogin', () => {
    allUsersStatus.push({ userDetailId, status: true });
    io.emit('userStatusChange', allUsersStatus);
  });

  socket.on('disconnect', () => {
    // const userDetailId = socket.userDetailId; // Get the userDetailId associated with the socket
    allUsersStatus = allUsersStatus.filter(elm => elm.userDetailId !== userDetailId);
    io.emit('userStatusChange', allUsersStatus);
  });


});

module.exports = { server, app };
