
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Pages/Login/LoginPage';
import Otp from './Components/Login/Otp';
import Profile from './Pages/Profile/Profile';
import EditProfile from './Components/Profile/EditProfile';
import Admin from './Pages/Admin/Admin';
import AdminEditUser from './Components/Admin/AdminEditUser';
import ChartPage from './Pages/Chart/ChartPage';

function App() {
  return (
    <div className="App dark:black">
      <div className="bg-white dark:black">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path='login/otp/' element={<Otp/>}/>
            <Route path='user/profile/' element={<Profile/>}/>
            <Route path='user/profile/edit' element={<EditProfile/>}/>
            <Route path='admin/' element={<Admin/>}/>
            <Route path='admin/user/' element={<Admin/>}/>
            <Route path='admin/user/edit/:id' element={<AdminEditUser/>}/>
            <Route path='home/chart/' element={<ChartPage/>} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
