import type { SquareWorking } from '../lib/operations';

const KIND_NAMES = {
  five: 'ends in 5',
  fifty: 'near 50',
  hundred: 'near 100',
};

interface Props {
  working: SquareWorking;
}

export default function SquareBreakdown({ working }: Props) {
  return (
    <div className="square-breakdown">
      <div className="step-count">
        {working.n}² · the “{KIND_NAMES[working.kind]}” shortcut
      </div>
      <ol className="square-lines">
        {working.lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>
      <div className="stepper-done" style={{ paddingTop: 4 }}>
        <div className="big-answer">
          {working.n}² = {working.result.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
