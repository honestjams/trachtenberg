import type { Multiplier } from './trachtenberg';

/** what a practice question is scored under: a rule multiplier, or the direct method by size */
export type PracticeKey = Multiplier | 'big2' | 'big3';

export interface RuleStats {
  correct: number;
  total: number;
}

export interface Stats {
  byRule: Partial<Record<PracticeKey, RuleStats>>;
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
}

export type EntryMode = 'rtl' | 'ltr';

export interface PracticeSettings {
  multipliers: PracticeKey[];
  digitCount: number;
  entry: EntryMode;
}

const STATS_KEY = 'trachtenberg.stats.v1';
const SETTINGS_KEY = 'trachtenberg.settings.v1';

const emptyStats: Stats = {
  byRule: {},
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode etc.) — stats just won't persist
  }
}

export function loadStats(): Stats {
  return read(STATS_KEY, emptyStats);
}

export function recordAnswer(key: PracticeKey, correct: boolean): Stats {
  const stats = loadStats();
  const rule = stats.byRule[key] ?? { correct: 0, total: 0 };
  rule.total += 1;
  if (correct) rule.correct += 1;
  stats.byRule[key] = rule;
  stats.totalAnswered += 1;
  if (correct) {
    stats.totalCorrect += 1;
    stats.streak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
  } else {
    stats.streak = 0;
  }
  write(STATS_KEY, stats);
  return stats;
}

export function resetStats(): Stats {
  write(STATS_KEY, emptyStats);
  return { ...emptyStats, byRule: {} };
}

export function loadSettings(): PracticeSettings {
  return read(SETTINGS_KEY, { multipliers: [11], digitCount: 3, entry: 'rtl' });
}

export function saveSettings(settings: PracticeSettings): void {
  write(SETTINGS_KEY, settings);
}

export type Mastery = 'new' | 'learning' | 'mastered';

export function masteryFor(stats: Stats, key: PracticeKey): Mastery {
  const rule = stats.byRule[key];
  if (!rule || rule.total === 0) return 'new';
  if (rule.correct >= 10 && rule.correct / rule.total >= 0.8) return 'mastered';
  return 'learning';
}
