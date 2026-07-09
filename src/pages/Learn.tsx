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

      <section>
        <div className="setting-label">The grand finale</div>
        <div className="rule-list">
          <Link
            to="/learn/direct"
            className={`rule-row${masteryFor(stats, 'big2') === 'mastered' ? ' mastered' : ''}`}
          >
            <div className="rule-num">×𝑛𝑛</div>
            <div className="meta">
              <h3>Big × big: the two-finger method</h3>
              <p>Multiply any two large numbers against each other</p>
            </div>
            <span className="chev">›</span>
          </Link>
        </div>
      </section>

      <section>
        <div className="setting-label">Beyond multiplication</div>
        <div className="rule-list">
          <Link
            to="/learn/addition"
            className={`rule-row${masteryFor(stats, 'add') === 'mastered' ? ' mastered' : ''}`}
          >
            <div className="rule-num">+</div>
            <div className="meta">
              <h3>Speed addition</h3>
              <p>Never count past eleven — the tick method</p>
            </div>
            <span className="chev">›</span>
          </Link>
          <Link
            to="/learn/division"
            className={`rule-row${masteryFor(stats, 'div') === 'mastered' ? ' mastered' : ''}`}
          >
            <div className="rule-num">÷</div>
            <div className="meta">
              <h3>Speed division</h3>
              <p>Left to right, sliding the remainder along</p>
            </div>
            <span className="chev">›</span>
          </Link>
          <Link
            to="/learn/squares"
            className={`rule-row${masteryFor(stats, 'square') === 'mastered' ? ' mastered' : ''}`}
          >
            <div className="rule-num">𝑛²</div>
            <div className="meta">
              <h3>Squaring shortcuts</h3>
              <p>Ends in 5, near 50, near 100 — in one breath</p>
            </div>
            <span className="chev">›</span>
          </Link>
          <Link to="/learn/check" className="rule-row">
            <div className="rule-num">✓</div>
            <div className="meta">
              <h3>Check your work</h3>
              <p>The digit-sum check catches mistakes in seconds</p>
            </div>
            <span className="chev">›</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
