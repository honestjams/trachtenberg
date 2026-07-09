import { Link } from 'react-router-dom';

export default function Basics() {
  return (
    <div className="page">
      <Link to="/learn" className="back-link">
        ‹ All rules
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">Foundations</div>
        <h2>Five ideas power the whole system</h2>
      </div>

      <div className="card">
        <h3>1 · Work right to left</h3>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: '0.95rem' }}>
          Every rule walks the number one digit at a time, starting from the
          <strong> rightmost</strong> digit — exactly the opposite of how you read
          it. You write the answer down digit by digit as you go.
        </p>
      </div>

      <div className="card">
        <h3>2 · The neighbor</h3>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: '0.95rem' }}>
          The <strong>neighbor</strong> is the digit immediately to the{' '}
          <strong>right</strong> of the one you are working on. In{' '}
          <strong>
            4<span style={{ color: 'var(--accent)' }}>2</span>
            <span style={{ color: 'var(--accent-2)' }}>7</span>
          </strong>
          , when you work on the 2, its neighbor is the 7. The rightmost digit has
          no neighbor at all.
        </p>
      </div>

      <div className="card">
        <h3>3 · The leading zero</h3>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: '0.95rem' }}>
          Before you start, imagine a <strong>zero in front</strong> of the number:
          427 becomes <strong>0427</strong>. That zero gets its own step at the end —
          it is where the final digit of your answer comes from. Several rules have
          a special shortcut just for this step.
        </p>
      </div>

      <div className="card">
        <h3>4 · Halving drops the remainder</h3>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: '0.95rem' }}>
          When a rule says “half”, it means the lazy half: <strong>half of 7 is 3</strong>,
          half of 5 is 2, half of 3 is 1. Never think “3.5” — just say the smaller
          number instantly. And whenever the digit you are working on is{' '}
          <strong>odd, you add 5</strong>. That +5 is exactly the half that got
          dropped, coming back to keep the math honest.
        </p>
      </div>

      <div className="card">
        <h3>5 · Write one digit, carry the rest</h3>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: '0.95rem' }}>
          Each step produces a small total. Write down its <strong>units digit</strong>{' '}
          and carry the tens into the next step — the same carrying you already know
          from addition. If a step gives you 17, you write 7 and carry 1.
        </p>
      </div>

      <Link to="/learn/11" className="btn btn-primary btn-block">
        Got it — teach me ×11 →
      </Link>
    </div>
  );
}
