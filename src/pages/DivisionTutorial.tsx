import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DivisionStepper from '../components/DivisionStepper';
import { workOutDivision } from '../lib/operations';
import { randInt, randomMultiplicand } from '../lib/trachtenberg';

const RULE_LINES = [
  {
    when: 'Left to right',
    what: 'Unlike every other Trachtenberg skill, division starts at the FRONT of the number and moves right — you say the answer in reading order.',
  },
  {
    when: 'Every digit',
    what: 'Divide the digit by the divisor. Write the whole-number part; keep the remainder.',
  },
  {
    when: 'The remainder',
    what: 'The remainder slides in front of the next digit as its tens. Remainder 3 in front of a 4 makes 34 — divide that next.',
  },
  {
    when: 'Small answers only',
    what: 'You never divide anything bigger than 89 by a single digit, so every step is a one-digit answer from the ordinary times table.',
  },
];

const TIPS = [
  'A digit smaller than the divisor gives 0 — write the 0 and slide the whole digit along as the remainder.',
  'The last remainder is the remainder of the whole division.',
  'Read your answer back as you write it — division is the one place the digits come out in speaking order.',
];

function randomDivision(): { dividend: number; divisor: number } {
  const divisor = randInt(2, 9);
  const quotient = randomMultiplicand(3);
  return { dividend: quotient * divisor, divisor };
}

export default function DivisionTutorial() {
  const [problem, setProblem] = useState({ dividend: 3648, divisor: 8 });
  const working = useMemo(
    () => workOutDivision(problem.dividend, problem.divisor),
    [problem]
  );

  return (
    <div className="page">
      <Link to="/learn" className="back-link">
        ‹ All skills
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">Speed division</div>
        <h2>Slide the remainder, keep moving</h2>
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
          Watch it work — {working.dividend.toLocaleString()} ÷ {working.divisor}
        </div>
        <DivisionStepper working={working} />
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 12 }}
          onClick={() => setProblem(randomDivision())}
        >
          🎲 Try a different division
        </button>
      </div>

      <div className="card">
        <div className="eyebrow">Tips</div>
        <ul className="tips">
          {TIPS.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <Link to="/practice?m=div" className="btn btn-warm btn-block">
        ⚡ Practice speed division
      </Link>
    </div>
  );
}
