import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ChatHome from '../chatHome/ChatHome';
import Login from '../login/Login';
import VideoCall from '../videoCall/VideoCall';

function AppRouter() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<ChatHome/>} />
             <Route path='/videoCalling' element={<VideoCall/>} />
            <Route path='/login' element={<Login/>} />
        </Routes>
    </BrowserRouter>
  )
}


export default AppRouter
