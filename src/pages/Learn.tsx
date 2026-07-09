import { Link } from 'react-router-dom';
import { ruleGroups } from '../data/tutorials';
import { loadStats, masteryFor } from '../lib/storage';

export default function Learn() {
  const stats = loadStats();

  return (
    <div className="page">
      <header>
        <div className="eyebrow">Learn</div>
        <h1 style={{ fontSize: '1.7rem', marginTop: 4 }}>One rule at a time</h1>
        <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.95rem' }}>
          Follow the order below — each rule builds on the one before it.
        </p>
      </header>

      <Link to="/learn/basics" className="tagline-banner" style={{ display: 'block' }}>
        <div className="eyebrow">Start here</div>
        <h2>The basics: neighbors, halving &amp; carries</h2>
      </Link>

      {ruleGroups().map(({ group, rules }) => (
        <section key={group}>
          <div className="setting-label">{group}</div>
          <div className="rule-list">
            {rules.map((rule) => {
              const mastery = masteryFor(stats, rule.multiplier);
              return (
                <Link
                  key={rule.multiplier}
                  to={`/learn/${rule.multiplier}`}
                  className={`rule-row${mastery === 'mastered' ? ' mastered' : ''}`}
                >
                  <div className="rule-num">×{rule.multiplier}</div>
                  <div className="meta">
                    <h3>{rule.tagline}</h3>
                    <p>
                      {mastery === 'mastered'
                        ? 'Mastered — nice work!'
                        : mastery === 'learning'
                          ? 'In progress'
                          : 'Not started'}
                    </p>
                  </div>
                  <span className="chev">›</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
