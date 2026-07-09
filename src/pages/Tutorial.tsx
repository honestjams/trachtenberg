import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import DigitStepper from '../components/DigitStepper';
import { RULES, ruleFor } from '../data/tutorials';
import { randomMultiplicand, randInt, workOut } from '../lib/trachtenberg';

export default function Tutorial() {
  const { multiplier } = useParams();
  const rule = ruleFor(Number(multiplier));
  const [exampleNumber, setExampleNumber] = useState<number | null>(null);

  const working = useMemo(() => {
    if (!rule) return null;
    return workOut(exampleNumber ?? rule.exampleNumber, rule.multiplier);
  }, [rule, exampleNumber]);

  if (!rule || !working) return <Navigate to="/learn" replace />;

  const index = RULES.indexOf(rule);
  const prev = index > 0 ? RULES[index - 1] : null;
  const next = index < RULES.length - 1 ? RULES[index + 1] : null;

  return (
    <div className="page" key={rule.multiplier}>
      <Link to="/learn" className="back-link">
        ‹ All rules
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">{rule.title}</div>
        <h2>{rule.tagline}</h2>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          The rule
        </div>
        <div className="rule-statement">
          {rule.rule.map((line, i) => (
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
        <DigitStepper working={working} />
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 12 }}
          onClick={() => setExampleNumber(randomMultiplicand(randInt(3, 4)))}
        >
          🎲 Try a different number
        </button>
      </div>

      <div className="card">
        <div className="eyebrow">Tips</div>
        <ul className="tips">
          {rule.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <Link to={`/practice?m=${rule.multiplier}`} className="btn btn-warm btn-block">
        ⚡ Practice ×{rule.multiplier}
      </Link>

      <div className="action-grid">
        {prev ? (
          <Link to={`/learn/${prev.multiplier}`} className="btn btn-ghost">
            ‹ ×{prev.multiplier}
          </Link>
        ) : (
          <Link to="/learn/basics" className="btn btn-ghost">
            ‹ Basics
          </Link>
        )}
        {next ? (
          <Link to={`/learn/${next.multiplier}`} className="btn btn-ghost">
            ×{next.multiplier} ›
          </Link>
        ) : (
          <Link to="/practice" className="btn btn-ghost">
            Practice ›
          </Link>
        )}
      </div>
    </div>
  );
}
