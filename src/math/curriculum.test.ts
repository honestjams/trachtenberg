import { describe, expect, it } from 'vitest';
import { ALL_TOPICS } from './curriculum';
import { answerText, gradeAnswer } from './grading';
import type { AnswerSpec } from './types';

describe('math curriculum', () => {
  it('has six grades of topics', () => {
    const grades = new Set(ALL_TOPICS.map((t) => t.grade));
    expect([...grades].sort((a, b) => a - b)).toEqual([7, 8, 9, 10, 11, 12]);
    expect(ALL_TOPICS.length).toBeGreaterThanOrEqual(30);
    const ids = new Set(ALL_TOPICS.map((t) => t.id));
    expect(ids.size).toBe(ALL_TOPICS.length);
  });

  for (const topic of ALL_TOPICS) {
    it(`${topic.id} generates sound questions`, () => {
      for (let i = 0; i < 300; i++) {
        const q = topic.generate();
        expect(q.prompt.length).toBeGreaterThan(0);
        expect(q.steps.length).toBeGreaterThan(0);

        const spec = q.spec;
        if (spec.type === 'numeric') {
          expect(Number.isFinite(spec.answer)).toBe(true);
          if (spec.answer < 0) expect(spec.neg).toBe(true);
          if (!Number.isInteger(spec.answer)) expect(spec.dot).toBe(true);
          // the canonical answer must grade as correct
          expect(gradeAnswer(spec, String(spec.answer))).toBe(true);
          expect(gradeAnswer(spec, String(spec.answer + 1))).toBe(false);
        }
        if (spec.type === 'fraction') {
          expect(spec.d).not.toBe(0);
          expect(gradeAnswer(spec, `${spec.n}/${spec.d}`)).toBe(true);
          expect(gradeAnswer(spec, `${spec.n * 3}/${spec.d * 3}`)).toBe(true);
          expect(gradeAnswer(spec, `${spec.n + spec.d}/${spec.d}`)).toBe(false);
        }
        if (spec.type === 'multi') {
          expect(spec.answers.length).toBeGreaterThanOrEqual(2);
          if (spec.answers.some((a) => a < 0)) expect(spec.neg).toBe(true);
          if (spec.answers.some((a) => !Number.isInteger(a))) expect(spec.dot).toBe(true);
          expect(gradeAnswer(spec, spec.answers.join(','))).toBe(true);
          if (!spec.ordered) {
            expect(gradeAnswer(spec, [...spec.answers].reverse().join(','))).toBe(true);
          }
          expect(gradeAnswer(spec, spec.answers.map((a) => a + 1).join(','))).toBe(false);
        }
        if (spec.type === 'choice') {
          expect(spec.options.length).toBeGreaterThanOrEqual(2);
          expect(spec.correct).toBeGreaterThanOrEqual(0);
          expect(spec.correct).toBeLessThan(spec.options.length);
          expect(new Set(spec.options).size).toBe(spec.options.length);
          expect(gradeAnswer(spec, spec.correct)).toBe(true);
          expect(gradeAnswer(spec, (spec.correct + 1) % spec.options.length)).toBe(false);
        }

        expect(answerText(spec).length).toBeGreaterThan(0);
      }
    });
  }
});

describe('grading edge cases', () => {
  it('accepts equivalent fraction and decimal forms', () => {
    expect(gradeAnswer({ type: 'fraction', n: 1, d: 2 }, '2/4')).toBe(true);
    expect(gradeAnswer({ type: 'fraction', n: 1, d: 2 }, '0.5')).toBe(true);
    expect(gradeAnswer({ type: 'fraction', n: -3, d: 4 }, '-3/4')).toBe(true);
    expect(gradeAnswer({ type: 'fraction', n: -3, d: 4 }, '3/-4')).toBe(true);
    expect(gradeAnswer({ type: 'fraction', n: 6, d: 1 }, '6')).toBe(true);
  });

  it('handles unordered and ordered multi answers', () => {
    const roots: AnswerSpec = { type: 'multi', answers: [-3, 5], ordered: false, label: 'roots' };
    expect(gradeAnswer(roots, '5,-3')).toBe(true);
    expect(gradeAnswer(roots, '-3,5')).toBe(true);
    expect(gradeAnswer(roots, '3,5')).toBe(false);
    expect(gradeAnswer(roots, '5')).toBe(false);
    const pair: AnswerSpec = { type: 'multi', answers: [2, -7], ordered: true, label: 'x, y' };
    expect(gradeAnswer(pair, '2,-7')).toBe(true);
    expect(gradeAnswer(pair, '-7,2')).toBe(false);
  });

  it('rejects garbage input without crashing', () => {
    expect(gradeAnswer({ type: 'numeric', answer: 5 }, '')).toBe(false);
    expect(gradeAnswer({ type: 'numeric', answer: 5 }, '-')).toBe(false);
    expect(gradeAnswer({ type: 'numeric', answer: 5 }, '.')).toBe(false);
    expect(gradeAnswer({ type: 'numeric', answer: 5 }, '1/0')).toBe(false);
    expect(gradeAnswer({ type: 'multi', answers: [1, 2], ordered: true, label: '' }, ',')).toBe(false);
  });
});
