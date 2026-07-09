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
  parts: StepPart[];
  carryIn: number;
  total: number;
  resultDigit: number;
  carryOut: number;
}

export interface Working {
  multiplicand: number;
  multiplier: Multiplier;
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
