import { makeChoices, num, pick, randInt, randNonZero, signed, quadratic } from '../helpers';
import type { Topic } from '../types';

export const grade11: Topic[] = [
  {
    id: 'g11-vertex',
    grade: 11,
    title: 'Quadratic functions',
    tagline: 'Find the vertex — the turning point',
    concept: [
      { when: 'The vertex', what: 'For y = x² + bx + c, the x of the vertex is −b/2 (in general −b/2a). Substitute back in for y.' },
      { when: 'Why care', what: 'The vertex is the max or min — the peak of the throw, the cheapest price, the turning point.' },
    ],
    generate: () => {
      const h = randNonZero(6); // vertex x
      const k = randNonZero(10); // vertex y
      const b = -2 * h;
      const c = h * h + k;
      return {
        prompt: `Find the vertex of y = ${quadratic(b, c)}`,
        spec: { type: 'multi', answers: [h, k], ordered: true, neg: true, label: 'x, y' },
        steps: [
          `x of vertex = −b/2 = ${num(-b)}/2 = ${num(h)}.`,
          `y = (${num(h)})² ${signed(b)}·(${num(h)}) ${signed(c)} = ${num(k)}.`,
          `Vertex: (${num(h)}, ${num(k)})`,
        ],
      };
    },
  },
  {
    id: 'g11-logs',
    grade: 11,
    title: 'Logarithms',
    tagline: 'The question “ten to the what?”',
    concept: [
      { when: 'Meaning', what: 'log_b(x) asks: b to WHAT power gives x? log₂(32) = 5 because 2⁵ = 32.' },
      { when: 'Solving 2ˣ = 32', what: 'Rewrite both sides with the same base, then match the exponents.' },
    ],
    generate: () => {
      const base = pick([2, 3, 5, 10]);
      const exp = base === 10 ? randInt(1, 6) : base === 2 ? randInt(2, 9) : randInt(2, 5);
      const value = base ** exp;
      if (Math.random() < 0.5) {
        return {
          prompt: `log${base === 10 ? '' : `_${base}`}(${value.toLocaleString()})`,
          instruction: base === 10 ? 'base-10 log' : undefined,
          spec: { type: 'numeric', answer: exp },
          steps: [`${base} to what power gives ${value.toLocaleString()}? ${base}^${exp} = ${value.toLocaleString()}, so the log is ${exp}.`],
        };
      }
      return {
        prompt: `Solve ${base}ˣ = ${value.toLocaleString()}`,
        spec: { type: 'numeric', answer: exp },
        steps: [
          `Write ${value.toLocaleString()} as a power of ${base}: ${value.toLocaleString()} = ${base}^${exp}.`,
          `Same base on both sides, so the exponents match: x = ${exp}.`,
        ],
      };
    },
  },
  {
    id: 'g11-sequences',
    grade: 11,
    title: 'Sequences & series',
    tagline: 'Arithmetic and geometric patterns',
    concept: [
      { when: 'Arithmetic', what: 'Add the same difference d each step: nth term = a₁ + (n−1)d.' },
      { when: 'Geometric', what: 'Multiply by the same ratio r each step: nth term = a₁ · rⁿ⁻¹.' },
      { when: 'Arithmetic sum', what: 'Sum of n terms = n × (first + last)/2 — pair them up like Gauss.' },
    ],
    generate: () => {
      const kind = pick(['arith', 'geo', 'sum'] as const);
      if (kind === 'arith') {
        const a1 = randInt(-10, 15);
        const d = randNonZero(9);
        const n = randInt(8, 25);
        const an = a1 + (n - 1) * d;
        return {
          prompt: `An arithmetic sequence starts at ${num(a1)} with common difference ${num(d)}. Find term ${n}.`,
          spec: { type: 'numeric', answer: an, neg: true },
          steps: [
            `aₙ = a₁ + (n−1)d = ${num(a1)} + ${n - 1} × ${num(d)}.`,
            `= ${num(a1)} ${signed((n - 1) * d)} = ${num(an)}`,
          ],
        };
      }
      if (kind === 'geo') {
        const a1 = randInt(1, 5);
        const r = pick([2, 3, -2]);
        const n = randInt(4, 8);
        const an = a1 * r ** (n - 1);
        return {
          prompt: `A geometric sequence starts at ${a1} with ratio ${num(r)}. Find term ${n}.`,
          spec: { type: 'numeric', answer: an, neg: true },
          steps: [
            `aₙ = a₁ · rⁿ⁻¹ = ${a1} × (${num(r)})^${n - 1}.`,
            `= ${a1} × ${num(r ** (n - 1))} = ${num(an)}`,
          ],
        };
      }
      const a1 = randInt(1, 12);
      const d = randInt(1, 8);
      const n = pick([10, 12, 15, 20]);
      const an = a1 + (n - 1) * d;
      const sum = (n * (a1 + an)) / 2;
      return {
        prompt: `Sum the first ${n} terms: ${a1}, ${a1 + d}, ${a1 + 2 * d}, …`,
        spec: { type: 'numeric', answer: sum },
        steps: [
          `Term ${n} = ${a1} + ${n - 1} × ${d} = ${an}.`,
          `Sum = n(first + last)/2 = ${n} × (${a1} + ${an})/2 = ${sum}`,
        ],
      };
    },
  },
  {
    id: 'g11-rational',
    grade: 11,
    title: 'Rational expressions',
    tagline: 'Factor, then cancel what matches',
    concept: [
      { when: 'The rule', what: 'Only FACTORS cancel — never terms. Factor top and bottom fully first.' },
      { when: 'Typical', what: '(x² − a²)/(x + a): the top is a difference of squares, (x+a)(x−a), so the (x+a) cancels.' },
    ],
    generate: () => {
      const a = randInt(2, 9);
      if (Math.random() < 0.5) {
        const correct = `x − ${a}`;
        const { options, correct: idx } = makeChoices(correct, [
          `x + ${a}`,
          `x − ${a * a}`,
          `1/(x − ${a})`,
        ]);
        return {
          prompt: `Simplify (x² − ${a * a}) / (x + ${a})`,
          spec: { type: 'choice', options, correct: idx },
          steps: [
            `x² − ${a * a} is a difference of squares: (x + ${a})(x − ${a}).`,
            `The (x + ${a}) cancels: answer x − ${a}.`,
          ],
        };
      }
      const b = randInt(2, 9);
      const correct = `x ${signed(b)}`;
      const { options, correct: idx } = makeChoices(correct, [
        `x ${signed(a)}`,
        `x ${signed(-b)}`,
        `1/(x ${signed(b)})`,
      ]);
      return {
        prompt: `Simplify (x² ${signed(a + b)}x ${signed(a * b)}) / (x + ${a})`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `Factor the top: (x + ${a})(x + ${b}).`,
          `Cancel (x + ${a}): answer x + ${b}.`,
        ],
      };
    },
  },
  {
    id: 'g11-complex',
    grade: 11,
    title: 'Complex numbers',
    tagline: 'i² = −1 and everything follows',
    concept: [
      { when: 'What i is', what: 'i = √(−1), so i² = −1. A complex number is a + bi: a real part plus an imaginary part.' },
      { when: 'Add', what: 'Add real with real, imaginary with imaginary.' },
      { when: 'Multiply', what: 'FOIL as usual, then swap every i² for −1 and regroup.' },
    ],
    generate: () => {
      const a = randNonZero(8);
      const b = randNonZero(8);
      const c = randNonZero(8);
      const d = randNonZero(8);
      const fmtC = (re: number, im: number) =>
        `${num(re)} ${im >= 0 ? '+' : '−'} ${Math.abs(im)}i`;
      if (Math.random() < 0.5) {
        const re = a + c;
        const im = b + d;
        const correct = fmtC(re, im);
        const { options, correct: idx } = makeChoices(correct, [
          fmtC(re, -im),
          fmtC(a + d, b + c),
          fmtC(re + 1, im),
        ]);
        return {
          prompt: `(${fmtC(a, b)}) + (${fmtC(c, d)})`,
          spec: { type: 'choice', options, correct: idx },
          steps: [
            `Real parts: ${num(a)} + ${num(c)} = ${num(re)}. Imaginary: ${num(b)}i + ${num(d)}i = ${num(im)}i.`,
            `= ${correct}`,
          ],
        };
      }
      const re = a * c - b * d;
      const im = a * d + b * c;
      const correct = fmtC(re, im);
      const { options, correct: idx } = makeChoices(correct, [
        fmtC(a * c + b * d, im),
        fmtC(re, a * d - b * c),
        fmtC(a * c, b * d),
      ]);
      return {
        prompt: `(${fmtC(a, b)}) × (${fmtC(c, d)})`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `FOIL: ${num(a * c)} + ${num(a * d)}i + ${num(b * c)}i + ${num(b * d)}i².`,
          `i² = −1, so ${num(b * d)}i² becomes ${num(-b * d)}.`,
          `Real: ${num(a * c)} ${signed(-b * d)} = ${num(re)}. Imaginary: ${num(a * d)} ${signed(b * c)} = ${num(im)}.`,
          `= ${correct}`,
        ],
      };
    },
  },
];
