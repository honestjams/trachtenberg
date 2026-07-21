import { num, pick, randInt, reduce } from '../helpers';
import type { Topic } from '../types';

const TRIPLES: [number, number, number][] = [
  [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [12, 16, 20], [20, 21, 29],
];

export const grade10: Topic[] = [
  {
    id: 'g10-similar',
    grade: 10,
    title: 'Similar triangles',
    tagline: 'Same shape, scaled — sides stay in proportion',
    concept: [
      { when: 'Similar', what: 'Same angles means same shape. Every side of one triangle is the same multiple of the matching side of the other.' },
      { when: 'Missing side', what: 'Set up the proportion between matching sides and cross-multiply.' },
    ],
    generate: () => {
      const a = randInt(3, 12);
      const b = randInt(3, 12);
      const k = randInt(2, 5);
      return {
        prompt: `Two triangles are similar. The first has sides ${a} and ${b}; the matching side to ${a} in the second is ${a * k}. How long is the side matching ${b}?`,
        spec: { type: 'numeric', answer: b * k },
        steps: [
          `The scale factor is ${a * k}/${a} = ${k}.`,
          `Matching side = ${b} × ${k} = ${b * k}.`,
        ],
      };
    },
  },
  {
    id: 'g10-trig',
    grade: 10,
    title: 'Right-triangle trig',
    tagline: 'SOH CAH TOA',
    concept: [
      { when: 'The ratios', what: 'sin = Opposite/Hypotenuse, cos = Adjacent/Hypotenuse, tan = Opposite/Adjacent.' },
      { when: 'Reading the triangle', what: '“Opposite” and “adjacent” are measured from the angle you are standing at — the hypotenuse never changes.' },
    ],
    generate: () => {
      const [opp, adj, hyp] = pick(TRIPLES);
      const fn = pick(['sin', 'cos', 'tan'] as const);
      const [n, d] =
        fn === 'sin' ? [opp, hyp] : fn === 'cos' ? [adj, hyp] : [opp, adj];
      const r = reduce(n, d);
      return {
        prompt: `A right triangle has opposite side ${opp}, adjacent side ${adj} and hypotenuse ${hyp} (from angle θ). Find ${fn} θ.`,
        spec: { type: 'fraction', ...r },
        steps: [
          fn === 'sin'
            ? `SOH: sin θ = opposite/hypotenuse = ${opp}/${hyp}.`
            : fn === 'cos'
              ? `CAH: cos θ = adjacent/hypotenuse = ${adj}/${hyp}.`
              : `TOA: tan θ = opposite/adjacent = ${opp}/${adj}.`,
          r.d === 1 ? `= ${r.n}` : `= ${r.n}/${r.d}`,
        ],
      };
    },
  },
  {
    id: 'g10-circles',
    grade: 10,
    title: 'Circles',
    tagline: 'Area and circumference, exactly in π',
    concept: [
      { when: 'Circumference', what: 'C = 2πr — the distance around.' },
      { when: 'Area', what: 'A = πr² — the space inside.' },
      { when: 'Exact answers', what: 'Leave π in the answer: a circle of radius 3 has area 9π, not 28.27…' },
    ],
    generate: () => {
      const r = randInt(2, 15);
      if (Math.random() < 0.5) {
        return {
          prompt: `A circle has radius ${r}. Its area is kπ — what is k?`,
          spec: { type: 'numeric', answer: r * r },
          steps: [`A = πr² = π × ${r}² = ${r * r}π, so k = ${r * r}.`],
        };
      }
      return {
        prompt: `A circle has radius ${r}. Its circumference is kπ — what is k?`,
        spec: { type: 'numeric', answer: 2 * r },
        steps: [`C = 2πr = 2 × ${r} × π = ${2 * r}π, so k = ${2 * r}.`],
      };
    },
  },
  {
    id: 'g10-coordinate',
    grade: 10,
    title: 'Coordinate geometry',
    tagline: 'Distance and midpoint between points',
    concept: [
      { when: 'Distance', what: 'Pythagoras in disguise: d = √((x₂−x₁)² + (y₂−y₁)²).' },
      { when: 'Midpoint', what: 'Just average the coordinates: ((x₁+x₂)/2, (y₁+y₂)/2).' },
    ],
    generate: () => {
      if (Math.random() < 0.5) {
        const [dx, dy, d] = pick(TRIPLES);
        const x1 = randInt(-6, 6);
        const y1 = randInt(-6, 6);
        return {
          prompt: `Find the distance between (${num(x1)}, ${num(y1)}) and (${num(x1 + dx)}, ${num(y1 + dy)})`,
          spec: { type: 'numeric', answer: d },
          steps: [
            `Δx = ${dx}, Δy = ${dy}.`,
            `d = √(${dx}² + ${dy}²) = √${dx * dx + dy * dy} = ${d}`,
          ],
        };
      }
      const x1 = randInt(-8, 8);
      const y1 = randInt(-8, 8);
      const x2 = x1 + 2 * randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
      const y2 = y1 + 2 * randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      return {
        prompt: `Find the midpoint of (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)})`,
        spec: { type: 'multi', answers: [mx, my], ordered: true, neg: true, label: 'x, y' },
        steps: [
          `x: (${num(x1)} + ${num(x2)})/2 = ${num(mx)}.`,
          `y: (${num(y1)} + ${num(y2)})/2 = ${num(my)}.`,
          `Midpoint: (${num(mx)}, ${num(my)})`,
        ],
      };
    },
  },
  {
    id: 'g10-volume',
    grade: 10,
    title: 'Volume',
    tagline: 'Prisms, cylinders and pyramids',
    concept: [
      { when: 'Prisms & cylinders', what: 'Volume = area of the base × height. A cylinder is just a circular prism: πr²h.' },
      { when: 'Pyramids & cones', what: 'A third of the matching prism: ⅓ × base area × height.' },
    ],
    generate: () => {
      const kind = pick(['box', 'cylinder', 'pyramid'] as const);
      if (kind === 'box') {
        const l = randInt(2, 10);
        const w = randInt(2, 10);
        const h = randInt(2, 10);
        return {
          prompt: `A box is ${l} × ${w} × ${h}. What is its volume?`,
          spec: { type: 'numeric', answer: l * w * h },
          steps: [`V = ${l} × ${w} × ${h} = ${l * w * h}.`],
        };
      }
      if (kind === 'cylinder') {
        const r = randInt(2, 8);
        const h = randInt(2, 12);
        return {
          prompt: `A cylinder has radius ${r} and height ${h}. Its volume is kπ — what is k?`,
          spec: { type: 'numeric', answer: r * r * h },
          steps: [`V = πr²h = π × ${r * r} × ${h} = ${r * r * h}π, so k = ${r * r * h}.`],
        };
      }
      const s = randInt(2, 9);
      const h = randInt(1, 5) * 3;
      return {
        prompt: `A square pyramid has base side ${s} and height ${h}. What is its volume?`,
        spec: { type: 'numeric', answer: (s * s * h) / 3 },
        steps: [
          `Base area = ${s}² = ${s * s}.`,
          `V = ⅓ × ${s * s} × ${h} = ${(s * s * h) / 3}.`,
        ],
      };
    },
  },
];
