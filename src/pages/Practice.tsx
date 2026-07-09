import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DigitStepper from '../components/DigitStepper';
import {
  MULTIPLIERS,
  randomMultiplicand,
  workOut,
  type Multiplier,
  type Working,
} from '../lib/trachtenberg';
import {
  loadSettings,
  loadStats,
  recordAnswer,
  saveSettings,
} from '../lib/storage';

const DIGIT_OPTIONS = [
  { digits: 2, label: '2 digits' },
  { digits: 3, label: '3 digits' },
  { digits: 4, label: '4 digits' },
  { digits: 5, label: '5 digits' },
];

type Phase = 'setup' | 'asking' | 'answered';

function makeQuestion(multipliers: Multiplier[], digitCount: number): Working {
  const m = multipliers[Math.floor(Math.random() * multipliers.length)];
  return workOut(randomMultiplicand(digitCount), m);
}

export default function Practice() {
  const [searchParams] = useSearchParams();
  const stored = useMemo(loadSettings, []);
  const preselect = Number(searchParams.get('m'));
  const initialMultipliers =
    MULTIPLIERS.includes(preselect as Multiplier)
      ? [preselect as Multiplier]
      : stored.multipliers.filter((m) => MULTIPLIERS.includes(m));

  const [selected, setSelected] = useState<Multiplier[]>(
    initialMultipliers.length > 0 ? initialMultipliers : [11]
  );
  const [digitCount, setDigitCount] = useState(stored.digitCount);
  const [phase, setPhase] = useState<Phase>('setup');
  const [question, setQuestion] = useState<Working | null>(null);
  const [answer, setAnswer] = useState('');
  const [wasCorrect, setWasCorrect] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [streak, setStreak] = useState(() => loadStats().streak);
  const [session, setSession] = useState({ correct: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'asking') inputRef.current?.focus();
  }, [phase, question]);

  const toggle = (m: Multiplier) => {
    setSelected((prev) =>
      prev.includes(m)
        ? prev.length > 1
          ? prev.filter((x) => x !== m)
          : prev
        : [...prev, m].sort((a, b) => a - b)
    );
  };

  const start = () => {
    saveSettings({ multipliers: selected, digitCount });
    setSession({ correct: 0, total: 0 });
    setQuestion(makeQuestion(selected, digitCount));
    setAnswer('');
    setShowSteps(false);
    setPhase('asking');
  };

  const submit = () => {
    if (!question || answer.trim() === '') return;
    const correct = Number(answer) === question.result;
    const stats = recordAnswer(question.multiplier, correct);
    setStreak(stats.streak);
    setSession((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setWasCorrect(correct);
    setPhase('answered');
  };

  const nextQuestion = () => {
    setQuestion(makeQuestion(selected, digitCount));
    setAnswer('');
    setShowSteps(false);
    setPhase('asking');
  };

  if (phase === 'setup') {
    return (
      <div className="page">
        <header>
          <div className="eyebrow">Practice</div>
          <h1 style={{ fontSize: '1.7rem', marginTop: 4 }}>Build your speed</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.95rem' }}>
            Pick the rules to drill and how big the numbers get. Questions never run
            out.
          </p>
        </header>

        <div className="card">
          <div className="setting-label">Multipliers</div>
          <div className="chip-row">
            {MULTIPLIERS.map((m) => (
              <button
                key={m}
                className={`chip${selected.includes(m) ? ' on' : ''}`}
                onClick={() => toggle(m)}
              >
                ×{m}
              </button>
            ))}
          </div>
          <div className="chip-row" style={{ marginTop: 10 }}>
            <button className="chip" onClick={() => setSelected([...MULTIPLIERS])}>
              Select all
            </button>
          </div>
        </div>

        <div className="card">
          <div className="setting-label">Number size</div>
          <div className="chip-row">
            {DIGIT_OPTIONS.map((o) => (
              <button
                key={o.digits}
                className={`chip${digitCount === o.digits ? ' on' : ''}`}
                onClick={() => setDigitCount(o.digits)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-warm btn-block" onClick={start}>
          ⚡ Start practicing
        </button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="page">
      <div className="practice-header">
        <button className="back-link" onClick={() => setPhase('setup')}>
          ‹ Settings
        </button>
        <span className="pill">
          {session.correct}/{session.total} this session
        </span>
        <span className="streak-flame">🔥 {streak}</span>
      </div>

      <div className="card problem-card">
        <div className="problem">
          {question.multiplicand.toLocaleString()}
          <span className="times">×</span>
          {question.multiplier}
        </div>

        <input
          ref={inputRef}
          className={`answer-input${
            phase === 'answered' ? (wasCorrect ? ' correct' : ' wrong') : ''
          }`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="?"
          value={answer}
          disabled={phase === 'answered'}
          onChange={(e) => setAnswer(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
      </div>

      {phase === 'asking' && (
        <button
          className="btn btn-primary btn-block"
          onClick={submit}
          disabled={answer.trim() === ''}
        >
          Check answer
        </button>
      )}

      {phase === 'answered' && (
        <>
          <div className={`feedback ${wasCorrect ? 'good' : 'bad'}`}>
            {wasCorrect
              ? '✓ Correct — nice one!'
              : `✗ Not quite. The answer is ${question.result.toLocaleString()}.`}
          </div>

          {showSteps ? (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                The Trachtenberg way, step by step
              </div>
              <DigitStepper working={question} />
            </div>
          ) : (
            <button className="btn btn-ghost btn-block" onClick={() => setShowSteps(true)}>
              🔍 Show me the steps
            </button>
          )}

          <button className="btn btn-warm btn-block" onClick={nextQuestion}>
            Next question →
          </button>
        </>
      )}
    </div>
  );
}
