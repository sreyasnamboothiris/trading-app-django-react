
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Pages/Login/LoginPage';
import Otp from './Components/Login/Otp';
import Profile from './Pages/Profile/Profile';

function App() {
  return (
    <div className="App dark:black">
      <div className="bg-white dark:black">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path='login/otp/' element={<Otp/>}/>
            <Route path='user/profile/' element={<Profile/>}/>
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
