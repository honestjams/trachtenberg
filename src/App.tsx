import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from './components/NavBar';
import AdditionTutorial from './pages/AdditionTutorial';
import Basics from './pages/Basics';
import CheckTutorial from './pages/CheckTutorial';
import DirectTutorial from './pages/DirectTutorial';
import DivisionTutorial from './pages/DivisionTutorial';
import ModeSelect from './pages/ModeSelect';
import SquaresTutorial from './pages/SquaresTutorial';
import GradePage from './pages/math/GradePage';
import MathHome from './pages/math/MathHome';
import MathPractice from './pages/math/MathPractice';
import MathStats from './pages/math/MathStats';
import TopicLesson from './pages/math/TopicLesson';
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
        <Route path="/" element={<ModeSelect />} />
        <Route path="/trachtenberg" element={<Home />} />
        <Route path="/math" element={<MathHome />} />
        <Route path="/math/grade/:grade" element={<GradePage />} />
        <Route path="/math/topic/:id" element={<TopicLesson />} />
        <Route path="/math/practice" element={<MathPractice />} />
        <Route path="/math/stats" element={<MathStats />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/basics" element={<Basics />} />
        <Route path="/learn/direct" element={<DirectTutorial />} />
        <Route path="/learn/addition" element={<AdditionTutorial />} />
        <Route path="/learn/division" element={<DivisionTutorial />} />
        <Route path="/learn/squares" element={<SquaresTutorial />} />
        <Route path="/learn/check" element={<CheckTutorial />} />
        <Route path="/learn/:multiplier" element={<Tutorial />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<ModeSelect />} />
      </Routes>
      <NavBar />
    </>
  );
}
