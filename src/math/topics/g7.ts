import { coef, gcd, num, pick, randInt, randNonZero, reduce, signed } from '../helpers';
import type { Topic } from '../types';

export const grade7: Topic[] = [
  {
    id: 'g7-integers',
    grade: 7,
    title: 'Integers & negatives',
    tagline: 'Adding, subtracting and multiplying below zero',
    concept: [
      { when: 'Adding', what: 'Same signs: add and keep the sign. Different signs: subtract the smaller size from the bigger, keep the sign of the bigger.' },
      { when: 'Subtracting', what: 'Subtracting is adding the opposite: 5 − (−3) becomes 5 + 3.' },
      { when: 'Multiplying', what: 'Same signs give a positive, different signs give a negative. The sizes just multiply.' },
    ],
    generate: () => {
      const kind = pick(['add', 'sub', 'mul'] as const);
      const a = randNonZero(20);
      const b = randNonZero(20);
      if (kind === 'add') {
        return {
          prompt: `${num(a)} + (${num(b)})`,
          spec: { type: 'numeric', answer: a + b, neg: true },
          steps: [
            a * b > 0
              ? `Same signs — add the sizes: ${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}, keep the sign.`
              : `Different signs — subtract the sizes: ${Math.max(Math.abs(a), Math.abs(b))} − ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(a + b)}, keep the sign of the bigger one.`,
            `${num(a)} + (${num(b)}) = ${num(a + b)}`,
          ],
        };
      }
      if (kind === 'sub') {
        return {
          prompt: `${num(a)} − (${num(b)})`,
          spec: { type: 'numeric', answer: a - b, neg: true },
          steps: [
            `Subtracting is adding the opposite: ${num(a)} − (${num(b)}) = ${num(a)} + (${num(-b)}).`,
            `${num(a)} + (${num(-b)}) = ${num(a - b)}`,
          ],
        };
      }
      return {
        prompt: `${num(a)} × (${num(b)})`,
        spec: { type: 'numeric', answer: a * b, neg: true },
        steps: [
          `Multiply the sizes: ${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}.`,
          a * b > 0
            ? 'Same signs, so the answer is positive.'
            : 'Different signs, so the answer is negative.',
          `${num(a)} × (${num(b)}) = ${num(a * b)}`,
        ],
      };
    },
  },
  {
    id: 'g7-fractions',
    grade: 7,
    title: 'Fractions',
    tagline: 'Adding, subtracting and multiplying parts',
    concept: [
      { when: 'Add / subtract', what: 'You need a common denominator first. Rewrite both fractions over it, then add or subtract the tops.' },
      { when: 'Multiply', what: 'Straight across: tops together, bottoms together.' },
      { when: 'Always', what: 'Reduce at the end — divide top and bottom by their greatest common factor.' },
    ],
    generate: () => {
      const kind = pick(['add', 'sub', 'mul'] as const);
      const d1 = pick([2, 3, 4, 5, 6, 8]);
      const d2 = pick([2, 3, 4, 5, 6, 8]);
      const n1 = randInt(1, d1 - 1);
      const n2 = randInt(1, d2 - 1);
      if (kind === 'mul') {
        const r = reduce(n1 * n2, d1 * d2);
        return {
          prompt: `${n1}/${d1} × ${n2}/${d2}`,
          spec: { type: 'fraction', ...r },
          steps: [
            `Multiply straight across: ${n1} × ${n2} = ${n1 * n2} on top, ${d1} × ${d2} = ${d1 * d2} underneath.`,
            `Reduce: ${n1 * n2}/${d1 * d2} = ${r.n}/${r.d}`,
          ],
        };
      }
      const lcm = (d1 * d2) / gcd(d1, d2);
      const top1 = n1 * (lcm / d1);
      const top2 = n2 * (lcm / d2);
      const top = kind === 'add' ? top1 + top2 : top1 - top2;
      const r = reduce(top, lcm);
      const op = kind === 'add' ? '+' : '−';
      return {
        prompt: `${n1}/${d1} ${op} ${n2}/${d2}`,
        spec: { type: 'fraction', ...r },
        steps: [
          `Common denominator: ${lcm}. Rewrite: ${top1}/${lcm} ${op} ${top2}/${lcm}.`,
          `${kind === 'add' ? 'Add' : 'Subtract'} the tops: ${top1} ${op} ${top2} = ${num(top)}.`,
          `${num(top)}/${lcm}${r.d !== lcm || r.n !== top ? ` reduces to ${r.n}/${r.d}` : ' is already reduced'}.`,
        ],
      };
    },
  },
  {
    id: 'g7-percent',
    grade: 7,
    title: 'Percentages',
    tagline: 'Percent of a number, discounts and increases',
    concept: [
      { when: 'Percent of', what: '“Percent” means “per hundred”: 30% of 80 is 0.30 × 80.' },
      { when: 'Discount', what: 'A 20% discount leaves 80%: multiply by 0.80 instead of subtracting.' },
      { when: 'Increase', what: 'A 15% increase means multiplying by 1.15.' },
    ],
    generate: () => {
      const kind = pick(['of', 'discount', 'increase'] as const);
      const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
      const base = randInt(2, 40) * 10;
      if (kind === 'of') {
        return {
          prompt: `What is ${pct}% of ${base}?`,
          spec: { type: 'numeric', answer: (pct * base) / 100, dot: true },
          steps: [
            `${pct}% = ${pct}/100 = ${pct / 100}.`,
            `${pct / 100} × ${base} = ${(pct * base) / 100}`,
          ],
        };
      }
      if (kind === 'discount') {
        const answer = (base * (100 - pct)) / 100;
        return {
          prompt: `A $${base} item is ${pct}% off. What does it cost?`,
          spec: { type: 'numeric', answer, dot: true },
          steps: [
            `${pct}% off leaves ${100 - pct}% of the price.`,
            `${(100 - pct) / 100} × ${base} = ${answer}`,
          ],
        };
      }
      const answer = (base * (100 + pct)) / 100;
      return {
        prompt: `${base} increased by ${pct}%?`,
        spec: { type: 'numeric', answer, dot: true },
        steps: [
          `An increase of ${pct}% means multiplying by ${(100 + pct) / 100}.`,
          `${(100 + pct) / 100} × ${base} = ${answer}`,
        ],
      };
    },
  },
  {
    id: 'g7-proportions',
    grade: 7,
    title: 'Ratios & proportions',
    tagline: 'Cross-multiply to find the missing piece',
    concept: [
      { when: 'A proportion', what: 'Two equal ratios: a/b = c/d. It holds exactly when the cross-products match: a × d = b × c.' },
      { when: 'Solve', what: 'Cross-multiply, then divide by the number next to x.' },
    ],
    generate: () => {
      const b = randInt(2, 12);
      const mult = randInt(2, 9);
      const a = randInt(2, 12);
      const x = a * mult;
      const d = b * mult;
      return {
        prompt: `${a}/${b} = x/${d}`,
        instruction: 'solve for x',
        spec: { type: 'numeric', answer: x },
        steps: [
          `Cross-multiply: ${a} × ${d} = ${b} × x.`,
          `${a * d} = ${b}x, so x = ${a * d}/${b} = ${x}.`,
        ],
      };
    },
  },
  {
    id: 'g7-equations',
    grade: 7,
    title: 'Simple equations',
    tagline: 'One and two-step equations',
    concept: [
      { when: 'The goal', what: 'Get x alone. Whatever you do to one side, do to the other.' },
      { when: 'Order', what: 'Undo addition and subtraction first, then undo multiplication by dividing.' },
    ],
    generate: () => {
      const a = randInt(2, 9);
      const x = randNonZero(12);
      const b = randNonZero(20);
      const c = a * x + b;
      return {
        prompt: `${coef(a)} ${signed(b)} = ${num(c)}`,
        instruction: 'solve for x',
        spec: { type: 'numeric', answer: x, neg: true },
        steps: [
          `${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides: ${coef(a)} = ${num(c - b)}.`,
          `Divide both sides by ${a}: x = ${num(x)}.`,
        ],
      };
    },
  },
  {
    id: 'g7-geometry',
    grade: 7,
    title: 'Area & perimeter',
    tagline: 'Rectangles and triangles',
    concept: [
      { when: 'Rectangle', what: 'Perimeter is the walk around: 2(l + w). Area is the space inside: l × w.' },
      { when: 'Triangle', what: 'Area = ½ × base × height — half a rectangle.' },
    ],
    generate: () => {
      const kind = pick(['rect-p', 'rect-a', 'tri'] as const);
      if (kind === 'rect-p') {
        const l = randInt(3, 20);
        const w = randInt(2, l);
        return {
          prompt: `A rectangle is ${l} by ${w}. What is its perimeter?`,
          spec: { type: 'numeric', answer: 2 * (l + w) },
          steps: [`Perimeter = 2 × (${l} + ${w}) = 2 × ${l + w} = ${2 * (l + w)}.`],
        };
      }
      if (kind === 'rect-a') {
        const l = randInt(3, 20);
        const w = randInt(2, 12);
        return {
          prompt: `A rectangle is ${l} by ${w}. What is its area?`,
          spec: { type: 'numeric', answer: l * w },
          steps: [`Area = ${l} × ${w} = ${l * w}.`],
        };
      }
      const base = randInt(2, 10) * 2;
      const height = randInt(3, 15);
      return {
        prompt: `A triangle has base ${base} and height ${height}. What is its area?`,
        spec: { type: 'numeric', answer: (base * height) / 2 },
        steps: [
          `Area = ½ × base × height = ½ × ${base} × ${height}.`,
          `= ${(base * height) / 2}`,
        ],
      };
    },
  },
];
