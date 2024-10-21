<<<<<<< HEAD
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import MainMenu from './mainpage';
=======
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage";
import MainPage from "./mainpage";
>>>>>>> 3fdc15d11a281354885d71bec97b8f16b24cf436

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main-menu" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;
