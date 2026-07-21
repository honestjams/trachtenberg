import { reduce } from './helpers';
import type { AnswerSpec } from './types';

const EPS = 1e-6;

/** parse a single typed value: "3", "-3", "2.5", "3/4", "-3/4" */
function parseValue(raw: string): number | null {
  const s = raw.trim().replace(/−/g, '-');
  if (s === '' || s === '-' || s === '.') return null;
  if (s.includes('/')) {
    const [top, bottom] = s.split('/');
    const n = Number(top);
    const d = Number(bottom);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    return n / d;
  }
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

function sameNumber(a: number, b: number): boolean {
  return Math.abs(a - b) < EPS * Math.max(1, Math.abs(a), Math.abs(b));
}

/** grade a typed answer (or a chosen option index for multiple choice) */
export function gradeAnswer(spec: AnswerSpec, input: string | number): boolean {
  if (spec.type === 'choice') {
    return typeof input === 'number' && input === spec.correct;
  }
  const raw = String(input);

  if (spec.type === 'numeric') {
    const v = parseValue(raw);
    return v !== null && sameNumber(v, spec.answer);
  }

  if (spec.type === 'fraction') {
    const v = parseValue(raw);
    return v !== null && sameNumber(v, spec.n / spec.d);
  }

  // multi
  const parts = raw.split(',').map(parseValue);
  if (parts.some((p) => p === null) || parts.length !== spec.answers.length) return false;
  const values = parts as number[];
  if (spec.ordered) {
    return values.every((v, i) => sameNumber(v, spec.answers[i]));
  }
  const remaining = [...spec.answers];
  for (const v of values) {
    const i = remaining.findIndex((a) => sameNumber(a, v));
    if (i === -1) return false;
    remaining.splice(i, 1);
  }
  return true;
}

/** the canonical display string for an answer */
export function answerText(spec: AnswerSpec): string {
  switch (spec.type) {
    case 'numeric':
      return String(spec.answer).replace('-', '−');
    case 'fraction': {
      const r = reduce(spec.n, spec.d);
      return r.d === 1 ? String(r.n).replace('-', '−') : `${r.n}/${r.d}`.replace('-', '−');
    }
    case 'multi':
      return spec.answers.map((a) => String(a).replace('-', '−')).join(', ');
    case 'choice':
      return spec.options[spec.correct];
  }
}

/** which extra keypad keys this answer needs */
export function keypadKeysFor(spec: AnswerSpec): { neg: boolean; dot: boolean; slash: boolean; comma: boolean } {
  switch (spec.type) {
    case 'numeric':
      return { neg: !!spec.neg, dot: !!spec.dot, slash: false, comma: false };
    case 'fraction':
      return { neg: spec.n / spec.d < 0, dot: true, slash: true, comma: false };
    case 'multi':
      return { neg: !!spec.neg, dot: !!spec.dot, slash: false, comma: true };
    case 'choice':
      return { neg: false, dot: false, slash: false, comma: false };
  }
}

/** short helper text shown under the answer box */
export function inputHint(spec: AnswerSpec): string {
  switch (spec.type) {
    case 'numeric':
      return spec.dot ? 'Type the number — decimals allowed.' : 'Type the number.';
    case 'fraction':
      return 'Type a fraction like 3/4 (any equivalent form counts).';
    case 'multi':
      return spec.ordered
        ? `Enter ${spec.label}, separated by a comma — order matters.`
        : `Enter ${spec.label}, separated by a comma — any order.`;
    case 'choice':
      return 'Pick the right answer.';
  }
}
