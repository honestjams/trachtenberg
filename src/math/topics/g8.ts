import { coef, makeChoices, num, pick, randInt, randNonZero, reduce, signed } from '../helpers';
import type { Topic } from '../types';

const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const sup = (n: number): string =>
  String(n)
    .split('')
    .map((d) => (d === '-' ? '⁻' : SUP[Number(d)]))
    .join('');

export const grade8: Topic[] = [
  {
    id: 'g8-exponents',
    grade: 8,
    title: 'Exponent laws',
    tagline: 'Multiply, divide and stack powers',
    concept: [
      { when: 'Multiplying', what: 'Same base? Add the exponents: aᵐ · aⁿ = aᵐ⁺ⁿ.' },
      { when: 'Dividing', what: 'Same base? Subtract them: aᵐ ÷ aⁿ = aᵐ⁻ⁿ.' },
      { when: 'Power of power', what: '(aᵐ)ⁿ = aᵐⁿ — the exponents multiply.' },
    ],
    generate: () => {
      const base = pick([2, 3, 5, 7, 'x'] as const);
      const kind = pick(['mul', 'div', 'pow'] as const);
      const m = randInt(2, 8);
      const n = randInt(2, 8);
      if (kind === 'mul') {
        return {
          prompt: `${base}${sup(m)} · ${base}${sup(n)} = ${base}?`,
          instruction: 'give the missing exponent',
          spec: { type: 'numeric', answer: m + n },
          steps: [`Same base, multiplying — add the exponents: ${m} + ${n} = ${m + n}.`],
        };
      }
      if (kind === 'div') {
        const big = Math.max(m, n) + randInt(1, 4);
        return {
          prompt: `${base}${sup(big)} ÷ ${base}${sup(n)} = ${base}?`,
          instruction: 'give the missing exponent',
          spec: { type: 'numeric', answer: big - n },
          steps: [`Same base, dividing — subtract the exponents: ${big} − ${n} = ${big - n}.`],
        };
      }
      return {
        prompt: `(${base}${sup(m)})${sup(n)} = ${base}?`,
        instruction: 'give the missing exponent',
        spec: { type: 'numeric', answer: m * n },
        steps: [`A power of a power — multiply the exponents: ${m} × ${n} = ${m * n}.`],
      };
    },
  },
  {
    id: 'g8-scientific',
    grade: 8,
    title: 'Scientific notation',
    tagline: 'Very big and very small, tamed',
    concept: [
      { when: 'The form', what: 'One nonzero digit before the point, times a power of ten: 34,000 = 3.4 × 10⁴.' },
      { when: 'The exponent', what: 'Count how many places the point moves. Left = positive power, right = negative.' },
    ],
    generate: () => {
      const mantissa = randInt(11, 99) / 10;
      const exp = pick([-4, -3, -2, 3, 4, 5, 6]);
      const value = mantissa * 10 ** exp;
      const display =
        exp > 0
          ? Math.round(value).toLocaleString()
          : value.toFixed(Math.abs(exp) + 1).replace(/0+$/, '');
      const correct = `${mantissa} × 10${sup(exp)}`;
      const { options, correct: idx } = makeChoices(correct, [
        `${mantissa} × 10${sup(exp + 1)}`,
        `${mantissa} × 10${sup(exp - 1)}`,
        `${mantissa} × 10${sup(-exp)}`,
        `${mantissa * 10} × 10${sup(exp - 1)}`,
      ]);
      return {
        prompt: `Write ${display} in scientific notation`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `Put the point after the first nonzero digit: ${mantissa}.`,
          `The point moved ${Math.abs(exp)} place${Math.abs(exp) === 1 ? '' : 's'} ${exp > 0 ? 'left, so the power is positive' : 'right, so the power is negative'}: 10${sup(exp)}.`,
          `${display} = ${correct}`,
        ],
      };
    },
  },
  {
    id: 'g8-linear',
    grade: 8,
    title: 'Multi-step equations',
    tagline: 'Variables on both sides',
    concept: [
      { when: 'Gather x', what: 'Move every x term to one side, every plain number to the other — by adding or subtracting on both sides.' },
      { when: 'Finish', what: 'Divide by the coefficient left on x.' },
    ],
    generate: () => {
      const x = randNonZero(10);
      const a = randInt(3, 9);
      const c = randInt(1, a - 1);
      const b = randNonZero(15);
      const d = (a - c) * x + b;
      return {
        prompt: `${coef(a)} ${signed(b)} = ${coef(c)} ${signed(d)}`,
        instruction: 'solve for x',
        spec: { type: 'numeric', answer: x, neg: true },
        steps: [
          `Subtract ${coef(c)} from both sides: ${coef(a - c)} ${signed(b)} = ${num(d)}.`,
          `${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: ${coef(a - c)} = ${num(d - b)}.`,
          `Divide by ${a - c}: x = ${num(x)}.`,
        ],
      };
    },
  },
  {
    id: 'g8-slope',
    grade: 8,
    title: 'Slope',
    tagline: 'Rise over run between two points',
    concept: [
      { when: 'The formula', what: 'slope = (y₂ − y₁) / (x₂ − x₁) — the change in y over the change in x.' },
      { when: 'Signs', what: 'Uphill left-to-right is positive, downhill is negative. Keep the two points in the same order top and bottom!' },
    ],
    generate: () => {
      const x1 = randInt(-6, 6);
      let dx = randNonZero(6);
      const y1 = randInt(-6, 6);
      const dy = randNonZero(8);
      const x2 = x1 + dx;
      const y2 = y1 + dy;
      const r = reduce(dy, dx);
      return {
        prompt: `Find the slope through (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)})`,
        spec: { type: 'fraction', ...r },
        steps: [
          `slope = (y₂ − y₁)/(x₂ − x₁) = (${num(y2)} − ${num(y1)}) / (${num(x2)} − ${num(x1)}).`,
          `= ${num(dy)}/${num(dx)}${r.d === 1 ? ` = ${num(r.n)}` : ` = ${r.n}/${r.d}`}`,
        ],
      };
    },
  },
  {
    id: 'g8-pythagorean',
    grade: 8,
    title: 'Pythagorean theorem',
    tagline: 'a² + b² = c²',
    concept: [
      { when: 'Right triangles', what: 'The two short sides squared, added, equal the long side (hypotenuse) squared.' },
      { when: 'Finding a leg', what: 'Rearrange: a² = c² − b². Square, subtract, square-root.' },
    ],
    generate: () => {
      const triples: [number, number, number][] = [
        [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29],
      ];
      const [a, b, c] = pick(triples);
      if (Math.random() < 0.5) {
        return {
          prompt: `A right triangle has legs ${a} and ${b}. Find the hypotenuse.`,
          spec: { type: 'numeric', answer: c },
          steps: [
            `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}.`,
            `c = √${c * c} = ${c}`,
          ],
        };
      }
      return {
        prompt: `A right triangle has hypotenuse ${c} and one leg ${a}. Find the other leg.`,
        spec: { type: 'numeric', answer: b },
        steps: [
          `b² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}.`,
          `b = √${b * b} = ${b}`,
        ],
      };
    },
  },
  {
    id: 'g8-roots',
    grade: 8,
    title: 'Roots & perfect powers',
    tagline: 'Square roots and cube roots by recognition',
    concept: [
      { when: 'Square roots', what: '√n asks: what times itself gives n? Know the squares to 20² by sight.' },
      { when: 'Cube roots', what: '∛n asks for a number used three times. 2³=8, 3³=27, 4³=64, 5³=125 …' },
    ],
    generate: () => {
      if (Math.random() < 0.6) {
        const r = randInt(4, 20);
        return {
          prompt: `√${r * r}`,
          spec: { type: 'numeric', answer: r },
          steps: [`${r} × ${r} = ${r * r}, so √${r * r} = ${r}.`],
        };
      }
      const r = randInt(2, 10);
      return {
        prompt: `∛${r ** 3}`,
        spec: { type: 'numeric', answer: r },
        steps: [`${r} × ${r} × ${r} = ${r ** 3}, so ∛${r ** 3} = ${r}.`],
      };
    },
  },
];
