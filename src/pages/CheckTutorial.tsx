import { useState } from 'react';
import { Link } from 'react-router-dom';
import { digitSum } from '../lib/operations';
import { randInt, randomMultiplicand } from '../lib/trachtenberg';

function spellSum(n: number): string {
  const digits = String(n).split('').join(' + ');
  return String(n).length > 1 ? `${digits} → ${digitSum(n)}` : `${digitSum(n)}`;
}

export default function CheckTutorial() {
  const [example, setExample] = useState({ a: 356, b: 47 });
  const { a, b } = example;
  const product = a * b;
  const da = digitSum(a);
  const db = digitSum(b);
  const check = digitSum(da * db);

  return (
    <div className="page">
      <Link to="/learn" className="back-link">
        ‹ All skills
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">Check your work</div>
        <h2>The digit-sum check catches mistakes in seconds</h2>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          The idea
        </div>
        <div className="rule-statement">
          <div className="line">
            <span className="when">Digit sum</span>
            <span className="what">
              Add a number's digits until one digit is left: 356 → 3 + 5 + 6 = 14 → 1 + 4
              = 5.
            </span>
          </div>
          <div className="line">
            <span className="when">The check</span>
            <span className="what">
              Digit sums survive arithmetic. Multiply the digit sums of your two numbers,
              take the digit sum of that — it must match the digit sum of your answer.
            </span>
          </div>
          <div className="line">
            <span className="when">Mismatch?</span>
            <span className="what">
              Then the answer is definitely wrong — go find the slip. A match means it is
              almost certainly right.
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          See it — {a.toLocaleString()} × {b} = {product.toLocaleString()}
        </div>
        <div className="step-explain">
          <div className="part-pills">
            <span className="part-pill">
              digit sum of {a}: {spellSum(a)}
            </span>
            <span className="part-pill">
              digit sum of {b}: {spellSum(b)}
            </span>
            <span className="part-pill">
              {da} × {db} = {da * db} → digit sum <span className="val">{check}</span>
            </span>
            <span className="part-pill">
              digit sum of {product.toLocaleString()}: {spellSum(product)}
            </span>
          </div>
          <div className="step-outcome">
            <span className="write">
              {check} = {digitSum(product)} ✓ the answer checks out
            </span>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 12 }}
          onClick={() =>
            setExample({ a: randomMultiplicand(randInt(2, 4)), b: randInt(12, 99) })
          }
        >
          🎲 Check a different multiplication
        </button>
      </div>

      <div className="card">
        <div className="eyebrow">Good to know</div>
        <ul className="tips">
          <li>It works for addition too: the digit sum of the total matches the digit sum of all the addends' digit sums added together.</li>
          <li>Trachtenberg insisted on checking every answer — speed means nothing without confidence.</li>
          <li>The check can miss errors that happen to differ by exactly 9 — rare, but it is a spot check, not a proof.</li>
        </ul>
      </div>
    </div>
  );
}
