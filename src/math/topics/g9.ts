import { makeChoices, num, pick, randInt, randNonZero, signed, quadratic } from '../helpers';
import type { Topic } from '../types';

export const grade9: Topic[] = [
  {
    id: 'g9-polynomials',
    grade: 9,
    title: 'Expanding brackets',
    tagline: 'FOIL: First, Outer, Inner, Last',
    concept: [
      { when: 'FOIL', what: '(x + a)(x + b): multiply First terms, Outer, Inner, then Last — and add it all up.' },
      { when: 'The shortcut', what: 'The result is always x² + (a + b)x + ab. Sum in the middle, product at the end.' },
    ],
    generate: () => {
      const a = randNonZero(9);
      const b = randNonZero(9);
      const correct = quadratic(a + b, a * b);
      const { options, correct: idx } = makeChoices(correct, [
        quadratic(a * b, a + b),
        quadratic(a + b, a * b === 0 ? 1 : -a * b),
        quadratic(a - b, a * b),
        quadratic(a + b + 1, a * b),
      ]);
      return {
        prompt: `Expand (x ${signed(a)})(x ${signed(b)})`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `First: x·x = x². Outer: ${num(b)}x. Inner: ${num(a)}x. Last: ${num(a)}·${num(b)} = ${num(a * b)}.`,
          `Middle term: ${num(a)} + ${num(b)} = ${num(a + b)}, last term: ${num(a * b)}.`,
          `= ${correct}`,
        ],
      };
    },
  },
  {
    id: 'g9-factoring',
    grade: 9,
    title: 'Factoring trinomials',
    tagline: 'Two numbers that add and multiply just right',
    concept: [
      { when: 'x² + bx + c', what: 'Find two numbers that MULTIPLY to c and ADD to b. They fill the brackets: (x + p)(x + q).' },
      { when: 'Signs', what: 'c positive: both numbers share b’s sign. c negative: one of each, the bigger takes b’s sign.' },
      { when: 'Check', what: 'FOIL it back out — it costs five seconds and catches everything.' },
    ],
    generate: () => {
      const p = randNonZero(9);
      let q = randNonZero(9);
      if (q === -p) q = q + (q > 0 ? 1 : -1); // avoid b = 0
      const b = p + q;
      const c = p * q;
      const fmt = (m: number, n: number) => `(x ${signed(m)})(x ${signed(n)})`;
      const canonical = (m: number, n: number) => fmt(Math.max(m, n), Math.min(m, n));
      const correct = canonical(p, q);
      const { options, correct: idx } = makeChoices(correct, [
        canonical(-p, -q),
        canonical(p, -q),
        canonical(-p, q),
        canonical(p + 1, q - 1),
      ]);
      return {
        prompt: `Factor ${quadratic(b, c)}`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `Look for two numbers that multiply to ${num(c)} and add to ${num(b)}.`,
          `${num(p)} × ${num(q)} = ${num(c)} and ${num(p)} + ${num(q)} = ${num(b)} ✓`,
          `= ${correct}`,
        ],
      };
    },
  },
  {
    id: 'g9-quadratics',
    grade: 9,
    title: 'Solving quadratics',
    tagline: 'Factor, then let each bracket be zero',
    concept: [
      { when: 'Zero product', what: 'If two things multiply to zero, one of them IS zero. Factor, set each bracket to 0.' },
      { when: 'The roots', what: 'x² + bx + c = (x + p)(x + q) = 0 gives x = −p and x = −q.' },
    ],
    generate: () => {
      const p = randNonZero(9);
      let q = randNonZero(9);
      if (q === p) q = q > 0 ? q + 1 : q - 1; // two distinct roots
      const b = p + q;
      const c = p * q;
      return {
        prompt: `Solve ${quadratic(b, c)} = 0`,
        spec: {
          type: 'multi',
          answers: [-p, -q],
          ordered: false,
          neg: true,
          label: 'the two roots',
        },
        steps: [
          `Factor: (x ${signed(p)})(x ${signed(q)}) = 0.`,
          `Each bracket can be zero: x = ${num(-p)} or x = ${num(-q)}.`,
        ],
      };
    },
  },
  {
    id: 'g9-inequalities',
    grade: 9,
    title: 'Inequalities',
    tagline: 'Solve like equations — but watch the flip',
    concept: [
      { when: 'Mostly normal', what: 'Add, subtract, divide both sides exactly like an equation.' },
      { when: 'The flip', what: 'Multiply or divide by a NEGATIVE and the inequality sign flips direction.' },
    ],
    generate: () => {
      const x = randInt(-8, 8);
      const a = randNonZero(6);
      const b = randNonZero(15);
      const c = a * x + b;
      const op = pick(['<', '>'] as const);
      const flips = a < 0;
      const finalOp = flips ? (op === '<' ? '>' : '<') : op;
      const correct = `x ${finalOp} ${num(x)}`;
      const { options, correct: idx } = makeChoices(correct, [
        `x ${finalOp === '<' ? '>' : '<'} ${num(x)}`,
        `x ${finalOp} ${num(-x)}`,
        `x ${finalOp === '<' ? '>' : '<'} ${num(-x)}`,
      ]);
      return {
        prompt: `Solve ${a === 1 ? 'x' : a === -1 ? '−x' : `${num(a)}x`} ${signed(b)} ${op} ${num(c)}`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides: ${num(a)}x ${op} ${num(c - b)}.`,
          flips
            ? `Divide by ${num(a)} — negative, so the sign FLIPS: x ${finalOp} ${num(x)}.`
            : `Divide by ${num(a)}: x ${finalOp} ${num(x)}.`,
        ],
      };
    },
  },
  {
    id: 'g9-radicals',
    grade: 9,
    title: 'Simplifying radicals',
    tagline: 'Pull perfect squares out of the root',
    concept: [
      { when: 'The move', what: 'Split the number into (perfect square) × (leftover): √50 = √25 × √2 = 5√2.' },
      { when: 'Look for', what: 'The biggest square factor: 4, 9, 16, 25, 36, 49…' },
    ],
    generate: () => {
      const outer = randInt(2, 7);
      const inner = pick([2, 3, 5, 6, 7, 10]);
      const total = outer * outer * inner;
      const correct = `${outer}√${inner}`;
      const { options, correct: idx } = makeChoices(correct, [
        `${inner}√${outer}`,
        `${outer * outer}√${inner}`,
        `${outer}√${inner * 2}`,
        `${Math.max(2, outer - 1)}√${inner}`,
      ]);
      return {
        prompt: `Simplify √${total}`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `${total} = ${outer * outer} × ${inner}, and ${outer * outer} is a perfect square.`,
          `√${total} = √${outer * outer} × √${inner} = ${outer}√${inner}`,
        ],
      };
    },
  },
  {
    id: 'g9-systems',
    grade: 9,
    title: 'Systems of equations',
    tagline: 'Two equations, two unknowns',
    concept: [
      { when: 'Elimination', what: 'Add or subtract the equations so one variable cancels, solve what is left, substitute back.' },
      { when: 'Check', what: 'The answer pair must satisfy BOTH equations.' },
    ],
    generate: () => {
      const x = randInt(-6, 6);
      const y = randNonZero(6);
      const a = randInt(1, 4);
      const c1 = a * x + y;
      const c2 = x - y;
      return {
        prompt: `${a === 1 ? 'x' : `${a}x`} + y = ${num(c1)}\nx − y = ${num(c2)}`,
        instruction: 'find x and y',
        spec: { type: 'multi', answers: [x, y], ordered: true, neg: true, label: 'x, y' },
        steps: [
          `Add the equations — the y terms cancel: ${a + 1}x = ${num(c1 + c2)}.`,
          `x = ${num(x)}.`,
          `Substitute back: ${num(x)} − y = ${num(c2)}, so y = ${num(y)}.`,
        ],
      };
    },
  },
];
