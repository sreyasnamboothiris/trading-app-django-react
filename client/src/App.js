
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

function App() {
  return (
    <div className="App dark:black">
      <ToastContainer position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick />
      <div className="bg-white k:black">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path='user/profile/' element={<Profile />} />
            <Route path='user/profile/edit' element={<EditProfile />} />
            <Route path='admin/' element={<Admin />} />
            <Route path='admin/user/' element={<Admin />} />
            <Route path='admin/user/edit/:id' element={<AdminEditUser />} />
            <Route path='home/chart/' element={<ChartPage />} />

            <Route path='admin/currency' element={<Currency />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
