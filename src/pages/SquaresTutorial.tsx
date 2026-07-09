import { useState } from 'react';
import { Link } from 'react-router-dom';
import SquareBreakdown from '../components/SquareBreakdown';
import { workOutSquare } from '../lib/operations';
import { randInt } from '../lib/trachtenberg';

const SECTIONS = [
  {
    title: 'Ends in 5',
    rule: 'Multiply the tens digit by one more than itself, then tack 25 on the end. 75² → 7 × 8 = 56 → 5625.',
    fresh: () => randInt(1, 9) * 10 + 5,
    initial: 75,
  },
  {
    title: 'Near 50',
    rule: 'See how far the number is from 50. Add that distance to 25 — that is your hundreds. Then add the distance squared. 47² → 25 − 3 = 22 hundreds, plus 3² = 9 → 2209.',
    fresh: () => {
      const n = randInt(26, 74);
      return n % 10 === 5 ? n + 1 : n;
    },
    initial: 47,
  },
  {
    title: 'Near 100',
    rule: 'See how far the number is from 100, and go that same distance again — that is your hundreds. Then add the distance squared. 96² → 96 − 4 = 92 hundreds, plus 4² = 16 → 9216.',
    fresh: () => {
      const n = randInt(85, 115);
      return n === 100 ? 101 : n;
    },
    initial: 96,
  },
];

export default function SquaresTutorial() {
  const [examples, setExamples] = useState<number[]>(SECTIONS.map((s) => s.initial));

  return (
    <div className="page">
      <Link to="/learn" className="back-link">
        ‹ All skills
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">Squaring shortcuts</div>
        <h2>Squares in a single breath</h2>
      </div>

      {SECTIONS.map((section, i) => (
        <div className="card" key={section.title}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            {section.title}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: 14 }}>
            {section.rule}
          </p>
          <div className="step-explain">
            <SquareBreakdown working={workOutSquare(examples[i])} />
          </div>
          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 12 }}
            onClick={() =>
              setExamples((prev) => prev.map((n, j) => (j === i ? section.fresh() : n)))
            }
          >
            🎲 Another one
          </button>
        </div>
      ))}

      <Link to="/practice?m=square" className="btn btn-warm btn-block">
        ⚡ Practice squaring
      </Link>
    </div>
  );
}
