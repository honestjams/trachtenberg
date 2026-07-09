import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DigitStepper from '../components/DigitStepper';
import { randInt, randomMultiplicand, workOutDirect } from '../lib/trachtenberg';

const RULE_LINES = [
  {
    when: 'Set up',
    what: 'Put one imaginary zero in front of the number for every digit of the multiplier (two zeros for a 2-digit multiplier).',
  },
  {
    when: 'Every step',
    what: 'Multiply the units digit of the multiplier by the current digit, and the tens digit by the neighbor. Add the two products together, plus any carry.',
  },
  {
    when: 'Write & carry',
    what: 'Write the units of that total, carry the rest, and slide one place left. The pair of digits you multiply slides left with you — like two fingers moving along the number.',
  },
  {
    when: 'Bigger still',
    what: 'A 3-digit multiplier just adds a third finger: hundreds digit × the digit after the neighbor. The pattern extends forever.',
  },
];

const TIPS = [
  'Only the pair (or trio) of digits under your fingers matters at each step — never the whole number.',
  'When a finger hangs off either end of the number, that digit counts as 0.',
  'This is how the system multiplies any two large numbers — no times tables beyond 9 × 9 needed.',
];

export default function DirectTutorial() {
  const [example, setExample] = useState<{ a: number; b: number }>({ a: 43, b: 26 });
  const working = useMemo(() => workOutDirect(example.a, example.b), [example]);

  return (
    <div className="page">
      <Link to="/learn" className="back-link">
        ‹ All rules
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">Big × big — the two-finger method</div>
        <h2>Multiply any two numbers, two digits at a time</h2>
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
