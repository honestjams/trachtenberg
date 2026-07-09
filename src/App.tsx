import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from './components/NavBar';
import Basics from './pages/Basics';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Practice from './pages/Practice';
import Stats from './pages/Stats';
import Tutorial from './pages/Tutorial';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/basics" element={<Basics />} />
        <Route path="/learn/:multiplier" element={<Tutorial />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <NavBar />
    </>
  );
}
