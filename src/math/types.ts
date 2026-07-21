// The mathematics curriculum: grades 7–12, procedurally generated questions.

export type AnswerSpec =
  | {
      /** a single number: integers, negatives, decimals */
      type: 'numeric';
      answer: number;
      /** extra keypad keys the answer may need */
      neg?: boolean;
      dot?: boolean;
    }
  | {
      /** a fraction n/d — any equivalent fraction or exact decimal is accepted */
      type: 'fraction';
      n: number;
      d: number;
    }
  | {
      /** several numbers separated by commas; ordered for pairs like (x, y) */
      type: 'multi';
      answers: number[];
      ordered: boolean;
      neg?: boolean;
      dot?: boolean;
      /** what the parts mean, e.g. "x, y" or "the two roots" */
      label: string;
    }
  | {
      /** pick one of the options */
      type: 'choice';
      options: string[];
      correct: number;
    };

export interface MathQuestion {
  /** the question itself, e.g. "Solve 3x + 5 = 20" */
  prompt: string;
  /** smaller instruction line, e.g. "give x" */
  instruction?: string;
  spec: AnswerSpec;
  /** worked-solution lines, in order */
  steps: string[];
}

export interface Topic {
  id: string;
  grade: number;
  title: string;
  tagline: string;
  /** lesson content: labeled concept lines */
  concept: { when: string; what: string }[];
  generate: () => MathQuestion;
}

export interface GradeInfo {
  grade: number;
  name: string;
  blurb: string;
}
