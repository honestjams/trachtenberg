import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MULTIPLIERS } from '../lib/trachtenberg';
import {
  loadStats,
  masteryFor,
  resetStats,
  type PracticeKey,
  type Stats as StatsData,
} from '../lib/storage';

const STAT_ROWS: { key: PracticeKey; label: string }[] = [
  ...MULTIPLIERS.map((m) => ({ key: m as PracticeKey, label: `×${m}` })),
  { key: 'big2', label: '×2-digit' },
  { key: 'big3', label: '×3-digit' },
  { key: 'add', label: 'Addition' },
  { key: 'div', label: 'Division' },
  { key: 'square', label: 'Squares' },
];

export default function Stats() {
  const [stats, setStats] = useState<StatsData>(loadStats);
  const [confirming, setConfirming] = useState(false);

  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : null;

  return (
    <div className="page">
      <header>
        <div className="eyebrow">Progress</div>
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

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Accuracy by rule
        </div>
        {STAT_ROWS.map(({ key, label }) => {
          const rule = stats.byRule[key];
          const pct = rule && rule.total > 0 ? Math.round((rule.correct / rule.total) * 100) : 0;
          const mastery = masteryFor(stats, key);
          return (
            <div className="rule-stat" key={key}>
              <span className="mult">{label}</span>
              <div className="meter">
                <div style={{ width: `${pct}%` }} />
              </div>
              <span className="pct">
                {rule && rule.total > 0
                  ? `${pct}% · ${rule.total}`
                  : mastery === 'new'
                    ? 'not tried'
                    : ''}
              </span>
            </div>
          );
        })}
      </div>

      {stats.totalAnswered === 0 ? (
        <Link to="/practice" className="btn btn-warm btn-block">
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
              setStats(resetStats());
              setConfirming(false);
            }}
          >
            Yes, reset
          </button>
        </div>
      ) : (
        <button className="btn btn-ghost btn-block" onClick={() => setConfirming(true)}>
          Reset all stats
        </button>
      )}
    </div>
  );
}
