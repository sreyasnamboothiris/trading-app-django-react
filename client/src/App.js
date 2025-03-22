// src/App.jsx
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
import PortfolioPage from './Pages/Positions/PortfolioPage';
import LandingPage from './Components/LandingPage';
import MainLayout from './Pages/Main/MainLayout';

function App() {
  return (
    <div className="App dark:black">
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
      />
      <div className="bg-white k:black">
        <Router>
          <Routes>
            {/* Routes without MainLayout */}
            <Route path="landing/" element={<LandingPage />} />
            <Route path="/" element={<LoginPage />} />

            {/* Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="user/profile/" element={<Profile />} />
              <Route path="user/profile/edit" element={<EditProfile />} />
              <Route path="home/chart/" element={<ChartPage />} />
              <Route path="home/" element={<Home />} />
              <Route path="user/portfolio/" element={<PortfolioPage />} />
              <Route path="user/order" element={<OrderPage />} />
              {/* Uncomment and add more routes as needed */}
              {/* <Route path="user/chat/" element={<UserChat />} /> */}
            </Route>

            {/* Admin and other standalone routes */}
            <Route path="admin/" element={<Admin />} />
            <Route path="admin/user/" element={<Admin />} />
            <Route path="admin/user/edit/:id" element={<AdminEditUser />} />
            <Route path="admin/currency" element={<Currency />} />
            <Route path="test/" element={<Test />} />
            {/* <Route path="admin/chat/" element={<Chat />} /> */}
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;