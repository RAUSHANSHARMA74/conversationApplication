import "./ChatHome.css";
import Chat from "../chat/Chat";
import Navbar from "../navbar/Navbar";
import UserName from "../userName/UserName";
import { BsTelephone, BsTelephoneX } from "react-icons/bs";
import { useState, useEffect } from "react";
import socket from "../socketConnection/SocketConnection"



const url = process.env.REACT_APP_API_KEY

const loginUrl = "/login";
const videoCallUrl  = "/videoCalling";


function ChatHome() {
    const [userChat, setUserChat] = useState(false);
    const [userPhoto, setUserPhoto] = useState("")
    const [userDetail, setUserDetail] = useState({});
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState("")
    const [onlineUserId, setOnlineUserId] = useState([])
    const [online, setOnline] = useState(false)
    const [connectionId, setConnectionId] = useState("")

    console.log(connectionId, "setConnectionId")

    localStorage.setItem("RoomID", connectionId)

    const handleReceiveingVideoCall = () =>{
        // socket.emit("join-room", connectionId)
        window.location.href = videoCallUrl;
    }

    const handleEndVideoCall = () =>{
        setConnectionId("")
    }

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
                <UserName userChat={userChat} setUserPhoto={setUserPhoto} setUserChat={setUserChat} friends={friends} setUserId={setUserId} userId={userId} onlineUserId={onlineUserId} setOnline={setOnline} setConnectionId={setConnectionId} userDetail={userDetail} />
                {userChat ? (
                    <Chat userChat={userChat} setUserChat={setUserChat} userPhoto={userPhoto} userDetail={userDetail} userId={userId} onlineUserId={onlineUserId} setConnectionId={setConnectionId}  />
                ) : (
                    <div className="catbox">
                        <h1>This Is Chat Box</h1>
                    </div>
                )}
            </div>
        </div>
    );

    const call = (
        <div className="videoCall">
                <div className="childImage">
                    <img src="https://img.freepik.com/premium-vector/person-avatar-design_24877-38137.jpg?w=2000" alt="" />
                    <p>Raushan Sharma</p>
                    <p>Video Calling.....</p>
                </div>
                <div className="callReceiving">
                    <BsTelephone className="callReceive" onClick={handleReceiveingVideoCall}/>
                    <BsTelephoneX className="callEnd" onClick={handleEndVideoCall}/>
                </div>
            </div>
    )

    return (
        
        <>
            {connectionId? call : "" }
            {loading ? loadingJSX : contentJSX}
        </>
    );
}

export default ChatHome;
