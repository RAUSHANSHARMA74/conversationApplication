import "./VideoCall.css"
import React, { useState, useEffect } from 'react';
import socket from "../socketConnection/SocketConnection"
import Peer from 'peerjs';

// const videoCallUrl = "/videoCalling";


const VideoCall = () => {
  const [stream, setStream] = useState(null);
  const [myPeer, setMyPeer] = useState(null);
  const [userConnected, setUserConnected] = useState({});
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);


  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((userStream) => {
        setStream(userStream);
        const myPeerInstance = new Peer();

        myPeerInstance.on('open', (id) => {
          const roomID = localStorage.getItem('RoomID');
          socket.emit('join-room', roomID, id);
        });

        myPeerInstance.on('call', (call) => {
          call.answer(userStream);
          const video = document.createElement('video');
          call.on('stream', (userStream) => {
            addStream(video, userStream);
          });
        });

        socket.on('user-join', (userID) => {
          connectNewUser(userID, userStream);
        });

        setMyPeer(myPeerInstance);
      })
      .catch((err) => {
        console.error(err);
      });

    socket.on('user-disconnected', (userID) => {
      if (userConnected[userID]) {
        userConnected[userID].close();
      }
    });
  }, [socket]);

  const connectNewUser = (userID, userStream) => {
    const call = myPeer.call(userID, userStream);
    const video = document.createElement('video');

    call.on('stream', (userStream) => {
      addStream(video, userStream);
    });

    call.on('close', () => {
      video.remove();
    });

    userConnected[userID] = call;
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const endCall = () => {
    if (myPeer) {
      myPeer.destroy();
    }
    window.location.href = '/'; 
  };

  const addStream = (video, userStream) => {
    video.srcObject = userStream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });

    // Append the video element to the appropriate container
    if (userStream.id === stream.id) {
      // Local video
      const localVideoContainer = document.querySelector('.local-video');
      localVideoContainer.appendChild(video);
    } else {
      // Remote video
      const remoteVideoContainer = document.querySelector('.remote-video');
      remoteVideoContainer.appendChild(video);
    }
  };

  return (
    <div className="video-call-container">
      <div className="video-call-controls">
        <button onClick={toggleVideo}>
          {isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
        </button>
        <button onClick={toggleAudio}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={endCall}>End Call</button>
      </div>
      <div className="video-streams">
        <div className="local-video"></div>
        <div className="remote-video"></div>
      </div>
    </div>
  );
};

export default VideoCall;
