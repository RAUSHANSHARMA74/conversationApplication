import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ChatHome from '../chatHome/ChatHome';
import Login from '../login/Login';

function AppRouter() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<ChatHome/>} />
            <Route path='/login' element={<Login/>} />
        </Routes>
    </BrowserRouter>
  )
}


export default AppRouter
