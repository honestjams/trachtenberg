import { useEffect, useRef, useState } from 'react';
import type { AdditionWorking } from '../lib/operations';

const PLACE = ['units', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'];

interface Props {
  working: AdditionWorking;
}

export default function AdditionStepper({ working }: Props) {
  const { addends, width, columns, combine, result } = working;
  const totalViews = width + combine.length;
  const [view, setView] = useState(0);
  const done = view >= totalViews;
  const inColumns = !done && view < width;
  const combineIndex = view - width;

  useEffect(() => setView(0), [working]);

  const gridCols = Math.max(width, combine.length);
  const boardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const board = boardRef.current;
    if (!board || board.scrollWidth <= board.clientWidth) return;
    const target = board.querySelector<HTMLElement>('.add-cell.hot');
    if (!target) return;
    const cellRect = target.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    board.scrollTo({
      left:
        board.scrollLeft + (cellRect.left - boardRect.left) - board.clientWidth / 2 + cellRect.width / 2,
      behavior: 'smooth',
    });
  }, [view]);

  const digitOf = (a: number, pos: number): string => {
    if (pos > 0 && a < 10 ** pos) return '';
    return String(Math.floor(a / 10 ** pos) % 10);
  };

  const hotPos = inColumns ? view : !done ? combine[combineIndex].position : -1;
  const colDone = (pos: number) => done || view > pos;
  const combineDone = (pos: number) =>
    done || (view >= width && combineIndex > combine.findIndex((s) => s.position === pos));

  const cellClass = (pos: number, extra = '') =>
    `add-cell${pos === hotPos && !done ? ' hot' : ''}${extra ? ` ${extra}` : ''}`;

  const col = inColumns ? columns[view] : null;
  const comb = !done && !inColumns ? combine[combineIndex] : null;

  return (
    <div className="stepper">
      <div className="digit-board" ref={boardRef}>
        <table className="add-grid">
          <tbody>
            {addends.map((a, r) => (
              <tr key={r}>
                <td className="add-label">{r === addends.length - 1 ? '+' : ''}</td>
                {Array.from({ length: gridCols }, (_, i) => {
                  const pos = gridCols - 1 - i;
                  return (
                    <td key={i} className={cellClass(pos, 'add-digit')}>
                      {digitOf(a, pos)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="add-rule-row">
              <td className="add-label sub">R</td>
              {Array.from({ length: gridCols }, (_, i) => {
                const pos = gridCols - 1 - i;
                const c = columns[pos];
                return (
                  <td key={i} className={cellClass(pos, 'add-sub')}>
                    {c && colDone(pos) ? c.remainder : ''}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="add-label sub">T</td>
              {Array.from({ length: gridCols }, (_, i) => {
                const pos = gridCols - 1 - i;
                const c = columns[pos];
                return (
                  <td key={i} className={cellClass(pos, 'add-sub ticks')}>
                    {c && colDone(pos) ? c.ticks : ''}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="add-label">=</td>
              {Array.from({ length: gridCols }, (_, i) => {
                const pos = gridCols - 1 - i;
                const s = combine.find((x) => x.position === pos);
                return (
                  <td key={i} className={cellClass(pos, 'add-result')}>
                    {s && combineDone(pos) ? s.resultDigit : ''}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {col && (
        <div className="step-explain">
          <div className="step-count">
            Step {view + 1} of {totalViews} · {PLACE[col.position] ?? ''} column — never
            count past 11
          </div>
          <div className="part-pills">
            {col.events.map((e, i) => (
              <span className={`part-pill${e.tick ? ' tick' : ''}`} key={i}>
                {i === 0 ? `start with ${e.digit}` : `+ ${e.digit} = ${e.before + e.digit}`}
                {e.tick && (
                  <span className="val">tick! − 11 → {e.after}</span>
                )}
              </span>
            ))}
          </div>
          <div className="step-outcome">
            <span className="write">remainder {col.remainder}</span>
            <span className="carry">
              {col.ticks} tick{col.ticks === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      )}

      {comb && (
        <div className="step-explain">
          <div className="step-count">
            Step {view + 1} of {totalViews} · combine the {PLACE[comb.position] ?? ''} place
            — each tick is worth 11
          </div>
          <div className="part-pills">
            <span className="part-pill">
              remainder <span className="val">{comb.remainder}</span>
            </span>
            <span className="part-pill">
              ticks here <span className="val">{comb.ticksHere}</span>
            </span>
            <span className="part-pill">
              ticks from the right <span className="val">{comb.ticksRight}</span>
            </span>
            {comb.carryIn > 0 && (
              <span className="part-pill carry">
                carry <span className="val">+{comb.carryIn}</span>
              </span>
            )}
          </div>
          <div className="step-outcome">
            <span className="total">= {comb.total}</span>
            <span className="write">→ write {comb.resultDigit}</span>
            {comb.carryOut > 0 && <span className="carry">carry {comb.carryOut}</span>}
          </div>
        </div>
      )}

      {done && (
        <div className="step-explain stepper-done">
          <div className="step-count">All done — read the total left to right</div>
          <div className="big-answer">
            {addends.map((a) => a.toLocaleString()).join(' + ')} = {result.toLocaleString()}
          </div>
        </div>
      )}

      <div className="progress-dots">
        {Array.from({ length: totalViews }, (_, i) => (
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
            {view === totalViews - 1 ? 'Finish' : 'Next step ›'}
          </button>
        )}
      </div>
    </div>
  );
}
