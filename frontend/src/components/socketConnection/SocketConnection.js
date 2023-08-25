import io from 'socket.io-client';

const url = process.env.REACT_APP_API_KEY


const token = localStorage.getItem("token");
const socket = io.connect(`${url}`, {
  auth: {
    token: token,
  },
});


socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    console.log('Disconnected by the server');
  } else if (reason === 'transport close') {
    console.log('Disconnected due to a transport close');
  } else {
    console.log('Disconnected for an unknown reason');
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error.message);
});

export default socket;
