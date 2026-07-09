// The Trachtenberg speed-multiplication engine.
//
// Every rule works the same way: pad the multiplicand with leading zeros,
// then walk its digits right to left. At each digit you apply the rule for
// the multiplier, using the "neighbor" (the digit immediately to the right),
// add any carry, write the units of the total and carry the rest.
//
// Halving always drops the remainder (half of 7 is 3), and the dropped
// half is compensated by adding 5 whenever the current digit is odd.

export const MULTIPLIERS = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12] as const;
export type Multiplier = (typeof MULTIPLIERS)[number];

export type StepKind = 'first' | 'middle' | 'lead' | 'overflow';

/** 'rule' = the per-multiplier rules for 2–12; 'direct' = the two-finger method for any multiplier */
export type Method = 'rule' | 'direct';

export interface StepPart {
  label: string;
  value: number;
}

export interface Step {
  /** 0 = rightmost digit of the padded multiplicand */
  position: number;
  digit: number;
  /** digit immediately to the right; null for the rightmost digit */
  neighbor: number | null;
  kind: StepKind;
  /** overrides the default kind label in the walkthrough UI */
  title?: string;
  parts: StepPart[];
  carryIn: number;
  total: number;
  resultDigit: number;
  carryOut: number;
}

export interface Working {
  multiplicand: number;
  multiplier: number;
  method: Method;
  /** how many tiles to the right of the current digit take part in a step (1 = the neighbor) */
  pairSpan: number;
  /** digits of the multiplicand, left to right (no padding) */
  digits: number[];
  /** padded digits, left to right; length === steps.length */
  paddedDigits: number[];
  /** how many of paddedDigits are pad zeros */
  padCount: number;
  /** steps in the order you perform them: right to left */
  steps: Step[];
  result: number;
}

export const half = (n: number): number => Math.floor(n / 2);
export const isOdd = (n: number): boolean => n % 2 === 1;

function ruleParts(
  multiplier: Multiplier,
  digit: number,
  neighbor: number,
  kind: StepKind
): StepPart[] {
  if (kind === 'overflow') return [];

  const oddBonus: StepPart[] = isOdd(digit)
    ? [{ label: `+5 because ${digit} is odd`, value: 5 }]
    : [];
  const halfNeighbor: StepPart =
    kind === 'first'
      ? { label: 'no neighbor to halve', value: 0 }
      : { label: `half of neighbor ${neighbor} → ${half(neighbor)}`, value: half(neighbor) };
  const neighborPart: StepPart =
    kind === 'first'
      ? { label: 'no neighbor — counts as', value: 0 }
      : { label: `neighbor ${neighbor}`, value: neighbor };

  switch (multiplier) {
    case 2:
      return [{ label: `double the digit: 2 × ${digit}`, value: 2 * digit }];

    case 11:
      return [{ label: `the digit ${digit}`, value: digit }, neighborPart];

    case 12:
      return [
        { label: `double the digit: 2 × ${digit}`, value: 2 * digit },
        neighborPart,
      ];

    case 5:
      return [halfNeighbor, ...oddBonus];

    case 6:
      return [{ label: `the digit ${digit}`, value: digit }, halfNeighbor, ...oddBonus];

    case 7:
      return [
        { label: `double the digit: 2 × ${digit}`, value: 2 * digit },
        halfNeighbor,
        ...oddBonus,
      ];

    case 9:
      if (kind === 'first') return [{ label: `10 − ${digit}`, value: 10 - digit }];
      if (kind === 'middle')
        return [{ label: `9 − ${digit}`, value: 9 - digit }, neighborPart];
      return [{ label: `neighbor ${neighbor} minus 1`, value: neighbor - 1 }];

    case 8:
      if (kind === 'first')
        return [{ label: `double (10 − ${digit})`, value: 2 * (10 - digit) }];
      if (kind === 'middle')
        return [{ label: `double (9 − ${digit})`, value: 2 * (9 - digit) }, neighborPart];
      return [{ label: `neighbor ${neighbor} minus 2`, value: neighbor - 2 }];

    case 4:
      if (kind === 'first')
        return [{ label: `10 − ${digit}`, value: 10 - digit }, ...oddBonus];
      if (kind === 'middle')
        return [{ label: `9 − ${digit}`, value: 9 - digit }, ...oddBonus, halfNeighbor];
      return [
        { label: `half of neighbor ${neighbor}, minus 1`, value: half(neighbor) - 1 },
      ];

    case 3:
      if (kind === 'first')
        return [{ label: `double (10 − ${digit})`, value: 2 * (10 - digit) }, ...oddBonus];
      if (kind === 'middle')
        return [
          { label: `double (9 − ${digit})`, value: 2 * (9 - digit) },
          ...oddBonus,
          halfNeighbor,
        ];
      return [
        { label: `half of neighbor ${neighbor}, minus 2`, value: half(neighbor) - 2 },
      ];
  }
}

/**
 * Work out multiplicand × multiplier the Trachtenberg way, recording every
 * digit-by-digit step (including carries and the leading-zero step).
 */
