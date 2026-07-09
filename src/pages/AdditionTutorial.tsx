import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdditionStepper from '../components/AdditionStepper';
import { workOutAddition } from '../lib/operations';
import { randInt, randomMultiplicand } from '../lib/trachtenberg';

const RULE_LINES = [
  {
    when: 'Column by column',
    what: 'Add each column top to bottom, starting with the units column — but never let your running total reach 11.',
  },
  {
    when: 'The tick',
    what: 'The moment the total hits 11 or more, subtract 11, make a tick mark, and carry on counting from what is left.',
  },
  {
    when: 'Two small rows',
    what: 'At the bottom of each column write the leftover (R) and the number of ticks (T). No number you ever hold in your head is bigger than 20.',
  },
  {
    when: 'Combine',
    what: 'Each tick is worth 11 — one in its own column, one in the next column left. So each answer digit is: remainder + ticks here + ticks from the column to the right (plus any carry).',
  },
];

const TIPS = [
  'Working with only tiny numbers is the whole point — long columns stop being scary.',
  'Say “tick” out loud when you cross 11; the rhythm makes it automatic.',
  'The R row can hold a 10 — that is fine, it sorts itself out in the combine step.',
];

function randomAddends(): number[] {
  const count = randInt(3, 4);
  return Array.from({ length: count }, () => randomMultiplicand(3));
}

export default function AdditionTutorial() {
  const [addends, setAddends] = useState<number[]>([456, 789, 324]);
  const working = useMemo(() => workOutAddition(addends), [addends]);

  return (
    <div className="page">
      <Link to="/learn" className="back-link">
        ‹ All skills
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">Speed addition</div>
        <h2>Never count past eleven</h2>
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
          Watch it work
        </div>
        <AdditionStepper working={working} />
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 12 }}
          onClick={() => setAddends(randomAddends())}
        >
          🎲 Try different numbers
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

      <Link to="/practice?m=add" className="btn btn-warm btn-block">
        ⚡ Practice speed addition
      </Link>
    </div>
  );
}
