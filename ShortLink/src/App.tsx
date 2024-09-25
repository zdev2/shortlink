import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import MainMenu from './MainPage';

function App() {
  return (
    <Router basename='/Dedengeming/'>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main-menu" element={<MainMenu />} />
      </Routes>
    </Router>
  );
}

export default App;

