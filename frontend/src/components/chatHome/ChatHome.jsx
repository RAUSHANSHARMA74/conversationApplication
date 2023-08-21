import "./ChatHome.css";
import Chat from "../chat/Chat";
import Navbar from "../navbar/Navbar";
import UserName from "../userName/UserName";
import { useState, useEffect } from "react";
import socket from "../socketConnection/SocketConnection"

// const url = "http://localhost:3571";
const url = "https://conversationbackend.onrender.com";

const loginUrl = "/login";

function ChatHome() {
    const [userChat, setUserChat] = useState(false);
    const [userDetail, setUserDetail] = useState({});
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState("")
    const [onlineUserId, setOnlineUserId] = useState([])
    const [online, setOnline] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = loginUrl;
            } else {
                try {
                    setLoading(true);
                    const response = await fetch(`${url}/userDetail`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": token
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        let userDetail = data.userDetail;
                        // console.log(userDetail, "userdetailasdfkas");
                        setUserDetail(userDetail);
                        setFriends(userDetail.friends)
                        if (data.message === "Token Invalid") {
                            window.location.href = loginUrl;
                        }
                    } else {
                        console.log("Request failed with status:", response.status);
                    }
                } catch (error) {
                    console.log("Something error in fetching user detail:");
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
        socket.emit('userLogin', "online users"); 

        // Handle user status changes
        socket.on('userStatusChange', newUserStatuses => {
            
            setOnlineUserId(newUserStatuses)
        });

        return () => {
            socket.disconnect();
        };

    }, []);
    const loadingJSX = <div className="custom-loader"></div>;
    const contentJSX = (
        <div className="container">
            <Navbar userDetail={userDetail} setFriends={setFriends} friends={friends} />
            <div className="userChatSection">
                <UserName userChat={userChat} setUserChat={setUserChat} friends={friends} setUserId={setUserId} userId={userId} onlineUserId={onlineUserId} setOnline={setOnline}/>
                {userChat ? (
                    <Chat userChat={userChat} setUserChat={setUserChat} userDetail={userDetail} userId={userId} onlineUserId={onlineUserId} />
                ) : (
                    <div className="catbox">
                        <h1>This Is Chat Box</h1>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {loading ? loadingJSX : contentJSX}
        </>
    );
}

export default ChatHome;
