import { describe, expect, it } from 'vitest';
import { MULTIPLIERS, workOut, workOutDirect } from './trachtenberg';

describe('trachtenberg engine', () => {
  it('matches real multiplication for every rule across exhaustive small numbers', () => {
    for (const m of MULTIPLIERS) {
      for (let x = 1; x <= 2000; x++) {
        expect(workOut(x, m).result, `${x} × ${m}`).toBe(x * m);
      }
    }
  });

  it('matches real multiplication for large random numbers', () => {
    for (const m of MULTIPLIERS) {
      for (let i = 0; i < 3000; i++) {
        const x = Math.floor(Math.random() * 999_999) + 1;
        expect(workOut(x, m).result, `${x} × ${m}`).toBe(x * m);
      }
    }
  });

  it('reproduces the classic worked examples', () => {
    expect(workOut(3425, 11).result).toBe(37675);
    expect(workOut(316, 12).result).toBe(3792);
    expect(workOut(357, 6).result).toBe(2142);
    expect(workOut(693, 7).result).toBe(4851);
    expect(workOut(93, 5).result).toBe(465);
    expect(workOut(2130, 9).result).toBe(19170);
    expect(workOut(456, 8).result).toBe(3648);
    expect(workOut(346, 4).result).toBe(1384);
    expect(workOut(492, 3).result).toBe(1476);
    expect(workOut(76892, 2).result).toBe(153784);
  });

  it('direct method matches real multiplication for any pair of numbers', () => {
    // exhaustive small cases
    for (let a = 1; a <= 150; a++) {
      for (let b = 1; b <= 150; b++) {
        expect(workOutDirect(a, b).result, `${a} × ${b}`).toBe(a * b);
      }
    }
    // large random cases up to 6 digits × 4 digits
    for (let i = 0; i < 20_000; i++) {
      const a = Math.floor(Math.random() * 999_999) + 1;
      const b = Math.floor(Math.random() * 9_999) + 1;
      expect(workOutDirect(a, b).result, `${a} × ${b}`).toBe(a * b);
    }
  });

  it('direct method keeps step bookkeeping consistent', () => {
    for (let i = 0; i < 2000; i++) {
      const a = Math.floor(Math.random() * 99_999) + 1;
      const b = Math.floor(Math.random() * 999) + 10;
      const w = workOutDirect(a, b);
      expect(w.paddedDigits.length).toBe(w.steps.length);
      let carry = 0;
      for (const step of w.steps) {
        expect(step.carryIn).toBe(carry);
        const partSum = step.parts.reduce((s, p) => s + p.value, 0);
        expect(step.total).toBe(partSum + step.carryIn);
        expect(step.total).toBe(step.carryOut * 10 + step.resultDigit);
        carry = step.carryOut;
      }
      expect(carry).toBe(0);
    }
  });

  it('keeps step bookkeeping consistent', () => {
    for (const m of MULTIPLIERS) {
      for (let i = 0; i < 500; i++) {
        const x = Math.floor(Math.random() * 99_999) + 1;
        const w = workOut(x, m);
        expect(w.paddedDigits.length).toBe(w.steps.length);
        let carry = 0;
        for (const step of w.steps) {
          expect(step.carryIn).toBe(carry);
          const partSum = step.parts.reduce((s, p) => s + p.value, 0);
          expect(step.total).toBe(partSum + step.carryIn);
          expect(step.resultDigit).toBeGreaterThanOrEqual(0);
          expect(step.resultDigit).toBeLessThanOrEqual(9);
          expect(step.total).toBe(step.carryOut * 10 + step.resultDigit);
          carry = step.carryOut;
        }
        expect(carry).toBe(0);
      }
    }
  });
});
