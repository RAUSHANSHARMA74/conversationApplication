import "./Navbar.css";
import { AiOutlineSetting, AiOutlineBell, AiOutlineLogin, AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { RiTeamLine } from "react-icons/ri";
import { TbMessages, TbMessagesOff } from "react-icons/tb";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import socket from "../socketConnection/SocketConnection"

const url = process.env.REACT_APP_API_KEY


const loginUrl = "/login";
function Navbar({ userDetail, setFriends, friends }) {
    const [userData, setUserData] = useState({
        rightToggle: false,
        allUsersData: [],
        requestSend: [],
        requestReceive: []
    });


    if(userDetail===undefined){
        window.location.href = loginUrl; 
    }

    const { _id, name, photo, friendRequestsReceived, friendRequestsSent } = userDetail;
    
    const received = userData.requestReceive?.length || 0;
    const all = userData.allUsersData?.length || 0;

    const handleGetSendResponse = (data) => {
        const { message, sender, receiver } = data
        if (sender === undefined || receiver === undefined) {
            return Swal.fire('Good job!', message, 'success');
        }
        if (sender._id === _id) {
            const lastData = sender.friendRequestsSent[0]
            setUserData(prevState => ({
                ...prevState,
                requestSend: [...prevState.requestSend, lastData]
            }));
            Swal.fire('Good job!', message, 'success');
        }

        if (receiver._id === _id) {
            const receivedLastData = receiver.friendRequestsReceived[0]
            setUserData(prevState => ({
                ...prevState,
                requestReceive: [...prevState.requestReceive, receivedLastData]
            }));
        }
    };

    const sendRequest = async (event) => {
        let id = event.target.dataset.id;
        try {
            socket.emit('sendRequestId', id);
        } catch (error) {
            console.log('Something went wrong in sending friend request:', error);
        }
    };

    const handleAllUsersDetail = (data) => {
        // console.log(data.userDetailId, data.status)
        const updateData = data.otherUsers.filter((elm) => elm._id !== _id);
        setUserData(prevState => ({
            ...prevState,
            allUsersData: updateData
        }));
    };

    const rejectRequest = (event) => {
        let id = event.target.dataset.id;
        try {
            socket.emit('rejectRequestId', id);
        } catch (error) {
            console.log('Something went wrong in rejecting friend request:', error);
        }
    }
    const acceptRequest = (event) => {
        let id = event.target.dataset.id;
        try {
            socket.emit('acceptRequestId', id);
        } catch (error) {
            console.log('Something went wrong in accept friend request:', error);
        }
    }

    useEffect(() => {
        setUserData(prevState => ({
            ...prevState,
            requestSend: friendRequestsSent,
            requestReceive: friendRequestsReceived
        }));

        socket.emit("send", "hello world!");

        socket.on('allUsersDetail', handleAllUsersDetail);
        socket.on('getSendResponse', handleGetSendResponse);
        socket.on('acceptRequestResponse', handleAcceptRequestResponse);
        socket.on('rejectRequestResponse', handleRejectRequestResponse);

        return () => {
            socket.off('allUsersDetail', handleAllUsersDetail);
            socket.off('getSendResponse', handleGetSendResponse);
            socket.off('acceptRequestResponse', handleAcceptRequestResponse);
            socket.off('rejectRequestResponse', handleRejectRequestResponse);
        };
    }, [socket, _id, friendRequestsReceived, friendRequestsSent]);


    const handleRejectRequestResponse = (data) => {
        const { message, sender, receiver } = data;

        if (sender === undefined || receiver === undefined) {
            return Swal.fire('Good job!', message, 'success');
        }

        if (sender._id === _id) {
            setUserData(prevState => ({
                ...prevState,
                requestSend: sender.friendRequestsSent
            }));
        }
        if (receiver._id === _id) {
            setUserData(prevState => ({
                ...prevState,
                requestReceive: receiver.friendRequestsReceived
            }));
            Swal.fire('Good job!', message, 'success');
        }
    };



    const handleAcceptRequestResponse = (data) => {
        const { message, sender, receiver } = data;

        if (sender === undefined || receiver === undefined) {
            return Swal.fire('Good job!', message, 'success');
        }

        if (sender._id === _id) {
            const senderLastFriend = sender.friends[sender.friends.length-1]
            setFriends([...friends, senderLastFriend]);
            setUserData(prevState => ({
                ...prevState,
                requestSend: sender.friendRequestsSent
            }));
        }
        if (receiver._id === _id) {
            const receiverLastFriend = receiver.friends[receiver.friends.length-1]
            setFriends([...friends, receiverLastFriend]);
            setUserData(prevState => ({
                ...prevState,
                requestReceive: receiver.friendRequestsReceived
            }));
            Swal.fire('Good job!', message, 'success');
        }
    };

    return (
        <div className="userNavbar">
            <div className="leftNavbar">
                <img src={photo} alt="" />
                <h2>{name}</h2>
            </div>
            <div className="rightNavbar">
                <div className={`logoIcons ${userData.rightToggle ? "active" : ""}`}>
                    <AiOutlineSetting className="ai" />
                    {/*  */}
                    <div className="teamLogo">
                        <div className="numberUsers">
                            <RiTeamLine className="ai"
                            />
                            <span>{all}</span>
                        </div>
                        <div className="allUsersName">
                            <div className="child-allUsersName">
                                <p>ALL USERS</p>
                            </div>
                            {userData.allUsersData?.map((elm, index) => {
                              const isFriendRequestSent = userData.requestSend?.some(request => request.myDetail._id.toString() === elm._id) || false;
                              const statusCheck = userData.requestSend?.find(request => request.myDetail._id.toString() === elm._id);
                                return (
                                    <div className="userDetail" key={index}>
                                        <img src={elm.photo} alt="" />
                                        <p>{elm.name}</p>
                                        {isFriendRequestSent ? (
                                            <div className="sendRequestButton">
                                                <button
                                                    onClick={sendRequest}
                                                    data-id={elm._id}
                                                    style={{
                                                        backgroundColor:
                                                            statusCheck.status === "pending"
                                                                ? "grey"
                                                                : statusCheck.status === "rejected"
                                                                    ? "lightred"
                                                                    : statusCheck.status === "accepted"
                                                                        ? "green"
                                                                        : ""
                                                    }}
                                                >
                                                    Send Request
                                                </button>

                                                <span>{statusCheck.status}</span>
                                            </div>
                                        ) : (
                                            <div className="sendRequestButton">
                                                <button onClick={sendRequest} data-id={elm._id} style={{ backgroundColor: "#434986" }}>
                                                    Send Request
                                                </button>
                                                <span></span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                    {/*  */}
                    <div className="notificationDetail">
                        <div className="numberRequests">
                            <AiOutlineBell className="ai"
                            />
                            <span>{received}</span>
                        </div>
                        <div className="allUsersNameSended">
                            <div className="child-allUsersNameSended">
                                <p>REQUESTED USERS</p>
                            </div>
                            {userData.requestReceive?.map((elm, index) => {
                                elm = elm.userDetail;
                                return (
                                    <div className="userSended" key={index}>
                                        <img src={elm.photo} alt="" />
                                        <p>{elm.name}</p>
                                        <button onClick={acceptRequest} data-id={elm._id} >Accept</button>
                                        <button onClick={rejectRequest} data-id={elm._id} >Reject</button>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                    {/*  */}

                    <AiOutlineLogin className="ai" />
                </div>
                <div className="toggleNav">
                    {userData.rightToggle ? (
                        <TbMessagesOff onClick={() => setUserData(prevState => ({ ...prevState, rightToggle: !prevState.rightToggle }))} />
                    ) : (
                        <TbMessages onClick={() => setUserData(prevState => ({ ...prevState, rightToggle: !prevState.rightToggle }))} />
                    )}

                </div>
            </div>
        </div>
    );
}

export default Navbar;






