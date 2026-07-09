import { useEffect, useState } from 'react';
import type { DivisionWorking } from '../lib/operations';

interface Props {
  working: DivisionWorking;
}

export default function DivisionStepper({ working }: Props) {
  const { dividend, divisor, steps, quotient, remainder } = working;
  const [view, setView] = useState(0);
  const done = view >= steps.length;
  const step = done ? null : steps[view];

  useEffect(() => setView(0), [working]);

  return (
    <div className="stepper">
      <div className="digit-board">
        <div
          className="digit-grid"
          style={{ gridTemplateColumns: `repeat(${steps.length}, auto)` }}
        >
          {steps.map((s, i) => {
            const isCurrent = !done && i === view;
            const filled = done || i < view;
            return (
              <div className="digit-cell" key={i}>
                <div className="carry-slot">
                  {isCurrent && s.carryIn > 0 ? `r${s.carryIn}→` : ''}
                </div>
                <div className={`digit-tile${isCurrent ? ' current' : ''}`}>
                  {isCurrent && <span className="tile-tag">digit</span>}
                  {s.digit}
                </div>
                <div
                  className={[
                    'result-slot',
                    filled ? 'filled' : '',
                    i === view - 1 && !done ? 'fresh' : '',
                  ].join(' ')}
                >
                  {filled ? s.q : '·'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {step ? (
        <div className="step-explain">
          <div className="step-count">
            Step {view + 1} of {steps.length} · work LEFT to right
          </div>
          <div className="part-pills">
            {step.carryIn > 0 ? (
              <span className="part-pill carry">
                remainder {step.carryIn} slides in front of {step.digit}{' '}
                <span className="val">{step.value}</span>
              </span>
            ) : (
              <span className="part-pill">
                just the digit <span className="val">{step.digit}</span>
              </span>
            )}
            <span className="part-pill">
              {step.value} ÷ {divisor} <span className="val">{step.q}</span>
            </span>
            {step.r > 0 && (
              <span className="part-pill carry">
                remainder <span className="val">{step.r}</span>
              </span>
            )}
          </div>
          <div className="step-outcome">
            <span className="write">→ write {step.q}</span>
            {step.r > 0 && <span className="carry">remainder {step.r} carries on</span>}
          </div>
        </div>
      ) : (
        <div className="step-explain stepper-done">
          <div className="step-count">All done — the quotient reads left to right</div>
          <div className="big-answer">
            {dividend.toLocaleString()} ÷ {divisor} = {quotient.toLocaleString()}
            {remainder > 0 ? ` r ${remainder}` : ''}
          </div>
        </div>
      )}

      <div className="progress-dots">
        {steps.map((_, i) => (
          <span key={i} className={i < view ? 'done' : i === view ? 'now' : ''} />
        ))}
      </div>

      <div className="stepper-controls">
        <button className="btn btn-ghost" onClick={() => setView(Math.max(0, view - 1))} disabled={view === 0}>
          ‹ Back
        </button>
        {done ? (
          <button className="btn btn-ghost" onClick={() => setView(0)}>
            ↺ Replay
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setView(view + 1)}>
            {view === steps.length - 1 ? 'Finish' : 'Next step ›'}
          </button>
        )}
      </div>
    </div>
  );
}
