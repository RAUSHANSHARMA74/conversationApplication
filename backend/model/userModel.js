const mongoose = require("mongoose");

const friendRequestSchema = mongoose.Schema({
  userDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUsers', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
});

const friendRequestsSent = mongoose.Schema({
  myDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUsers', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
});

const messageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUsers', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUsers', required: true },
  messages: [{
    id: String,
    content: String,
    time: { type: Date, default: Date.now } // Use the appropriate data type
  }]
});

const userSchema = mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  username : { type: String, required: true },
  photo : { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatUsers' }],
  friendRequestsSent: [friendRequestsSent],
  friendRequestsReceived: [friendRequestSchema]
});

const ChatUserModel = mongoose.model("ChatUsers", userSchema);
const MessageModel = mongoose.model("Messages", messageSchema);

module.exports = { ChatUserModel, MessageModel };
