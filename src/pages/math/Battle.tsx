import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { RealtimeChannel } from '@supabase/supabase-js';
import MathKeypad from '../../components/MathKeypad';
import { GRADES } from '../../math/curriculum';
import { answerText, gradeAnswer, keypadKeysFor } from '../../math/grading';
import type { MathQuestion } from '../../math/types';
import {
  BATTLE_SECONDS,
  BOT_NAMES,
  botProfile,
  cancelMatch,
  joinMatch,
  loadPlayerName,
  makeBattleQuestions,
  playerId,
  reportScore,
  savePlayerName,
  supabase,
} from '../../math/battle';

type Phase = 'setup' | 'searching' | 'countdown' | 'racing' | 'results';

interface Opponent {
  name: string;
  bot: boolean;
}

function toggleNeg(answer: string): string {
  const cut = answer.lastIndexOf(',') + 1;
  const head = answer.slice(0, cut);
  const seg = answer.slice(cut);
  return seg.startsWith('-') ? head + seg.slice(1) : `${head}-${seg}`;
}

export default function Battle() {
  const [name, setName] = useState(loadPlayerName);
  const [grade, setGrade] = useState(7);
  const [phase, setPhase] = useState<Phase>('setup');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(BATTLE_SECONDS);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [flash, setFlash] = useState<'right' | 'wrong' | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [oppScore, setOppScore] = useState(0);
  const [oppLeft, setOppLeft] = useState(false);
  const [oppFinal, setOppFinal] = useState<number | null>(null);
  const [searchingLong, setSearchingLong] = useState(false);

  const matchIdRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timersRef = useRef<number[]>([]);
  const botTimerRef = useRef<number | null>(null);
  const myScoreRef = useRef(0);
  const oppScoreRef = useRef(0);
  const phaseRef = useRef<Phase>('setup');
  phaseRef.current = phase;

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
    if (botTimerRef.current !== null) {
      window.clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
  }, []);

  const teardownChannel = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      teardownChannel();
      if (matchIdRef.current) void cancelMatch(matchIdRef.current);
    };
  }, [clearTimers, teardownChannel]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  /* ---------- race engine ---------- */

  const beginRace = useCallback((qs: MathQuestion[], opp: Opponent) => {
    setQuestions(qs);
    setOpponent(opp);
    setIndex(0);
    setAnswer('');
    setMyScore(0);
    setOppScore(0);
    myScoreRef.current = 0;
    oppScoreRef.current = 0;
    setOppFinal(null);
    setOppLeft(false);
    setPhase('countdown');
    setCountdown(3);
    later(() => setCountdown(2), 1000);
    later(() => setCountdown(1), 2000);
    later(() => {
      setPhase('racing');
      const endAt = Date.now() + BATTLE_SECONDS * 1000;
      const tick = () => {
        const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        setTimeLeft(left);
        if (left <= 0) {
          finishRace();
        } else {
          later(tick, 250);
        }
      };
      setTimeLeft(BATTLE_SECONDS);
      tick();
    }, 3000);
  }, []);

  const finishRace = useCallback(() => {
    if (phaseRef.current === 'results') return;
    setPhase('results');
    const score = myScoreRef.current;
    if (channelRef.current) {
      void channelRef.current.send({
        type: 'broadcast',
        event: 'final',
        payload: { pid: playerId(), score },
      });
    }
    if (matchIdRef.current) void reportScore(matchIdRef.current, score);
    if (botTimerRef.current !== null) {
      window.clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
      setOppFinal(oppScoreRef.current);
    }
  }, []);

  /* ---------- online matchmaking ---------- */

  const findOpponent = async () => {
    const trimmed = name.trim() || 'Player';
    savePlayerName(trimmed);
    setError(null);
    setSearchingLong(false);
    setPhase('searching');
    later(() => setSearchingLong(true), 10_000);
    try {
      const qs = makeBattleQuestions(grade);
      const match = await joinMatch(grade, trimmed, qs);
      matchIdRef.current = match.id;
      const iAmCreator = match.player1 === playerId();
      const matchQuestions = match.questions;

      const channel = supabase.channel(`match:${match.id}`, {
        config: { presence: { key: playerId() }, broadcast: { self: false } },
      });
      channelRef.current = channel;

      channel.on('broadcast', { event: 'start' }, ({ payload }) => {
        if (phaseRef.current !== 'searching') return;
        clearTimers();
        beginRace(matchQuestions, { name: String(payload.oppName ?? 'Opponent'), bot: false });
      });
      channel.on('broadcast', { event: 'progress' }, ({ payload }) => {
        oppScoreRef.current = Number(payload.score) || 0;
        setOppScore(oppScoreRef.current);
      });
      channel.on('broadcast', { event: 'final' }, ({ payload }) => {
        setOppFinal(Number(payload.score) || 0);
      });
      channel.on('presence', { event: 'sync' }, () => {
        const everyone = Object.values(channel.presenceState()).flat() as { name?: string }[];
        if (
          iAmCreator &&
          phaseRef.current === 'searching' &&
          everyone.length >= 2
        ) {
          const other = (
            Object.entries(channel.presenceState()).find(([key]) => key !== playerId())?.[1] as
              | { name?: string }[]
              | undefined
          )?.[0];
          void channel.send({
            type: 'broadcast',
            event: 'start',
            payload: { oppName: name.trim() || 'Player' },
          });
          clearTimers();
          beginRace(matchQuestions, { name: other?.name ?? 'Opponent', bot: false });
        }
      });
      channel.on('presence', { event: 'leave' }, ({ key }) => {
        if (key !== playerId() && (phaseRef.current === 'racing' || phaseRef.current === 'countdown')) {
          setOppLeft(true);
        }
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: trimmed });
          // the claimer announces readiness; the creator's presence-sync fires the start
          if (!iAmCreator) {
            // if the creator vanished, bail out after a wait
            later(() => {
              if (phaseRef.current === 'searching') {
                setError('The opponent disappeared — try again.');
                setPhase('setup');
                teardownChannel();
              }
            }, 12_000);
          }
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError('Connection trouble — check your network and try again.');
          setPhase('setup');
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the arena.');
      setPhase('setup');
    }
  };

  const cancelSearch = () => {
    clearTimers();
    teardownChannel();
    if (matchIdRef.current) {
      void cancelMatch(matchIdRef.current);
      matchIdRef.current = null;
    }
    setPhase('setup');
  };

  /* ---------- bot mode ---------- */

  const playBot = () => {
    const trimmed = name.trim() || 'Player';
    savePlayerName(trimmed);
    clearTimers();
    teardownChannel();
    if (matchIdRef.current) {
      void cancelMatch(matchIdRef.current);
      matchIdRef.current = null;
    }
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const profile = botProfile(grade);
    beginRace(makeBattleQuestions(grade), { name: botName, bot: true });
    const botTick = () => {
      const delay = profile.minMs + Math.random() * (profile.maxMs - profile.minMs);
      botTimerRef.current = window.setTimeout(() => {
        if (phaseRef.current === 'racing') {
          if (Math.random() < profile.accuracy) {
            oppScoreRef.current += 1;
            setOppScore(oppScoreRef.current);
          }
          botTick();
        }
      }, delay);
    };
    botTick();
  };

  /* ---------- answering ---------- */

  const question = questions[index] ?? null;
  const spec = question?.spec ?? null;
  const extras = spec ? keypadKeysFor(spec) : { neg: false, dot: false, slash: false, comma: false };

  const advance = (correct: boolean) => {
    if (correct) {
      myScoreRef.current += 1;
      setMyScore(myScoreRef.current);
      if (channelRef.current) {
        void channelRef.current.send({
          type: 'broadcast',
          event: 'progress',
          payload: { pid: playerId(), score: myScoreRef.current },
        });
      }
    }
    setFlash(correct ? 'right' : 'wrong');
    later(() => setFlash(null), 350);
    setAnswer('');
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const submitTyped = () => {
    if (!spec || answer === '' || phase !== 'racing') return;
    advance(gradeAnswer(spec, answer));
  };

  const chooseOption = (i: number) => {
    if (!spec || phase !== 'racing') return;
    advance(gradeAnswer(spec, i));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'racing' || !spec || spec.type === 'choice') return;
      if (/^[0-9]$/.test(e.key)) setAnswer((a) => a + e.key);
      else if (e.key === '.' && extras.dot) setAnswer((a) => a + '.');
      else if (e.key === '/' && extras.slash) setAnswer((a) => a + '/');
      else if (e.key === ',' && extras.comma) setAnswer((a) => a + ',');
      else if (e.key === '-' && extras.neg) setAnswer(toggleNeg);
      else if (e.key === 'Backspace') setAnswer((a) => a.slice(0, -1));
      else if (e.key === 'Enter') submitTyped();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const backToSetup = () => {
    clearTimers();
    teardownChannel();
    matchIdRef.current = null;
    setPhase('setup');
  };

  /* ---------- render ---------- */

  if (phase === 'setup') {
    return (
      <div className="page">
        <header>
          <div className="eyebrow">Math battle</div>
          <h1 style={{ fontSize: '1.7rem', marginTop: 4 }}>
            Race a real opponent, <span className="gradient-text">60 seconds</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.95rem' }}>
            Same questions, same clock — most correct answers wins.
          </p>
        </header>

        {error && <div className="feedback bad">{error}</div>}

        <div className="card">
          <div className="setting-label">Your name</div>
          <input
            className="name-input"
            type="text"
            maxLength={18}
            placeholder="Speedy"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="setting-label" style={{ marginTop: 16 }}>
            Grade
          </div>
          <div className="chip-row">
            {GRADES.map((g) => (
              <button
                key={g.grade}
                className={`chip${grade === g.grade ? ' on' : ''}`}
                onClick={() => setGrade(g.grade)}
              >
                {g.grade}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-warm btn-block" onClick={() => void findOpponent()}>
          ⚔️ Find an opponent
        </button>
        <button className="btn btn-ghost btn-block" onClick={playBot}>
          🤖 Battle the robot instead
        </button>
      </div>
    );
  }

  if (phase === 'searching') {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '44px 20px' }}>
          <div className="searching-pulse">⚔️</div>
          <h2 style={{ marginTop: 14 }}>Looking for an opponent…</h2>
          <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: '0.92rem' }}>
            Grade {grade} arena. The first player to arrive gets matched with you.
          </p>
        </div>
        {searchingLong && (
          <button className="btn btn-warm btn-block" onClick={playBot}>
            🤖 No one around — battle the robot
          </button>
        )}
        <button className="btn btn-ghost btn-block" onClick={cancelSearch}>
          Cancel
        </button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div className="step-count">
            You vs {opponent?.name} · grade {grade}
          </div>
          <div className="countdown-big">{countdown}</div>
          <p style={{ color: 'var(--muted)' }}>Most correct answers in {BATTLE_SECONDS} seconds wins!</p>
        </div>
      </div>
    );
  }

  if (phase === 'racing' && question && spec) {
    return (
      <div className="page">
        <div className="battle-timer">
          <div
            className="battle-timer-fill"
            style={{ width: `${(timeLeft / BATTLE_SECONDS) * 100}%` }}
          />
          <span className="battle-timer-label">{timeLeft}s</span>
        </div>

        <div className="vs-row">
          <div className="vs-player me">
            <span className="vs-name">You</span>
            <span className="vs-score">{myScore}</span>
          </div>
          <span className="vs-divider">vs</span>
          <div className="vs-player">
            <span className="vs-name">
              {opponent?.name}
              {oppLeft ? ' (left!)' : ''}
            </span>
            <span className="vs-score">{oppScore}</span>
          </div>
        </div>

        <div
          className={`card problem-card battle-q${flash ? ` flash-${flash}` : ''}`}
          style={{ paddingTop: 18 }}
          data-answer={answerText(spec)}
        >
          <div className="problem-math">{question.prompt}</div>
          {question.instruction && <p className="entry-hint">{question.instruction}</p>}
          {spec.type !== 'choice' && (
            <div className="answer-display" aria-label="your answer">
              {answer === '' ? <span className="placeholder">?</span> : answer.replace(/-/g, '−')}
              <span className="entry-caret" />
            </div>
          )}
        </div>

        {spec.type === 'choice' ? (
          <div className="mc-options">
            {spec.options.map((opt, i) => (
              <button key={i} className="mc-option" onClick={() => chooseOption(i)}>
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <MathKeypad
            extras={extras}
            onDigit={(d) => setAnswer((a) => a + d)}
            onExtra={(k) => {
              if (k === 'neg') setAnswer(toggleNeg);
              else setAnswer((a) => a + (k === 'dot' ? '.' : k === 'slash' ? '/' : ','));
            }}
            onBackspace={() => setAnswer((a) => a.slice(0, -1))}
            onSubmit={submitTyped}
            canSubmit={answer !== ''}
          />
        )}

        <button className="btn btn-ghost btn-block" onClick={() => advance(false)}>
          Skip →
        </button>
      </div>
    );
  }

  if (phase === 'results') {
    const theirScore = oppFinal ?? oppScore;
    const won = myScore > theirScore || (oppLeft && myScore >= theirScore);
    const tie = !oppLeft && myScore === theirScore;
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="result-emoji">{won ? '🏆' : tie ? '🤝' : '💪'}</div>
          <h1 style={{ fontSize: '1.9rem', marginTop: 8 }}>
            {won ? 'You win!' : tie ? 'Dead heat!' : 'So close!'}
          </h1>
          <div className="vs-row" style={{ marginTop: 20 }}>
            <div className="vs-player me">
              <span className="vs-name">You</span>
              <span className="vs-score">{myScore}</span>
            </div>
            <span className="vs-divider">vs</span>
            <div className="vs-player">
              <span className="vs-name">{opponent?.name}</span>
              <span className="vs-score">{theirScore}</span>
            </div>
          </div>
          {oppFinal === null && !opponent?.bot && (
            <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: '0.85rem' }}>
              (waiting for {opponent?.name}'s final score — this is their last known)
            </p>
          )}
        </div>

        <button className="btn btn-warm btn-block" onClick={backToSetup}>
          ⚔️ Rematch
        </button>
        <Link to="/math" className="btn btn-ghost btn-block">
          Back to math
        </Link>
      </div>
    );
  }

  return null;
}
