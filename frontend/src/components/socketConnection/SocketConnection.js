import io from 'socket.io-client';

const token = localStorage.getItem("token");
// const socket = io.connect("http://localhost:3571/", {
//   auth: {
//     token: token,
//   },
// });

const socket = io.connect("https://conversationbackend.onrender.com/", {
  auth: {
    token: token,
  },
});

// const loginUrl = "/login";
socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
  // Perform actions that require the authenticated socket connection
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server initiated the disconnection
    console.log('Disconnected by the server');
  } else if (reason === 'transport close') {
    // Disconnected due to a transport close (network issue)
    console.log('Disconnected due to a transport close');
  } else {
    // Other disconnection reasons
    console.log('Disconnected for an unknown reason');
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error.message);
});

export default socket;
