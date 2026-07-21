import { makeChoices, num, pick, randInt, randNonZero, reduce, shuffle } from '../helpers';
import type { Topic } from '../types';

const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const sup = (n: number): string =>
  String(n).split('').map((d) => (d === '-' ? '⁻' : SUP[Number(d)])).join('');

const UNIT_CIRCLE: { deg: number; sin: string; cos: string }[] = [
  { deg: 0, sin: '0', cos: '1' },
  { deg: 30, sin: '1/2', cos: '√3/2' },
  { deg: 45, sin: '√2/2', cos: '√2/2' },
  { deg: 60, sin: '√3/2', cos: '1/2' },
  { deg: 90, sin: '1', cos: '0' },
  { deg: 120, sin: '√3/2', cos: '−1/2' },
  { deg: 135, sin: '√2/2', cos: '−√2/2' },
  { deg: 150, sin: '1/2', cos: '−√3/2' },
  { deg: 180, sin: '0', cos: '−1' },
  { deg: 270, sin: '−1', cos: '0' },
];

export const grade12: Topic[] = [
  {
    id: 'g12-unitcircle',
    grade: 12,
    title: 'The unit circle',
    tagline: 'Exact sin and cos at the special angles',
    concept: [
      { when: 'Three values', what: 'Memorize 1/2, √2/2, √3/2 — every special angle uses one of them (or 0 and 1).' },
      { when: 'Which is which', what: 'sin climbs from 0 to 1 over 0°→90°; cos does the reverse. 30° is the “small” one for sin: 1/2.' },
      { when: 'Signs', what: 'Quadrant II: sin +, cos −. Quadrant III: both −. Quadrant IV: sin −, cos +.' },
    ],
    generate: () => {
      const entry = pick(UNIT_CIRCLE);
      const fn = pick(['sin', 'cos'] as const);
      const correct = fn === 'sin' ? entry.sin : entry.cos;
      const pool = ['0', '1', '−1', '1/2', '−1/2', '√2/2', '−√2/2', '√3/2', '−√3/2'].filter(
        (v) => v !== correct
      );
      const { options, correct: idx } = makeChoices(correct, shuffle(pool).slice(0, 3));
      return {
        prompt: `${fn}(${entry.deg}°)`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `${entry.deg}° — reference the special-angle table: sin = ${entry.sin}, cos = ${entry.cos}.`,
          `${fn}(${entry.deg}°) = ${correct}`,
        ],
      };
    },
  },
  {
    id: 'g12-vectors',
    grade: 12,
    title: 'Vectors',
    tagline: 'Magnitude and the dot product',
    concept: [
      { when: 'Magnitude', what: 'The length of ⟨a, b⟩ is √(a² + b²) — Pythagoras again.' },
      { when: 'Dot product', what: '⟨a, b⟩ · ⟨c, d⟩ = ac + bd. A single number, not a vector.' },
      { when: 'Perpendicular', what: 'Dot product zero means the vectors meet at a right angle.' },
    ],
    generate: () => {
      if (Math.random() < 0.5) {
        const [a, b, c] = pick([
          [3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25],
        ] as [number, number, number][]);
        const sa = Math.random() < 0.5 ? -a : a;
        const sb = Math.random() < 0.5 ? -b : b;
        return {
          prompt: `Find the magnitude of ⟨${num(sa)}, ${num(sb)}⟩`,
          spec: { type: 'numeric', answer: c },
          steps: [
            `|v| = √((${num(sa)})² + (${num(sb)})²) = √(${a * a} + ${b * b}) = √${c * c}.`,
            `= ${c}`,
          ],
        };
      }
      const a = randNonZero(8);
      const b = randNonZero(8);
      const c = randNonZero(8);
      const d = randNonZero(8);
      return {
        prompt: `⟨${num(a)}, ${num(b)}⟩ · ⟨${num(c)}, ${num(d)}⟩`,
        spec: { type: 'numeric', answer: a * c + b * d, neg: true },
        steps: [
          `Multiply matching parts and add: ${num(a)}×${num(c)} + ${num(b)}×${num(d)}.`,
          `= ${num(a * c)} + (${num(b * d)}) = ${num(a * c + b * d)}`,
        ],
      };
    },
  },
  {
    id: 'g12-combinatorics',
    grade: 12,
    title: 'Counting',
    tagline: 'Permutations and combinations',
    concept: [
      { when: 'Order matters', what: 'Permutations: nPr = n!/(n−r)! — arranging r of n things in order.' },
      { when: 'Order doesn’t', what: 'Combinations: nCr = n!/(r!(n−r)!) — choosing a group, order ignored.' },
      { when: 'Which one?', what: '“Line up / rank / arrange” → permutation. “Choose / pick a team” → combination.' },
    ],
    generate: () => {
      const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
      const n = randInt(5, 10);
      const r = randInt(2, Math.min(4, n - 1));
      if (Math.random() < 0.5) {
        const answer = fact(n) / (fact(r) * fact(n - r));
        return {
          prompt: `How many ways to choose ${r} people from ${n}? (order doesn't matter)`,
          spec: { type: 'numeric', answer },
          steps: [
            `Choosing a group → combination: ${n}C${r} = ${n}!/(${r}!·${n - r}!).`,
            `= ${answer}`,
          ],
        };
      }
      const answer = fact(n) / fact(n - r);
      return {
        prompt: `How many ways to arrange ${r} of ${n} people in a line?`,
        spec: { type: 'numeric', answer },
        steps: [
          `Order matters → permutation: ${n}P${r} = ${n}!/${n - r}! = ${Array.from({ length: r }, (_, i) => n - i).join(' × ')}.`,
          `= ${answer}`,
        ],
      };
    },
  },
  {
    id: 'g12-probability',
    grade: 12,
    title: 'Probability',
    tagline: 'Favorable over possible',
    concept: [
      { when: 'The definition', what: 'P = favorable outcomes ÷ total outcomes, when all outcomes are equally likely.' },
      { when: 'And', what: 'Independent events multiply: P(A and B) = P(A) × P(B).' },
    ],
    generate: () => {
      if (Math.random() < 0.5) {
        const red = randInt(2, 8);
        const blue = randInt(2, 8);
        const green = randInt(1, 6);
        const total = red + blue + green;
        const r = reduce(red, total);
        return {
          prompt: `A bag holds ${red} red, ${blue} blue and ${green} green marbles. P(red)?`,
          spec: { type: 'fraction', ...r },
          steps: [
            `Total marbles: ${red} + ${blue} + ${green} = ${total}.`,
            `P(red) = ${red}/${total}${r.d !== total ? ` = ${r.n}/${r.d}` : ''}`,
          ],
        };
      }
      const s1 = pick([2, 3, 4]);
      const s2 = pick([2, 3, 4, 6]);
      const r = reduce(1, s1 * s2);
      return {
        prompt: `One spinner has ${s1} equal sections, another has ${s2}. P(both land on section 1)?`,
        spec: { type: 'fraction', ...r },
        steps: [
          `Independent events multiply: 1/${s1} × 1/${s2}.`,
          `= 1/${s1 * s2}`,
        ],
      };
    },
  },
  {
    id: 'g12-derivatives',
    grade: 12,
    title: 'Intro to derivatives',
    tagline: 'The power rule — calculus begins',
    concept: [
      { when: 'What it means', what: 'The derivative is the slope of the curve at each point — the instantaneous rate of change.' },
      { when: 'Power rule', what: 'd/dx of xⁿ = n·xⁿ⁻¹: the exponent hops down front, then drops by one.' },
      { when: 'Constants', what: 'Coefficients ride along; lone constants vanish (their slope is 0).' },
    ],
    generate: () => {
      const a = randInt(2, 9);
      const n = randInt(2, 6);
      const c = randNonZero(9);
      const term = (k: number, p: number) =>
        p === 0 ? `${num(k)}` : p === 1 ? `${num(k)}x` : `${num(k)}x${sup(p)}`;
      const correct = `${term(a * n, n - 1)}`;
      const withC = Math.random() < 0.5;
      if (withC) {
        const correctFull = `${term(a * n, n - 1)} ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`;
        const { options, correct: idx } = makeChoices(correctFull, [
          `${term(a, n - 1)} ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`,
          `${term(a * n, n)} ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`,
          correct,
        ]);
        return {
          prompt: `d/dx of ${term(a, n)} ${c >= 0 ? '+' : '−'} ${Math.abs(c)}x`,
          spec: { type: 'choice', options, correct: idx },
          steps: [
            `Power rule on ${term(a, n)}: bring the ${n} down → ${a}·${n} = ${a * n}, drop the power to ${n - 1}.`,
            `The ${Math.abs(c)}x term has slope ${num(c)}.`,
            `= ${correctFull}`,
          ],
        };
      }
      const { options, correct: idx } = makeChoices(correct, [
        term(a, n - 1),
        term(a * n, n),
        term(a * (n - 1), n - 1),
      ]);
      return {
        prompt: `d/dx of ${term(a, n)}`,
        spec: { type: 'choice', options, correct: idx },
        steps: [
          `Bring the exponent down: ${a} × ${n} = ${a * n}.`,
          `Lower the power by one: x${sup(n - 1)}.`,
          `= ${correct}`,
        ],
      };
    },
  },
  {
    id: 'g12-matrices',
    grade: 12,
    title: 'Matrices',
    tagline: 'The 2×2 determinant',
    concept: [
      { when: 'The formula', what: 'For [[a, b], [c, d]], the determinant is ad − bc — main diagonal minus the other.' },
      { when: 'Why care', what: 'Determinant 0 means the matrix squashes space flat — no inverse exists.' },
    ],
    generate: () => {
      const a = randNonZero(8);
      const b = randNonZero(8);
      const c = randNonZero(8);
      const d = randNonZero(8);
      return {
        prompt: `Find the determinant of\n[ ${num(a)}  ${num(b)} ]\n[ ${num(c)}  ${num(d)} ]`,
        spec: { type: 'numeric', answer: a * d - b * c, neg: true },
        steps: [
          `det = ad − bc = (${num(a)})(${num(d)}) − (${num(b)})(${num(c)}).`,
          `= ${num(a * d)} − (${num(b * c)}) = ${num(a * d - b * c)}`,
        ],
      };
    },
  },
];
