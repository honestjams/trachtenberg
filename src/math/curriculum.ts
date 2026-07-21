import { grade7 } from './topics/g7';
import { grade8 } from './topics/g8';
import { grade9 } from './topics/g9';
import { grade10 } from './topics/g10';
import { grade11 } from './topics/g11';
import { grade12 } from './topics/g12';
import type { GradeInfo, Topic } from './types';

export const GRADES: GradeInfo[] = [
  { grade: 7, name: 'Grade 7', blurb: 'Pre-algebra foundations: negatives, fractions, percentages, first equations' },
  { grade: 8, name: 'Grade 8', blurb: 'Exponents, slope, the Pythagorean theorem, equations with x on both sides' },
  { grade: 9, name: 'Grade 9 · Algebra I', blurb: 'Polynomials, factoring, quadratics, inequalities, systems' },
  { grade: 10, name: 'Grade 10 · Geometry', blurb: 'Similar triangles, trig ratios, circles, coordinates, volume' },
  { grade: 11, name: 'Grade 11 · Algebra II', blurb: 'Quadratic functions, logarithms, sequences, complex numbers' },
  { grade: 12, name: 'Grade 12 · Precalculus', blurb: 'The unit circle, vectors, counting, probability, first derivatives' },
];

export const ALL_TOPICS: Topic[] = [
  ...grade7,
  ...grade8,
  ...grade9,
  ...grade10,
  ...grade11,
  ...grade12,
];

export function topicsForGrade(grade: number): Topic[] {
  return ALL_TOPICS.filter((t) => t.grade === grade);
}

export function topicById(id: string): Topic | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}
