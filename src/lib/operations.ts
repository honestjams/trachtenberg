// The rest of the Trachtenberg system: speed addition (the tick method),
// simple speed division, and the squaring shortcuts.

/* ---------------- speed addition ---------------- */
//
// Add each column top to bottom, but never let the running total reach 11:
// the moment it does, subtract 11 and mark a tick. Write the remainder under
// the column and the tick count under that. The answer is
//   remainders + ticks + ticks shifted one place left     (each tick = 11)

export interface AddEvent {
  digit: number;
  before: number;
  after: number;
  tick: boolean;
}

export interface AddColumn {
  /** 0 = units column */
  position: number;
  events: AddEvent[];
  remainder: number;
  ticks: number;
}

export interface CombineStep {
  position: number;
  remainder: number;
  ticksHere: number;
  ticksRight: number;
  carryIn: number;
  total: number;
  resultDigit: number;
  carryOut: number;
}

export interface AdditionWorking {
  addends: number[];
  /** digit count of the widest addend */
  width: number;
  /** right to left */
  columns: AddColumn[];
  combine: CombineStep[];
  result: number;
}

export function workOutAddition(addends: number[]): AdditionWorking {
  if (addends.length < 2 || addends.some((a) => !Number.isInteger(a) || a < 1)) {
    throw new Error('addends must be at least two positive integers');
  }

  const width = Math.max(...addends.map((a) => String(a).length));
  const columns: AddColumn[] = [];

  for (let pos = 0; pos < width; pos++) {
    const events: AddEvent[] = [];
    let run = 0;
    let ticks = 0;
    for (const a of addends) {
      if (pos > 0 && a < 10 ** pos) continue; // this addend has no digit in this column
      const digit = Math.floor(a / 10 ** pos) % 10;
      const before = run;
      run += digit;
      let tick = false;
      if (run >= 11) {
        run -= 11;
        ticks += 1;
        tick = true;
      }
      events.push({ digit, before, after: run, tick });
    }
    columns.push({ position: pos, events, remainder: run, ticks });
  }

  const combine: CombineStep[] = [];
  let carry = 0;
  let pos = 0;
  while (
    pos < width ||
    carry > 0 ||
    (pos === width && columns[width - 1].ticks > 0)
  ) {
    const remainder = columns[pos]?.remainder ?? 0;
    const ticksHere = columns[pos]?.ticks ?? 0;
    const ticksRight = pos > 0 ? (columns[pos - 1]?.ticks ?? 0) : 0;
    const total = remainder + ticksHere + ticksRight + carry;
    const resultDigit = total % 10;
    const carryOut = (total - resultDigit) / 10;
    combine.push({
      position: pos,
      remainder,
      ticksHere,
      ticksRight,
      carryIn: carry,
      total,
      resultDigit,
      carryOut,
    });
    carry = carryOut;
    pos += 1;
    if (pos > width + 3) break; // safety; can never trigger for valid input
  }

  const result = Number(
    [...combine]
      .reverse()
      .map((s) => s.resultDigit)
      .join('')
  );

  return { addends, width, columns, combine, result };
}

/* ---------------- speed division ---------------- */
//
// Short division done the Trachtenberg way: work LEFT to right. Carry the
// remainder into the next digit as tens, divide, write the quotient digit.

export interface DivStep {
  /** 0 = leftmost digit of the dividend */
  index: number;
  digit: number;
  carryIn: number;
  /** carryIn * 10 + digit */
  value: number;
  q: number;
  r: number;
}

export interface DivisionWorking {
  dividend: number;
  divisor: number;
  /** left to right */
  steps: DivStep[];
  quotient: number;
  remainder: number;
}

export function workOutDivision(dividend: number, divisor: number): DivisionWorking {
  if (!Number.isInteger(dividend) || dividend < 1) {
    throw new Error(`dividend must be a positive integer, got ${dividend}`);
  }
  if (!Number.isInteger(divisor) || divisor < 2 || divisor > 9) {
    throw new Error(`divisor must be 2–9, got ${divisor}`);
  }

  const digits = String(dividend).split('').map(Number);
  const steps: DivStep[] = [];
  let carry = 0;
  digits.forEach((digit, index) => {
    const value = carry * 10 + digit;
    const q = Math.floor(value / divisor);
    const r = value % divisor;
    steps.push({ index, digit, carryIn: carry, value, q, r });
    carry = r;
  });

  const quotient = Number(steps.map((s) => s.q).join(''));
  return { dividend, divisor, steps, quotient, remainder: carry };
}

/* ---------------- squaring shortcuts ---------------- */

export type SquareKind = 'five' | 'fifty' | 'hundred';

export interface SquareWorking {
  n: number;
  kind: SquareKind;
  lines: string[];
  result: number;
}

export function squareKindFor(n: number): SquareKind | null {
  if (n % 10 === 5 && n >= 15 && n <= 95) return 'five';
  if (n >= 26 && n <= 74) return 'fifty';
  if (n >= 75 && n <= 125) return 'hundred';
  return null;
}

export function workOutSquare(n: number): SquareWorking {
  const kind = squareKindFor(n);
  if (!kind) throw new Error(`no squaring shortcut for ${n}`);
  const result = n * n;

  if (kind === 'five') {
    const t = (n - 5) / 10;
    return {
      n,
      kind,
      result,
      lines: [
        `${n} ends in 5, so take the tens digit: ${t}`,
        `Multiply it by one more than itself: ${t} × ${t + 1} = ${t * (t + 1)}`,
        `Tack 25 on the end → ${t * (t + 1)}25`,
      ],
    };
  }

  if (kind === 'fifty') {
    const d = n - 50;
    const base = 25 + d;
    const sq = d * d;
    return {
      n,
      kind,
      result,
      lines: [
        `${n} is 50 ${d >= 0 ? '+' : '−'} ${Math.abs(d)}`,
        `25 ${d >= 0 ? '+' : '−'} ${Math.abs(d)} = ${base} — that many hundreds (${base * 100})`,
        `Add ${Math.abs(d)}² = ${sq} → ${base * 100} + ${sq} = ${result}`,
      ],
    };
  }

  const d = n - 100;
  const base = n + d;
  const sq = d * d;
  return {
    n,
    kind,
    result,
    lines: [
      `${n} is 100 ${d >= 0 ? '+' : '−'} ${Math.abs(d)}`,
      `Go the same distance again: ${n} ${d >= 0 ? '+' : '−'} ${Math.abs(d)} = ${base} — that many hundreds`,
      `Add ${Math.abs(d)}² = ${sq} → ${base * 100} + ${sq} = ${result}`,
    ],
  };
}

/* ---------------- the digit-sum check ---------------- */

/** repeated digit sum (digital root), with 9 → 9 kept as-is for display */
export function digitSum(n: number): number {
  let s = n;
  while (s > 9) {
    s = String(s)
      .split('')
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return s;
}
