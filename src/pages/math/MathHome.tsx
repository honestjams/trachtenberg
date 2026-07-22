import { Link } from 'react-router-dom';
import { GRADES, topicsForGrade } from '../../math/curriculum';
import { loadMathStats, mathMasteryFor } from '../../lib/storage';

export default function MathHome() {
  const stats = loadMathStats();
  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : null;

  return (
    <div className="page">
      <header className="hero">
        <div className="eyebrow">Mathematics</div>
        <h1>
          Grade 7 to 12, <span className="gradient-text">one topic at a time</span>
        </h1>
        <p>
          Pick your grade, learn the concept, then practice until it sticks.
        </p>
      </header>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="value">{stats.streak}</div>
          <div className="label">Streak</div>
        </div>
        <div className="stat-tile">
          <div className="value">{stats.totalAnswered}</div>
          <div className="label">Answered</div>
        </div>
        <div className="stat-tile">
          <div className="value">{accuracy === null ? '—' : `${accuracy}%`}</div>
          <div className="label">Accuracy</div>
        </div>
      </div>

      <div className="rule-list">
        {GRADES.map((g) => {
          const topics = topicsForGrade(g.grade);
          const mastered = topics.filter(
            (t) => mathMasteryFor(stats, t.id) === 'mastered'
          ).length;
          return (
            <Link
              key={g.grade}
              to={`/math/grade/${g.grade}`}
              className={`rule-row${mastered === topics.length ? ' mastered' : ''}`}
            >
              <div className="rule-num">{g.grade}</div>
              <div className="meta">
                <h3>{g.name}</h3>
                <p>{g.blurb}</p>
              </div>
              <span className="pill">{mastered}/{topics.length}</span>
            </Link>
          );
        })}
      </div>

      <div className="action-grid">
        <Link to="/math/practice" className="btn btn-warm">
          ⚡ Practice
        </Link>
        <Link to="/math/battle" className="btn btn-primary">
          ⚔️ Battle
        </Link>
      </div>
    </div>
  );
}
