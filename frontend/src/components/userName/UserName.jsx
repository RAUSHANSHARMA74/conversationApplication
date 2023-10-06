import { useState } from "react";
import "./UserName.css";
import socket from "../socketConnection/SocketConnection"



function UserName({ userChat, setUserPhoto, setUserChat, friends, setUserId, onlineUserId, setConnectionId, userDetail }) {
    
    const handleReceiveVedioCall = (data) =>{
        const currentUserId = userDetail._id
        const {currentReceiveUserId, randomId} = data
        const receiverId = currentReceiveUserId.receiver
        const senderId = currentReceiveUserId.sender
        // console.log(receiverId, senderId, randomId )

        if(receiverId == currentUserId){
        setConnectionId(randomId)
        }else if (senderId == currentUserId){
        setConnectionId(randomId)
        }
    }
    socket.on("receiveVideoCall", handleReceiveVedioCall)



    return (
        <div className="allYourFriendName">
            <div className="onlineUsers">
                <p>All Your Buddy</p>
                <span>{friends.length || 0}</span>
            </div>
            <div className="allFriends">
                {friends?.map((elm, index) => {
                    const checkstatus = onlineUserId?.some(request => request.userDetailId.toString() === elm._id);
                    return (
                        <div
                            className="name"
                            onClick={() => {
                                setUserChat(true);
                                setUserPhoto(elm.photo)
                                setUserId(elm._id);
                            }}
                            key={index} // Add a unique key for each element in the array
                        >
                            <div className="userNameImage">
                                <img src={elm.photo} alt="" />
                                <p>{elm.name}</p>
                            </div>
                            <div className="onlineMessageUpdate">
                                <span className={checkstatus ? "online" : "offline"}></span>
                                <span className="Message"></span>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

export default UserName;
