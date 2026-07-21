export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** random nonzero integer in [-max, max] */
export function randNonZero(max: number): number {
  const n = randInt(1, max);
  return Math.random() < 0.5 ? -n : n;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** reduce n/d and normalize the sign onto the numerator */
export function reduce(n: number, d: number): { n: number; d: number } {
  const g = gcd(n, d);
  let rn = n / g;
  let rd = d / g;
  if (rd < 0) {
    rn = -rn;
    rd = -rd;
  }
  return { n: rn, d: rd };
}

/** "+ 5" / "− 5" with correct spacing, for building expressions readably */
export function signed(n: number): string {
  return n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`;
}

/** render a number for display, using the minus sign glyph */
export function num(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

/** "x", "2x", "−x", "−3x" */
export function coef(c: number, variable = 'x'): string {
  if (c === 1) return variable;
  if (c === -1) return `−${variable}`;
  return `${num(c)}${variable}`;
}

/** x² + bx + c as a display string */
export function quadratic(b: number, c: number, variable = 'x'): string {
  let s = `${variable}²`;
  if (b !== 0) s += ` ${signed(b)}${variable}`;
  if (c !== 0) s += ` ${signed(c)}`;
  return s;
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a 4-option multiple choice from a correct string and distractors.
 * Deduplicates; returns options plus the index of the correct answer.
 */
export function makeChoices(
  correct: string,
  distractors: string[]
): { options: string[]; correct: number } {
  const unique = [...new Set([correct, ...distractors])].slice(0, 4);
  const options = shuffle(unique);
  return { options, correct: options.indexOf(correct) };
}
