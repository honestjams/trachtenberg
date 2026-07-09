import { useEffect, useRef, useState } from 'react';
import type { Working } from '../lib/trachtenberg';

const KIND_LABELS: Record<string, string> = {
  first: 'Rightmost digit — no neighbor yet',
  middle: 'Middle digit',
  lead: 'Leading zero — the front of the number',
  overflow: 'One more spot — just the carry',
};

interface Props {
  working: Working;
  /** start on the last "done" view instead of step 1 */
  startDone?: boolean;
}

export default function DigitStepper({ working, startDone = false }: Props) {
  const { steps, paddedDigits, padCount, multiplicand, multiplier, result } = working;
  const [view, setView] = useState(startDone ? steps.length : 0);
  const done = view >= steps.length;
  const step = done ? null : steps[view];

  useEffect(() => {
    setView(startDone ? working.steps.length : 0);
  }, [working, startDone]);

  // keep the active digit visible when the board is wider than the screen
  const boardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const board = boardRef.current;
    if (!board || board.scrollWidth <= board.clientWidth) return;
    const target = board.querySelector<HTMLElement>('.digit-tile.current');
    if (!target) {
      board.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    const cellRect = target.parentElement!.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    board.scrollTo({
      left:
        board.scrollLeft +
        (cellRect.left - boardRect.left) -
        board.clientWidth / 2 +
        cellRect.width / 2,
      behavior: 'smooth',
    });
  }, [view, working]);

  const pairTag = working.method === 'direct' ? 'pair' : 'neighbor';
  const bDigits = working.multiplierDigits;
  const fingerAt = (j: number): number | null =>
    bDigits && j >= 0 && j < bDigits.length ? bDigits[bDigits.length - 1 - j] : null;

  const columns = paddedDigits.map((digit, i) => {
    const position = paddedDigits.length - 1 - i;
    const isPad = i < padCount;
    const isCurrent = !done && position === view;
    const isNeighbor =
      !done && position < view && position >= view - working.pairSpan && position >= 0;
    const filled = done || position < view;
    const fresh = position === view - 1 && !done;
    const showCarry = isCurrent && step !== null && step.carryIn > 0;
    // which multiplier finger (0 = units) sits under this column right now
    const fingerJ = !done && bDigits ? view - position : -1;
    const finger = fingerAt(fingerJ);
    return {
      digit,
      position,
      isPad,
      isCurrent,
      isNeighbor,
      filled,
      fresh,
      showCarry,
      fingerJ,
      finger,
      key: i,
    };
  });

  return (
    <div className="stepper">
      <div className="digit-board" ref={boardRef}>
        <div
          className="digit-grid"
          style={{ gridTemplateColumns: `repeat(${paddedDigits.length}, auto)` }}
        >
          {columns.map((c) => (
            <div className="digit-cell" key={c.key}>
              <div className="carry-slot">{c.showCarry ? `+${step!.carryIn}` : ''}</div>
              <div
                className={[
                  'digit-tile',
                  c.isPad ? 'pad' : '',
                  c.isCurrent ? 'current' : '',
                  c.isNeighbor ? 'neighbor' : '',
                  c.isNeighbor && c.finger !== null ? `tone-${c.fingerJ}` : '',
                ].join(' ')}
              >
                {c.isCurrent && <span className="tile-tag">digit</span>}
                {c.isNeighbor && <span className="tile-tag">{pairTag}</span>}
                {c.digit}
              </div>
              {bDigits && (
                <div className="finger-slot">
                  {c.finger !== null && (
                    <span className={`finger-chip tone-${c.fingerJ}`}>×{c.finger}</span>
                  )}
                </div>
              )}
              <div
                className={[
                  'result-slot',
                  c.filled ? 'filled' : '',
                  c.fresh ? 'fresh' : '',
                ].join(' ')}
              >
                {c.filled ? steps[c.position].resultDigit : '·'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {step ? (
        <div className="step-explain">
          <div className="step-count">
            Step {view + 1} of {steps.length} · {step.title ?? KIND_LABELS[step.kind]}
          </div>
          <div className="part-pills">
            {step.parts.length === 0 && (
              <span className="part-pill">
                nothing left to compute <span className="val">0</span>
              </span>
            )}
            {step.parts.map((p, i) => (
              <span
                className={`part-pill${p.tone !== undefined ? ` tone-${p.tone}` : ''}`}
                key={i}
              >
                {p.label} <span className="val">{p.value}</span>
              </span>
            ))}
            {step.carryIn > 0 && (
              <span className="part-pill carry">
                carry from last step <span className="val">+{step.carryIn}</span>
              </span>
            )}
          </div>
          <div className="step-outcome">
            <span className="total">= {step.total}</span>
            <span className="write">→ write {step.resultDigit}</span>
            {step.carryOut > 0 && <span className="carry">carry {step.carryOut}</span>}
          </div>
        </div>
      ) : (
        <div className="step-explain stepper-done">
          <div className="step-count">All done — read the answer left to right</div>
          <div className="big-answer">
            {multiplicand.toLocaleString()} × {multiplier} ={' '}
            {result.toLocaleString()}
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
