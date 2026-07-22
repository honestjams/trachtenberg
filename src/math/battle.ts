import { createClient } from '@supabase/supabase-js';
import { topicsForGrade } from './curriculum';
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

/** questions for a battle: a shuffled mix across every topic in the grade */
export function makeBattleQuestions(grade: number, count = BATTLE_QUESTION_COUNT): MathQuestion[] {
  const topics = topicsForGrade(grade);
  const questions: MathQuestion[] = [];
  for (let i = 0; i < count; i++) {
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

export const BOT_NAMES = ['Robo Ada', 'Captain Carry', 'Sir Sums-a-lot', 'The Denominator', 'Doctor Digit'];

/** how the practice bot behaves for a grade: seconds per answer and accuracy */
export function botProfile(grade: number): { minMs: number; maxMs: number; accuracy: number } {
  const speedup = (grade - 7) / 5; // higher grades: slightly faster, sharper bot
  return {
    minMs: 3200 - speedup * 800,
    maxMs: 7500 - speedup * 1500,
    accuracy: 0.68 + speedup * 0.14,
  };
}
