
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Pages/Login/LoginPage';
import Otp from './Components/Login/Otp';

function App() {
  return (
    <div className="App">
      <div className="bg-white">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path='login/otp/' element={<Otp/>}/>
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
