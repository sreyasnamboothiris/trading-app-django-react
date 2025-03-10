
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Pages/Login/LoginPage';
import Profile from './Pages/Profile/Profile';
import EditProfile from './Components/Profile/ProfileManagement/EditProfile';
import Admin from './Pages/Admin/Admin';
import AdminEditUser from './Components/Admin/AdminEditUser';
import ChartPage from './Pages/Chart/ChartPage';
import Currency from './Pages/Admin/Currency';
import { ToastContainer } from 'react-toastify';
import Home from './Pages/Home/Home';
import Test from './Pages/Test/Test';
import OrderPage from './Pages/Positions/OrderPage';
import Chat from './Pages/Admin/Chat';
import UserChat from './Pages/Profile/UserChat';
import PortfolioPage from './Pages/Positions/PortfolioPage';
import LandingPage from './Components/LandingPage';

function App() {
  return (
    <div className="App dark:black">
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick />
      <div className="bg-white k:black">
        <Router>
          <Routes>
            <Route path='landing/' element={<LandingPage/>} />
            <Route path="/" element={<LoginPage />} />
            <Route path='user/profile/' element={<Profile />} />
            <Route path='user/profile/edit' element={<EditProfile />} />
            <Route path='admin/' element={<Admin />} />
            <Route path='admin/user/' element={<Admin />} />
            <Route path='admin/user/edit/:id' element={<AdminEditUser />} />
            <Route path='home/chart/' element={<ChartPage />} />
            <Route path='home/' element={<Home />} />
            <Route path='user/portfolio/' element={<PortfolioPage/>}/>

            <Route path='admin/currency' element={<Currency />} />
            <Route path='user/order' element={<OrderPage/>}/>
            {/* <Route path='user/chat/' element={<UserChat/>} /> */}
            <Route path='test/' element={<Test />} />

            {/* <Route path='admin/chat/' element={<Chat/>}/> */}
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
