import { useEffect, useMemo, useState } from 'react';
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
  type EntryMode,
} from '../lib/storage';

const DIGIT_OPTIONS = [
  { digits: 2, label: '2 digits' },
  { digits: 3, label: '3 digits' },
  { digits: 4, label: '4 digits' },
  { digits: 5, label: '5 digits' },
];

const MAX_ANSWER_DIGITS = 9;

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
  const [entry, setEntry] = useState<EntryMode>(stored.entry ?? 'rtl');
  const [phase, setPhase] = useState<Phase>('setup');
  const [question, setQuestion] = useState<Working | null>(null);
  const [answer, setAnswer] = useState('');
  const [wasCorrect, setWasCorrect] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [streak, setStreak] = useState(() => loadStats().streak);
  const [session, setSession] = useState({ correct: 0, total: 0 });

  const persist = (next: Partial<{ multipliers: Multiplier[]; digitCount: number; entry: EntryMode }>) =>
    saveSettings({
      multipliers: next.multipliers ?? selected,
      digitCount: next.digitCount ?? digitCount,
      entry: next.entry ?? entry,
    });

  const toggle = (m: Multiplier) => {
    setSelected((prev) =>
      prev.includes(m)
        ? prev.length > 1
          ? prev.filter((x) => x !== m)
          : prev
        : [...prev, m].sort((a, b) => a - b)
    );
  };

  const setEntryMode = (mode: EntryMode) => {
    setEntry(mode);
    persist({ entry: mode });
  };

  const addDigit = (d: string) => {
    setAnswer((a) => {
      if (a.length >= MAX_ANSWER_DIGITS) return a;
      return entry === 'rtl' ? d + a : a + d;
    });
  };

  const backspace = () => {
    setAnswer((a) => (entry === 'rtl' ? a.slice(1) : a.slice(0, -1)));
  };

  const start = () => {
    persist({ multipliers: selected, digitCount });
    setSession({ correct: 0, total: 0 });
    setQuestion(makeQuestion(selected, digitCount));
    setAnswer('');
    setShowSteps(false);
    setPhase('asking');
  };

  const submit = () => {
    if (!question || answer === '') return;
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

  // physical keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'asking') {
        if (/^[0-9]$/.test(e.key)) addDigit(e.key);
        else if (e.key === 'Backspace') backspace();
        else if (e.key === 'Enter') submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

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

        <div
          className={`answer-display${
            phase === 'answered' ? (wasCorrect ? ' correct' : ' wrong') : ''
          }`}
          aria-label="your answer"
        >
          {phase === 'asking' && entry === 'rtl' && <span className="entry-caret" />}
          {answer === '' ? <span className="placeholder">?</span> : answer}
          {phase === 'asking' && entry === 'ltr' && <span className="entry-caret" />}
        </div>

        <div className="entry-toggle" role="group" aria-label="digit entry direction">
          <button
            className={entry === 'rtl' ? 'on' : ''}
            onClick={() => setEntryMode('rtl')}
          >
            ← Units first
          </button>
          <button
            className={entry === 'ltr' ? 'on' : ''}
            onClick={() => setEntryMode('ltr')}
          >
            Left to right →
          </button>
        </div>
        <p className="entry-hint">
          {entry === 'rtl'
            ? 'Digits fill in from the right — type the answer as you work it out.'
            : 'Digits type in the usual way, left to right.'}
        </p>
      </div>

      {phase === 'asking' && (
        <div className="keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} className="key" onClick={() => addDigit(d)}>
              {d}
            </button>
          ))}
          <button className="key key-del" onClick={backspace} aria-label="delete">
            ⌫
          </button>
          <button className="key" onClick={() => addDigit('0')}>
            0
          </button>
          <button
            className="key key-ok"
            onClick={submit}
            disabled={answer === ''}
            aria-label="check answer"
          >
            ✓
          </button>
        </div>
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
