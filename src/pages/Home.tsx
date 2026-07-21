import { Link } from 'react-router-dom';
import { loadStats } from '../lib/storage';

export default function Home() {
  const stats = loadStats();
  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : null;

  return (
    <div className="page">
      <header className="hero">
        <div className="eyebrow">
          The Trachtenberg Method ·{' '}
          <Link to="/" style={{ textDecoration: 'underline' }}>
            switch mode
          </Link>
        </div>
        <h1>
          Do <span className="gradient-text">huge math</span> in your head
        </h1>
        <p>
          Multiply, add, divide and square at speed — one digit at a time, never
          holding more than a small number in your head.
        </p>
      </header>

      <div className="action-grid">
        <Link to="/learn" className="action-card action-learn">
          <span className="big">📖</span>
          <h3>Learn</h3>
          <p>Interactive tutorials for every rule</p>
        </Link>
        <Link to="/practice" className="action-card action-practice">
          <span className="big">⚡</span>
          <h3>Practice</h3>
          <p>Endless problems, step-by-step solutions</p>
        </Link>
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="value">{stats.streak}</div>
          <div className="label">Streak</div>
        </div>
        <div className="stat-tile">
          <div className="value">{stats.bestStreak}</div>
          <div className="label">Best</div>
        </div>
        <div className="stat-tile">
          <div className="value">{accuracy === null ? '—' : `${accuracy}%`}</div>
          <div className="label">Accuracy</div>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">The story</div>
        <h3 style={{ margin: '6px 0 8px' }}>A system built from nothing</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
          Jakow Trachtenberg developed this system of speed mathematics entirely in
          his head while imprisoned in a Nazi concentration camp, with no pen or
          paper. Multiplication rules for 2 through 12, a two-finger method for big
          numbers, addition that never counts past eleven, sliding-remainder
          division, squaring shortcuts — and a check to catch every mistake.
        </p>
        <Link
          to="/learn/basics"
          className="btn btn-ghost btn-block"
          style={{ marginTop: 16 }}
        >
          Start with the basics →
        </Link>
      </div>
    </div>
  );
}
