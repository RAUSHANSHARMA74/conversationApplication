import { useState } from "react";
import "./UserName.css";


function UserName({ userChat, setUserPhoto, setUserChat, friends, setUserId, onlineUserId }) {
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
