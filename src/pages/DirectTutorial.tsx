import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DigitStepper from '../components/DigitStepper';
import { randInt, randomMultiplicand, workOutDirect } from '../lib/trachtenberg';

const FINGERS = [
  { tone: 0, name: 'Units finger', text: 'the units digit of the multiplier — it always sits under the digit you are working on' },
  { tone: 1, name: 'Tens finger', text: 'the tens digit of the multiplier — it sits one place to the right, on the neighbor' },
  { tone: 2, name: 'Hundreds finger', text: 'only for 3-digit multipliers — one more place to the right' },
];

const RULE_LINES = [
  {
    when: 'Set up',
    what: 'Imagine the multiplier written on a little slip of paper, reversed, held under the number — one imaginary zero in front of the number for every digit on the slip.',
  },
  {
    when: 'Each step',
    what: 'Every finger multiplies the digit directly above it. Add those little products together, plus any carry from the last step.',
  },
  {
    when: 'Write & carry',
    what: 'Write the units of the total under the current digit, carry the tens, and slide the whole slip one place left.',
  },
  {
    when: 'Hanging off',
    what: 'When a finger pokes past either end of the number it points at nothing — that counts as 0. At the start only the units finger touches; at the end only the highest finger does.',
  },
];

const TIPS = [
  'Watch the ×-chips slide under the number in the walkthrough — that slip of paper IS the method.',
  'Each step is at most two (or three) small times-table products. You never multiply big numbers at all.',
  'The color of each chip matches the matching line in the calculation, so you can see where every product comes from.',
];

export default function DirectTutorial() {
  const [example, setExample] = useState<{ a: number; b: number }>({ a: 43, b: 26 });
  const working = useMemo(() => workOutDirect(example.a, example.b), [example]);

  return (
    <div className="page">
      <Link to="/learn" className="back-link">
        ‹ All skills
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">Big × big — the two-finger method</div>
        <h2>Multiply any two numbers, two digits at a time</h2>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          What are the “fingers”?
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: 14 }}>
          Trachtenberg imagined covering the multiplier with your hand and letting two
          fingertips rest on the big number. Each fingertip stands for one digit of the
          multiplier:
        </p>
        <div className="finger-legend">
          {FINGERS.map((f) => (
            <div className="finger-legend-row" key={f.tone}>
              <span className={`finger-chip tone-${f.tone}`}>×</span>
              <div>
                <strong>{f.name}</strong>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          The method
        </div>
        <div className="rule-statement">
          {RULE_LINES.map((line, i) => (
            <div className="line" key={i}>
              <span className="when">{line.when}</span>
              <span className="what">{line.what}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          Watch it work — {example.a.toLocaleString()} × {example.b}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 14 }}>
          The colored ×-chips under the number are the fingers. Step through and watch
          them slide left — every chip multiplies the digit right above it, and each
          product shows up in the matching color below.
        </p>
        <DigitStepper working={working} />
        <div className="action-grid" style={{ marginTop: 12 }}>
          <button
            className="btn btn-ghost"
            onClick={() => setExample({ a: randomMultiplicand(randInt(2, 3)), b: randInt(13, 99) })}
          >
            🎲 2-digit
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setExample({ a: randomMultiplicand(randInt(2, 3)), b: randInt(101, 999) })}
          >
            🎲 3-digit
          </button>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Tips</div>
        <ul className="tips">
          {TIPS.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <Link to="/practice?m=big2" className="btn btn-warm btn-block">
        ⚡ Practice big multiplications
      </Link>

      <div className="action-grid">
        <Link to="/learn/2" className="btn btn-ghost">
          ‹ ×2
        </Link>
        <Link to="/practice" className="btn btn-ghost">
          Practice ›
        </Link>
      </div>
    </div>
  );
}
