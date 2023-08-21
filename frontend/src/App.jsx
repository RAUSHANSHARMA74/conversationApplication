import './App.css';
// import ChatHome from './components/chatHome/ChatHome';
// import { useState, useEffect } from "react";
// import SocketConnection from './components/socketConnection/SocketConnection';
// import Login from './components/login/Login';
import AppRouter from './components/routers/AppRouter';

function App() {


  return (
    <div className="App">
      <div className="element-container">
        {/* <SocketConnection/> */}
        <AppRouter />
      </div>
    </div>
  );
}

export default App;
