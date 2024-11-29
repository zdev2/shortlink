import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage";
import MainPage from "./mainpage";
import AnalisiPage from "./analisis";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main-menu" element={<MainPage />} />
        <Route path="/analisis" element={<AnalisiPage/>} />
        <Route path="/analisis/:id" element={<AnalisiPage/>} />
      </Routes>
    </Router>
  );
}

export default App;