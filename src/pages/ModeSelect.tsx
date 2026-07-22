import { Link } from 'react-router-dom';

export default function ModeSelect() {
  return (
    <div className="page mode-select">
      <header className="hero" style={{ textAlign: 'center', paddingTop: 48 }}>
        <div className="eyebrow">Learn it · master it · race it</div>
        <h1 style={{ marginTop: 8 }}>
          What are we <span className="gradient-text">learning</span> today?
        </h1>
      </header>

      <Link to="/math" className="mode-card mode-math">
        <span className="big">🎓</span>
        <h2>Mathematics</h2>
        <p>
          The full high-school journey, grades 7–12: algebra, geometry, trig,
          logarithms, probability and your first derivatives — with lessons and
          endless practice.
        </p>
        <span className="mode-cta">Start learning →</span>
      </Link>

      <Link to="/trachtenberg" className="mode-card mode-trach">
        <span className="big">⚡</span>
        <h2>Trachtenberg</h2>
        <p>
          The legendary speed-math system: multiply, add, divide and square huge
          numbers in your head, one digit at a time.
        </p>
        <span className="mode-cta">Start speeding →</span>
      </Link>

      <Link to="/math/battle" className="mode-card mode-battle">
        <span className="big">⚔️</span>
        <h2>Multiplayer</h2>
        <p>
          Race a real opponent live — 60 seconds, same questions, most correct
          answers wins. Easy arithmetic, any grade, or Trachtenberg speed tricks.
        </p>
        <span className="mode-cta">Find an opponent →</span>
      </Link>
    </div>
  );
}
