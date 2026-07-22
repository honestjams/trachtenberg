import { createClient } from '@supabase/supabase-js';
import { topicsForGrade } from './curriculum';
import { MULTIPLIERS, randomMultiplicand } from '../lib/trachtenberg';
import { pick, randInt } from './helpers';
import type { MathQuestion } from './types';

// Publishable client credentials — safe to ship in the bundle; all writes go
// through security-definer RPCs and row-level security.
const SUPABASE_URL = 'https://noisdqxicrlknirbasrn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6cH7quT42Z-5MjaeyfhTCg_FSAv1T3e';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const BATTLE_SECONDS = 60;
export const BATTLE_QUESTION_COUNT = 40;

// Arenas are stored in the matches.grade column as ints:
// 1 = easy arithmetic, 7–12 = school grades, 13 = Trachtenberg.
export const EASY_ARENA = 1;
export const TRACHTENBERG_ARENA = 13;

export function arenaLabel(arena: number): string {
  if (arena === EASY_ARENA) return 'Easy';
  if (arena === TRACHTENBERG_ARENA) return 'Trachtenberg';
  return `Grade ${arena}`;
}

/** small-integer arithmetic: 1–12 add, subtract, multiply, divide */
function easyQuestion(): MathQuestion {
  const kind = pick(['add', 'sub', 'mul', 'div'] as const);
  const a = randInt(1, 12);
  const b = randInt(1, 12);
  if (kind === 'add') {
    return { prompt: `${a} + ${b}`, spec: { type: 'numeric', answer: a + b }, steps: [] };
  }
  if (kind === 'sub') {
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    return { prompt: `${hi} − ${lo}`, spec: { type: 'numeric', answer: hi - lo }, steps: [] };
  }
  if (kind === 'mul') {
    return { prompt: `${a} × ${b}`, spec: { type: 'numeric', answer: a * b }, steps: [] };
  }
  return { prompt: `${a * b} ÷ ${b}`, spec: { type: 'numeric', answer: a }, steps: [] };
}

/** Trachtenberg-style speed questions: rule multipliers, big × big, columns, exact division, squares */
function trachtenbergQuestion(): MathQuestion {
  const kind = pick(['rule', 'rule', 'big', 'add', 'div', 'square'] as const);
  if (kind === 'rule') {
    const a = randomMultiplicand(randInt(2, 3));
    const m = pick(MULTIPLIERS);
    return { prompt: `${a.toLocaleString()} × ${m}`, spec: { type: 'numeric', answer: a * m }, steps: [] };
  }
  if (kind === 'big') {
    const a = randomMultiplicand(2);
    const b = randInt(13, 99);
    return { prompt: `${a} × ${b}`, spec: { type: 'numeric', answer: a * b }, steps: [] };
  }
  if (kind === 'add') {
    const addends = [randomMultiplicand(2), randomMultiplicand(2), randomMultiplicand(2)];
    return {
      prompt: addends.join(' + '),
      spec: { type: 'numeric', answer: addends.reduce((x, y) => x + y, 0) },
      steps: [],
    };
  }
  if (kind === 'div') {
    const divisor = randInt(2, 9);
    const quotient = randomMultiplicand(2);
    return {
      prompt: `${(quotient * divisor).toLocaleString()} ÷ ${divisor}`,
      spec: { type: 'numeric', answer: quotient },
      steps: [],
    };
  }
  const n = pick([15, 25, 35, 45, 55, 65, 75, 85, 95, 42, 47, 53, 58, 96, 104]);
  return { prompt: `${n}²`, spec: { type: 'numeric', answer: n * n }, steps: [] };
}

export interface MatchRow {
  id: string;
  grade: number;
  status: 'waiting' | 'active' | 'done' | 'cancelled';
  player1: string;
  player1_name: string;
  player2: string | null;
  player2_name: string | null;
  questions: MathQuestion[];
  p1_score: number | null;
  p2_score: number | null;
}

const PLAYER_ID_KEY = 'trachtenberg.playerid.v1';
const PLAYER_NAME_KEY = 'trachtenberg.playername.v1';

export function playerId(): string {
  try {
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function loadPlayerName(): string {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  } catch {
    // fine — the name just won't persist
  }
}

/** questions for a battle arena: easy arithmetic, a school grade, or Trachtenberg */
export function makeBattleQuestions(arena: number, count?: number): MathQuestion[] {
  if (arena === EASY_ARENA) {
    // small numbers answer fast — provide plenty
    return Array.from({ length: count ?? 80 }, easyQuestion);
  }
  if (arena === TRACHTENBERG_ARENA) {
    return Array.from({ length: count ?? BATTLE_QUESTION_COUNT }, trachtenbergQuestion);
  }
  const topics = topicsForGrade(arena);
  const questions: MathQuestion[] = [];
  for (let i = 0; i < (count ?? BATTLE_QUESTION_COUNT); i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    questions.push(topic.generate());
  }
  return questions;
}

export async function joinMatch(
  grade: number,
  name: string,
  questions: MathQuestion[]
): Promise<MatchRow> {
  const { data, error } = await supabase
    .rpc('join_match', {
      p_grade: grade,
      p_player: playerId(),
      p_name: name,
      p_questions: questions,
    })
    .single();
  if (error) throw new Error(error.message);
  return data as MatchRow;
}

export async function cancelMatch(id: string): Promise<void> {
  await supabase.rpc('cancel_match', { p_id: id, p_player: playerId() });
}

export async function reportScore(id: string, score: number): Promise<void> {
  await supabase.rpc('report_score', { p_id: id, p_player: playerId(), p_score: score });
}

export const ARENAS: number[] = [EASY_ARENA, 7, 8, 9, 10, 11, 12, TRACHTENBERG_ARENA];

export interface LeaderboardRow {
  player: string;
  name: string;
  wins: number;
  played: number;
  best: number;
}

export interface MyStatsRow {
  arena: number;
  wins: number;
  losses: number;
  ties: number;
  played: number;
  best: number;
}

export async function fetchLeaderboard(arena: number): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('battle_leaderboard', { p_arena: arena });
  if (error) throw new Error(error.message);
  return (data ?? []) as LeaderboardRow[];
}

export async function fetchMyStats(): Promise<MyStatsRow[]> {
  const { data, error } = await supabase.rpc('battle_my_stats', { p_player: playerId() });
  if (error) throw new Error(error.message);
  return (data ?? []) as MyStatsRow[];
}

export const BOT_NAMES = ['Robo Ada', 'Captain Carry', 'Sir Sums-a-lot', 'The Denominator', 'Doctor Digit'];

/** how the practice bot behaves for an arena: milliseconds per answer and accuracy */
export function botProfile(arena: number): { minMs: number; maxMs: number; accuracy: number } {
  if (arena === EASY_ARENA) return { minMs: 2400, maxMs: 5200, accuracy: 0.8 };
  if (arena === TRACHTENBERG_ARENA) return { minMs: 5000, maxMs: 10000, accuracy: 0.7 };
  const speedup = (arena - 7) / 5; // higher grades: slightly faster, sharper bot
  return {
    minMs: 3200 - speedup * 800,
    maxMs: 7500 - speedup * 1500,
    accuracy: 0.68 + speedup * 0.14,
  };
}
