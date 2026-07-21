import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MathKeypad from '../../components/MathKeypad';
import { GRADES, topicById, topicsForGrade } from '../../math/curriculum';
import { answerText, gradeAnswer, inputHint, keypadKeysFor } from '../../math/grading';
import type { MathQuestion, Topic } from '../../math/types';
import {
  loadMathSettings,
  loadMathStats,
  recordMathAnswer,
  saveMathSettings,
} from '../../lib/storage';

type Phase = 'setup' | 'asking' | 'answered';

interface Question {
  topic: Topic;
  q: MathQuestion;
}

function makeQuestion(topics: Topic[]): Question {
  const topic = topics[Math.floor(Math.random() * topics.length)];
  return { topic, q: topic.generate() };
}

/** toggle a leading minus on the segment after the last comma */
function toggleNeg(answer: string): string {
  const cut = answer.lastIndexOf(',') + 1;
  const head = answer.slice(0, cut);
  const seg = answer.slice(cut);
  return seg.startsWith('-') ? head + seg.slice(1) : `${head}-${seg}`;
}

export default function MathPractice() {
  const [searchParams] = useSearchParams();
  const stored = useMemo(loadMathSettings, []);
  const tParam = searchParams.get('t');
  const gParam = Number(searchParams.get('g'));
  const paramTopic = tParam ? topicById(tParam) : undefined;

  const initialGrade = paramTopic
    ? paramTopic.grade
    : GRADES.some((g) => g.grade === gParam)
      ? gParam
      : stored.grade;

  const [grade, setGrade] = useState(initialGrade);
  const [topicIds, setTopicIds] = useState<string[]>(() => {
    if (paramTopic) return [paramTopic.id];
    const valid = stored.topicIds.filter((id) => topicById(id)?.grade === initialGrade);
    return valid.length > 0 ? valid : topicsForGrade(initialGrade).map((t) => t.id);
  });
  const [phase, setPhase] = useState<Phase>('setup');
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [chosen, setChosen] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [streak, setStreak] = useState(() => loadMathStats().streak);
  const [session, setSession] = useState({ correct: 0, total: 0 });

  const pickGrade = (g: number) => {
    setGrade(g);
    setTopicIds(topicsForGrade(g).map((t) => t.id));
  };

  const toggleTopic = (id: string) => {
    setTopicIds((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((x) => x !== id)
          : prev
        : [...prev, id]
    );
  };

  const start = () => {
    saveMathSettings({ grade, topicIds });
    const topics = topicIds
      .map(topicById)
      .filter((t): t is Topic => t !== undefined);
    setSession({ correct: 0, total: 0 });
    setQuestion(makeQuestion(topics));
    setAnswer('');
    setChosen(null);
    setPhase('asking');
  };

  const finish = (correct: boolean) => {
    if (!question) return;
    const stats = recordMathAnswer(question.topic.id, correct);
    setStreak(stats.streak);
    setSession((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setWasCorrect(correct);
    setPhase('answered');
  };

  const submit = () => {
    if (!question || answer === '') return;
    finish(gradeAnswer(question.q.spec, answer));
  };

  const chooseOption = (i: number) => {
    if (!question || phase !== 'asking') return;
    setChosen(i);
    finish(gradeAnswer(question.q.spec, i));
  };

  const nextQuestion = () => {
    const topics = topicIds
      .map(topicById)
      .filter((t): t is Topic => t !== undefined);
    setQuestion(makeQuestion(topics));
    setAnswer('');
    setChosen(null);
    setPhase('asking');
  };

  const spec = question?.q.spec;
  const extras = spec ? keypadKeysFor(spec) : { neg: false, dot: false, slash: false, comma: false };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'asking' || !spec || spec.type === 'choice') return;
      if (/^[0-9]$/.test(e.key)) setAnswer((a) => a + e.key);
      else if (e.key === '.' && extras.dot) setAnswer((a) => a + '.');
      else if (e.key === '/' && extras.slash) setAnswer((a) => a + '/');
      else if (e.key === ',' && extras.comma) setAnswer((a) => a + ',');
      else if (e.key === '-' && extras.neg) setAnswer(toggleNeg);
      else if (e.key === 'Backspace') setAnswer((a) => a.slice(0, -1));
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (phase === 'setup') {
    const gradeTopics = topicsForGrade(grade);
    return (
      <div className="page">
        <header>
          <div className="eyebrow">Math practice</div>
          <h1 style={{ fontSize: '1.7rem', marginTop: 4 }}>Drill it in</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.95rem' }}>
            Pick a grade and the topics to mix. Questions never run out.
          </p>
        </header>

        <div className="card">
          <div className="setting-label">Grade</div>
          <div className="chip-row">
            {GRADES.map((g) => (
              <button
                key={g.grade}
                className={`chip${grade === g.grade ? ' on' : ''}`}
                onClick={() => pickGrade(g.grade)}
              >
                {g.grade}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="setting-label">Topics</div>
          <div className="chip-row">
            {gradeTopics.map((t) => (
              <button
                key={t.id}
                className={`chip chip-wide${topicIds.includes(t.id) ? ' on' : ''}`}
                onClick={() => toggleTopic(t.id)}
              >
                {t.title}
              </button>
            ))}
          </div>
          <div className="chip-row" style={{ marginTop: 10 }}>
            <button className="chip" onClick={() => setTopicIds(gradeTopics.map((t) => t.id))}>
              Select all
            </button>
          </div>
        </div>

        <button className="btn btn-warm btn-block" onClick={start}>
          ⚡ Start practicing
        </button>
      </div>
    );
  }

  if (!question || !spec) return null;

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

      <div className="card problem-card" style={{ paddingTop: 22 }}>
        <div className="step-count" style={{ marginBottom: 10 }}>
          {question.topic.title}
        </div>
        <div className="problem-math">{question.q.prompt}</div>
        {question.q.instruction && (
          <p className="entry-hint" style={{ marginTop: 6 }}>{question.q.instruction}</p>
        )}

        {spec.type !== 'choice' && (
          <>
            <div
              className={`answer-display${
                phase === 'answered' ? (wasCorrect ? ' correct' : ' wrong') : ''
              }`}
              aria-label="your answer"
            >
              {answer === '' ? <span className="placeholder">?</span> : answer.replace(/-/g, '−')}
              {phase === 'asking' && <span className="entry-caret" />}
            </div>
            <p className="entry-hint">{inputHint(spec)}</p>
          </>
        )}
      </div>

      {spec.type === 'choice' && (
        <div className="mc-options">
          {spec.options.map((opt, i) => {
            const state =
              phase === 'answered'
                ? i === spec.correct
                  ? ' mc-correct'
                  : i === chosen
                    ? ' mc-wrong'
                    : ''
                : '';
            return (
              <button
                key={i}
                className={`mc-option${state}`}
                onClick={() => chooseOption(i)}
                disabled={phase === 'answered'}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {phase === 'asking' && spec.type !== 'choice' && (
        <MathKeypad
          extras={extras}
          onDigit={(d) => setAnswer((a) => a + d)}
          onExtra={(k) => {
            if (k === 'neg') setAnswer(toggleNeg);
            else setAnswer((a) => a + (k === 'dot' ? '.' : k === 'slash' ? '/' : ','));
          }}
          onBackspace={() => setAnswer((a) => a.slice(0, -1))}
          onSubmit={submit}
          canSubmit={answer !== ''}
        />
      )}

      {phase === 'answered' && (
        <>
          <div className={`feedback ${wasCorrect ? 'good' : 'bad'}`}>
            {wasCorrect
              ? '✓ Correct — nice one!'
              : `✗ Not quite. The answer is ${answerText(spec)}.`}
          </div>

          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              How to solve it
            </div>
            <ol className="square-lines">
              {question.q.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <button className="btn btn-warm btn-block" onClick={nextQuestion}>
            Next question →
          </button>
        </>
      )}
    </div>
  );
}
