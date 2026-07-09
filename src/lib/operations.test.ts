import { describe, expect, it } from 'vitest';
import {
  digitSum,
  squareKindFor,
  workOutAddition,
  workOutDivision,
  workOutSquare,
} from './operations';

describe('speed addition', () => {
  it('matches real addition for random columns', () => {
    for (let i = 0; i < 5000; i++) {
      const count = 2 + Math.floor(Math.random() * 5);
      const addends = Array.from(
        { length: count },
        () => Math.floor(Math.random() * 99_999) + 1
      );
      const w = workOutAddition(addends);
      expect(w.result, addends.join('+')).toBe(addends.reduce((a, b) => a + b, 0));
    }
  });

  it('keeps tick bookkeeping consistent', () => {
    for (let i = 0; i < 1000; i++) {
      const addends = Array.from(
        { length: 4 },
        () => Math.floor(Math.random() * 9_999) + 1
      );
      const w = workOutAddition(addends);
      for (const col of w.columns) {
        let run = 0;
        let ticks = 0;
        for (const e of col.events) {
          expect(e.before).toBe(run);
          run = e.before + e.digit;
          if (run >= 11) {
            run -= 11;
            ticks += 1;
            expect(e.tick).toBe(true);
          } else {
            expect(e.tick).toBe(false);
          }
          expect(e.after).toBe(run);
          expect(e.after).toBeLessThanOrEqual(10);
        }
        expect(col.remainder).toBe(run);
        expect(col.ticks).toBe(ticks);
      }
      let carry = 0;
      for (const s of w.combine) {
        expect(s.carryIn).toBe(carry);
        expect(s.total).toBe(s.remainder + s.ticksHere + s.ticksRight + s.carryIn);
        expect(s.total).toBe(s.carryOut * 10 + s.resultDigit);
        carry = s.carryOut;
      }
      expect(carry).toBe(0);
    }
  });
});

describe('speed division', () => {
  it('matches real division for every divisor', () => {
    for (let divisor = 2; divisor <= 9; divisor++) {
      for (let i = 0; i < 500; i++) {
        const dividend = Math.floor(Math.random() * 999_999) + 1;
        const w = workOutDivision(dividend, divisor);
        expect(w.quotient, `${dividend} ÷ ${divisor}`).toBe(Math.floor(dividend / divisor));
        expect(w.remainder).toBe(dividend % divisor);
        let carry = 0;
        for (const s of w.steps) {
          expect(s.carryIn).toBe(carry);
          expect(s.value).toBe(carry * 10 + s.digit);
          expect(s.q).toBe(Math.floor(s.value / divisor));
          expect(s.r).toBe(s.value % divisor);
          expect(s.r).toBeLessThan(divisor);
          carry = s.r;
        }
      }
    }
  });
});

describe('squaring shortcuts', () => {
  it('matches n² across every covered number', () => {
    for (let n = 15; n <= 125; n++) {
      if (!squareKindFor(n)) continue;
      expect(workOutSquare(n).result, `${n}²`).toBe(n * n);
    }
  });

  it('assigns the expected kinds', () => {
    expect(workOutSquare(75).kind).toBe('five');
    expect(workOutSquare(47).kind).toBe('fifty');
    expect(workOutSquare(96).kind).toBe('hundred');
    expect(workOutSquare(112).kind).toBe('hundred');
    expect(squareKindFor(14)).toBeNull();
    expect(squareKindFor(126)).toBeNull();
  });
});

describe('digit-sum check', () => {
  it('digit sums respect multiplication mod 9', () => {
    for (let i = 0; i < 2000; i++) {
      const a = Math.floor(Math.random() * 9999) + 1;
      const b = Math.floor(Math.random() * 999) + 1;
      expect(digitSum(digitSum(a) * digitSum(b))).toBe(digitSum(a * b));
    }
  });
});
