
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage";
import MainPage from "./mainpage";
import AnalyticsPage from "./analisi";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main-menu" element={<MainPage />} />
        <Route path="/analisi" element={<AnalyticsPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
