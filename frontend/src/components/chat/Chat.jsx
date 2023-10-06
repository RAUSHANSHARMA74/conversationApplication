import "./Chat.css"
import EmojiPicker from 'emoji-picker-react';
import { useState, useEffect, useRef } from "react"
import { BsCameraVideo, BsCameraVideoOff, BsArrowLeft, BsTelephoneX, BsTelephone } from "react-icons/bs";
import { AiOutlineSend } from "react-icons/ai";
import { BiAddToQueue, BiSmile } from "react-icons/bi";
import { FcGallery, FcDocument } from "react-icons/fc";
import socket from "../socketConnection/SocketConnection"


const videoCallUrl = "/videoCalling";


function Chat({ userChat, userPhoto, setUserChat, userId, onlineUserId, userDetail }) {
    const chatContainerRef = useRef(null);
    // const [video, setVideo] = useState(false)
    // const [call, setCall] = useState(true)
    const [messages, setMessages] = useState([])
    const [receiveUser, setReceiveUser] = useState({})
    const [inputValue, setInputValue] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [chooseFile, setChooseFile] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [bigImage, setBigImage] = useState("")
    const [openFile, setOpenFile] = useState(false)



    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    };

    const checkOnline = onlineUserId.some(request => request.userDetailId.toString() === userId);

    const handleImageChange = (event) => {
        let id = event.target.dataset.id;
        const selectedFile = event.target.files[0];
        event.target.value = null;
        if (selectedFile) {
            // const imageUrl = URL.createObjectURL(selectedFile);
            // console.log("it is without formdata",selectedFile)
            const formData = new FormData();
            formData.append('image', selectedFile);
            // console.log(formData)
            socket.emit('sendMessage', { connectionId: id, "type": "image", content: formData });
        }
    };

    const handleDocumentChange = (event) => {
        const id = event.target.dataset.id;
        const selectedFile = event.target.files[0];
        event.target.value = null;

        if (selectedFile) {
            const docUrl = URL.createObjectURL(selectedFile);

            socket.emit('sendMessage', { connectionId: id, type: 'doc', content: docUrl, fileName: selectedFile.name });

        }
    };


    const handleSendMessage = (event) => {
        let id = event.target.dataset.id;
        if (inputValue != "" && inputValue != null) {
            socket.emit('sendMessage', { connectionId: id, "type": "text", content: inputValue });
        }
        setInputValue('');
    };

    const handleEmojiClick = (emojiObject) => {
        setInputValue(prevValue => prevValue + emojiObject.emoji);
    };

    const handleReceiveVedioCall = (data) => {
        const currentUserId = userDetail._id
        const { currentReceiveUserId, randomId } = data
        const receiverId = currentReceiveUserId.receiver
        const senderId = currentReceiveUserId.sender
        // console.log(receiverId, senderId, randomId )

        if (receiverId == currentUserId) {
            localStorage.setItem("RoomID", randomId)
            window.location.href = videoCallUrl;

        } else if (senderId == currentUserId) {
            localStorage.setItem("RoomID", randomId)
            window.location.href = videoCallUrl;

        }
    }
    socket.on("receiveVideoCall", handleReceiveVedioCall)



    useEffect(() => {
        socket.emit('messageOfUserId', userId);
        socket.on('getAllMessages', (data) => {
            setReceiveUser(data);
            setMessages(data.messages)
        });

        socket.on('receiveMessage', (data) => {
            const currentUserId = userDetail._id
            const { messages, receiver, sender } = data
            if (receiver == currentUserId) {
                let lastMessage = messages[messages.length - 1]
                setMessages((prevMessages) => [...prevMessages, lastMessage]);
            } else if (sender == currentUserId) {
                let lastMessage = messages[messages.length - 1]
                setMessages((prevMessages) => [...prevMessages, lastMessage]);
            }

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
    // const 
    const handleShowImage = (image) => {
        setBigImage(image)
        const seeImageBigElement = document.querySelector('.seeImageBig');

        if (seeImageBigElement) {
            seeImageBigElement.style.display = 'block'; // Show the element
        }
    };

    const handleDoubleClick = () => {
        setZoom(zoom === 1 ? 1.5 : 1);
    };

    const handleAudioCall = () => {
        console.log("audio")
    }

    const handleVideoCall = () => {
        const connectionId = receiveUser._id
        socket.emit("videoCall", connectionId)
    }


    return (

        <div className={`parentChat ${userChat ? 'open' : ''}`} >
            <div className="seeImageBig" onDoubleClick={handleDoubleClick} >
                <img
                    src={bigImage}
                    alt=""
                    style={{ transform: `scale(${zoom})` }}
                />
            </div>
            <div className="chatWithPersonalUser"
            >
                <div className="videoCallSection">
                    <img src={userPhoto} alt="" />
                    <span className="showOnlineUser">
                        {checkOnline ? <span style={{ color: "#11ede6" }}>Online</span> : <span style={{ color: "#ed115a" }}>Offline</span>}
                    </span>
                    {checkOnline ? <BsCameraVideo onClick={handleVideoCall} className="ai" /> : <BsCameraVideoOff className="ai" />}

                    {checkOnline ? <BsTelephone onClick={handleAudioCall} className="ai" /> : <BsTelephoneX className="ai" />}

                    <BsArrowLeft className="ai leftarrow" onClick={() => setUserChat(!userChat)} />

                </div>
                <div className="ChatSection" ref={chatContainerRef}>
                    {messages?.map((message, index) => (
                        <div key={index} className={message.id === userId ? "friendMessage" : "myMessage"}>
                            <div className="messageTime">{timeFormatted(message.time)}</div>
                            <div className="messageContent">
                                {message.type === 'text' && (
                                    <div className="messageText">{message.content}</div>
                                )}
                                {message.type === 'image' && (
                                    <img src={message.content} onClick={() => handleShowImage(message.content)} className="privateImage" alt="Sent by user" />
                                )}
                                {message.type === 'doc' && (
                                    <div className="documentContainer">
                                        <div className="documentIcon">📄</div>
                                        <div className="documentInfo">
                                            <div className="documentName">{message.fileName}</div>
                                            <div className="documentActions">
                                                <a href={message.content} target="_blank" rel="noopener noreferrer" className="documentLink">
                                                    View Document
                                                </a>
                                                <a href={message.content} download className="documentLink">
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}


                </div>

                <div className="sendMessage">
                    <span >
                        <span className={`EmojiPicker${showEmojiPicker ? " emojiOpen" : ""}`} >
                            <EmojiPicker onEmojiClick={handleEmojiClick} className="emojiContainer" />
                        </span>
                        <BiSmile
                            className="ai"
                            onClick={() => {
                                setShowEmojiPicker(!showEmojiPicker);
                                setChooseFile(false);
                            }}
                        />

                    </span>
                    <span>
                        <span className={`choosefile${chooseFile ? " open" : ""}`}>
                            <span>
                                <label htmlFor="fileImage" ><FcGallery className="gallery" /><p>Photos & Videos</p></label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="fileImage"
                                    className="Child-choseFile"
                                    style={{ display: "none", visibility: "hidden" }}
                                    data-id={receiveUser._id}
                                    onChange={handleImageChange}

                                />
                            </span>
                            <span>
                                <label htmlFor="document"><FcDocument className="document gallery" /><p>Document</p></label>
                                <input
                                    type="file"
                                    accept=".pdf, .doc, .docx"
                                    id="document"
                                    className="Child-choseFile"
                                    style={{ display: "none", visibility: "hidden" }}
                                    data-id={receiveUser._id}
                                    onChange={handleDocumentChange}

                                />
                            </span>
                        </span>
                        <BiAddToQueue
                            className="ai"
                            onClick={() => {
                                setChooseFile(!chooseFile);
                                setShowEmojiPicker(false);
                                setOpenFile(!openFile)
                            }}
                        />
                    </span>
                    <input
                        type="text"
                        value={inputValue}
                        onClick={() => {
                            setShowEmojiPicker(false);
                            setChooseFile(false);
                            const seeImageBigElement = document.querySelector('.seeImageBig');

                            if (seeImageBigElement) {
                                seeImageBigElement.style.display = 'none'; // Hide the element
                            }
                        }}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                        }}
                        placeholder="Message"
                        required
                    />
                    <AiOutlineSend data-id={receiveUser._id} onClick={handleSendMessage} className="ai" />
                </div>
            </div>
        </div>

    )
}


export default Chat
