import "./Chat.css"
import { useState, useEffect } from "react"
import { BsCameraVideo, BsCameraVideoOff, BsSend, BsArrowLeft, BsTelephoneX, BsTelephone } from "react-icons/bs";
import { BiAddToQueue, BiSmile } from "react-icons/bi";
import socket from "../socketConnection/SocketConnection"


// const url = "http://localhost:3571";
const url = "https://conversationbackend.onrender.com";


function Chat({ userChat, setUserChat, userId, onlineUserId }) {
    // console.log(userId, )
    const [online, setOnline] = useState(true)
    const [video, setVideo] = useState(false)
    const [call, setCall] = useState(true)
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState([])
    const [receiveUser, setReceiveUser] = useState({})

  
    const checkOnline = onlineUserId.some(request => request.userDetailId.toString() === userId);

    const handleSendMessage = (event) => {
        let id = event.target.dataset.id;
        socket.emit('sendMessage', { connectionId: id, content: inputValue });
        setInputValue('');
    };

    useEffect(() => {
        socket.emit('messageOfUserId', userId);
        socket.on('getAllMessages', (data) => {
            setReceiveUser(data);
            setMessages(data.messages)
        });

        socket.on('receiveMessage', (data) => {
            let lastMessage = data[data.length - 1]
            setMessages((prevMessages) => [...prevMessages, lastMessage]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [socket, userId]);

    const timeFormatted = (originalTime) => {
        const date = new Date(originalTime);

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;

        // Format the time
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedTime = `${hours > 12 ? hours - 12 : hours}:${minutes < 10 ? '0' : ''}${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;

        // Combine formatted date and time
        const formattedDateTime = `${formattedDate}/${formattedTime}`;
        return formattedDateTime;
    };


    return (

        <div className={`parentChat ${userChat ? 'open' : ''}`}>
            <div className="chatWithPersonalUser"
            >
                <div className="videoCallSection">
                    {video ? <BsCameraVideo className="ai" /> : <BsCameraVideoOff className="ai" />}

                    {call ? <BsTelephoneX className="ai" /> : <BsTelephone className="ai" />}
                    <div className="showOnlineUser">
                        {checkOnline ? <span style={{ color: "#11ede6" }}>Online</span> : <span style={{ color: "#ed115a" }}>Offline</span>}
                    </div>

                    <BsArrowLeft className="ai leftarrow" onClick={() => setUserChat(!userChat)} />

                </div>
                <div className="ChatSection">
                    {/* Friend's Message */}
                    {messages?.map((elm, index) => (
                        <div key={index} className={elm.id === userId ? "friendMessage" : "myMessage"}>
                            <div className="messageTime">{timeFormatted(elm.time)}</div>
                            <div className="messageText">
                                {elm.content}
                            </div>
                        </div>
                    ))}

                </div>

                <div className="sendMessage">
                    <span><BiSmile className="ai" /></span>
                    <span><BiAddToQueue className="ai" /></span>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Message"
                        required
                    />

                    <BsSend data-id={receiveUser._id} onClick={handleSendMessage} className="ai" />

                </div>
            </div>
        </div>

    )
}


export default Chat