export function workOut(multiplicand: number, multiplier: Multiplier): Working {
  if (!Number.isInteger(multiplicand) || multiplicand < 1) {
    throw new Error(`multiplicand must be a positive integer, got ${multiplicand}`);
  }

  const digits = String(multiplicand).split('').map(Number);
  const n = digits.length;
  const digitAt = (pos: number): number =>
    pos >= 0 && pos < n ? digits[n - 1 - pos] : 0;

  const steps: Step[] = [];
  let carry = 0;
  let pos = 0;

  // Always process every real digit plus one leading zero (where the special
  // "lead" rules apply); keep going past that only while a carry remains.
  while (pos <= n || carry > 0) {
    const kind: StepKind =
      pos === 0 ? 'first' : pos < n ? 'middle' : pos === n ? 'lead' : 'overflow';
    const digit = digitAt(pos);
    const neighbor = pos === 0 ? null : digitAt(pos - 1);
    const parts = ruleParts(multiplier, digit, neighbor ?? 0, kind);
    const total = parts.reduce((sum, p) => sum + p.value, 0) + carry;
    const resultDigit = ((total % 10) + 10) % 10;
    const carryOut = (total - resultDigit) / 10;

    steps.push({
      position: pos,
      digit,
      neighbor,
      kind,
      parts,
      carryIn: carry,
      total,
      resultDigit,
      carryOut,
    });

    carry = carryOut;
    pos += 1;
  }

  const resultDigits = [...steps].reverse().map((s) => s.resultDigit);
  const result = Number(resultDigits.join(''));
  const padCount = steps.length - n;
  const paddedDigits = [...Array(padCount).fill(0), ...digits];

  return {
    multiplicand,
    multiplier,
    method: 'rule',
    pairSpan: 1,
    digits,
    paddedDigits,
    padCount,
    steps,
    result,
  };
}

const PLACE_NAMES = ['units', 'tens', 'hundreds', 'thousands', 'ten-thousands'];

/**
 * Direct (two-finger) multiplication for any multiplier — how the
 * Trachtenberg system multiplies large numbers against each other.
 *
 * Pad the multiplicand with one zero per multiplier digit. At each position,
 * moving right to left, sum the finger pairs — units of the multiplier times
 * the current digit, tens times the neighbor, hundreds times the digit after
 * that — add the carry, write the units, carry the rest.
 */
export function workOutDirect(multiplicand: number, multiplier: number): Working {
  if (!Number.isInteger(multiplicand) || multiplicand < 1) {
    throw new Error(`multiplicand must be a positive integer, got ${multiplicand}`);
  }
  if (!Number.isInteger(multiplier) || multiplier < 1) {
    throw new Error(`multiplier must be a positive integer, got ${multiplier}`);
  }

  const digits = String(multiplicand).split('').map(Number);
  const bDigits = String(multiplier).split('').map(Number);
  const n = digits.length;
  const k = bDigits.length;
  const aAt = (pos: number): number => (pos >= 0 && pos < n ? digits[n - 1 - pos] : 0);
  const bAt = (j: number): number => bDigits[k - 1 - j];

  const steps: Step[] = [];
  let carry = 0;
  let pos = 0;

  while (pos < n + k - 1 || carry > 0) {
    const parts: StepPart[] = [];
    for (let j = 0; j < k; j++) {
      const i = pos - j;
      if (i < 0 || i >= n) continue;
      const place = PLACE_NAMES[j] ?? `place ${j + 1}`;
      parts.push({ label: `${place} ${bAt(j)} × ${aAt(i)}`, value: bAt(j) * aAt(i) });
    }
    const total = parts.reduce((sum, p) => sum + p.value, 0) + carry;
    const resultDigit = total % 10;
    const carryOut = (total - resultDigit) / 10;
    const kind: StepKind =
      pos === 0 ? 'first' : pos < n ? 'middle' : pos < n + k - 1 ? 'lead' : 'overflow';

    steps.push({
      position: pos,
      digit: aAt(pos),
      neighbor: pos === 0 ? null : aAt(pos - 1),
      kind,
      title:
        pos === 0
          ? 'Rightmost digit — units finger only'
          : pos < n
            ? 'Slide the fingers one place left'
            : 'Into the leading zeros — finishing up',
      parts,
      carryIn: carry,
      total,
      resultDigit,
      carryOut,
    });

    carry = carryOut;
    pos += 1;
  }

  const resultDigits = [...steps].reverse().map((s) => s.resultDigit);
  const result = Number(resultDigits.join(''));
  const padCount = steps.length - n;
  const paddedDigits = [...Array(padCount).fill(0), ...digits];

  return {
    multiplicand,
    multiplier,
    method: 'direct',
    pairSpan: k - 1,
    digits,
    paddedDigits,
    padCount,
    steps,
    result,
  };
}

/** Random integer in [min, max] inclusive. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random multiplicand with exactly `digitCount` digits. */
export function randomMultiplicand(digitCount: number): number {
  const min = 10 ** (digitCount - 1);
  const max = 10 ** digitCount - 1;
  return randInt(min, max);
}
