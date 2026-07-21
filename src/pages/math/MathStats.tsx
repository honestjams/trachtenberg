import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GRADES, topicsForGrade } from '../../math/curriculum';
import { loadMathStats, resetMathStats, type MathStats as MathStatsData } from '../../lib/storage';

export default function MathStats() {
  const [stats, setStats] = useState<MathStatsData>(loadMathStats);
  const [confirming, setConfirming] = useState(false);

  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : null;

  return (
    <div className="page">
      <header>
        <div className="eyebrow">Math progress</div>
        <h1 style={{ fontSize: '1.7rem', marginTop: 4 }}>Your stats</h1>
      </header>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="value">{stats.totalAnswered}</div>
          <div className="label">Answered</div>
        </div>
        <div className="stat-tile">
          <div className="value">{stats.bestStreak}</div>
          <div className="label">Best streak</div>
        </div>
        <div className="stat-tile">
          <div className="value">{accuracy === null ? '—' : `${accuracy}%`}</div>
          <div className="label">Accuracy</div>
        </div>
      </div>

      {GRADES.map((g) => {
        const topics = topicsForGrade(g.grade);
        const touched = topics.filter((t) => (stats.byTopic[t.id]?.total ?? 0) > 0);
        if (touched.length === 0) return null;
        return (
          <div className="card" key={g.grade}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              {g.name}
            </div>
            {topics.map((t) => {
              const r = stats.byTopic[t.id];
              const pct = r && r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
              return (
                <div className="rule-stat" key={t.id}>
                  <span className="mult" style={{ width: 110, fontSize: '0.8rem' }}>
                    {t.title}
                  </span>
                  <div className="meter">
                    <div style={{ width: `${pct}%` }} />
                  </div>
                  <span className="pct">
                    {r && r.total > 0 ? `${pct}% · ${r.total}` : 'not tried'}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}

      {stats.totalAnswered === 0 ? (
        <Link to="/math/practice" className="btn btn-warm btn-block">
          ⚡ Answer your first question
        </Link>
      ) : confirming ? (
        <div className="action-grid">
          <button className="btn btn-ghost" onClick={() => setConfirming(false)}>
            Keep stats
          </button>
          <button
            className="btn btn-warm"
            onClick={() => {
              setStats(resetMathStats());
              setConfirming(false);
            }}
          >
            Yes, reset
          </button>
        </div>
      ) : (
        <button className="btn btn-ghost btn-block" onClick={() => setConfirming(true)}>
          Reset math stats
        </button>
      )}
    </div>
  );
}
