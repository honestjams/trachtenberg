import type { Multiplier } from '../lib/trachtenberg';

export interface RuleInfo {
  multiplier: Multiplier;
  title: string;
  tagline: string;
  /** the rule, spelled out per situation */
  rule: { when: string; what: string }[];
  tips: string[];
  /** default number for the interactive walkthrough */
  exampleNumber: number;
  group: string;
}

// Presented in the classic learning order from Trachtenberg's book:
// start with the easiest rules and build up.
export const RULES: RuleInfo[] = [
  {
    multiplier: 11,
    title: 'Multiply by 11',
    tagline: 'Add the neighbor',
    group: 'The easy wins',
    rule: [
      { when: 'Every digit', what: 'Write the digit plus its neighbor (the digit to its right).' },
      { when: 'Rightmost digit', what: 'It has no neighbor, so just write the digit itself.' },
      { when: 'Leading zero', what: 'Write the neighbor — the first digit of the number (plus any carry).' },
    ],
    tips: [
      'The rightmost digit never changes — it has no neighbor.',
      'If digit + neighbor is 10 or more, write the units and carry the 1.',
    ],
    exampleNumber: 3425,
  },
  {
    multiplier: 12,
    title: 'Multiply by 12',
    tagline: 'Double the digit, add the neighbor',
    group: 'The easy wins',
    rule: [
      { when: 'Every digit', what: 'Double the digit, then add its neighbor.' },
      { when: 'Rightmost digit', what: 'No neighbor yet — just double the digit.' },
      { when: 'Leading zero', what: 'Double of zero is zero, so write the neighbor plus any carry.' },
    ],
    tips: [
      'This is the ×11 rule with the digit doubled first.',
      'Carries show up often here — say “write 4, carry 2” out loud as you learn.',
    ],
    exampleNumber: 316,
  },
  {
    multiplier: 6,
    title: 'Multiply by 6',
    tagline: 'Add half the neighbor — plus 5 if the digit is odd',
    group: 'The halving family',
    rule: [
      { when: 'Every digit', what: 'Write the digit plus half its neighbor (drop the remainder). If the digit is odd, add 5.' },
      { when: 'Rightmost digit', what: 'No neighbor: the digit stays as it is, plus 5 if it is odd.' },
      { when: 'Leading zero', what: 'Half of the first digit (plus any carry).' },
    ],
    tips: [
      '“Half” always drops the remainder: half of 7 is 3, half of 5 is 2.',
      'The +5 for odd digits makes up for the halves you dropped.',
    ],
    exampleNumber: 357,
  },
  {
    multiplier: 7,
    title: 'Multiply by 7',
    tagline: 'Double the digit, add half the neighbor — plus 5 if odd',
    group: 'The halving family',
    rule: [
      { when: 'Every digit', what: 'Double the digit, add half its neighbor, and add 5 if the digit is odd.' },
      { when: 'Rightmost digit', what: 'Just double it — and add 5 if it is odd.' },
      { when: 'Leading zero', what: 'Half of the first digit (plus any carry).' },
    ],
    tips: [
      'It is the ×6 rule with the digit doubled — learn ×6 first.',
      'Odd or even? Check the original digit, not the doubled one.',
    ],
    exampleNumber: 693,
  },
  {
    multiplier: 5,
    title: 'Multiply by 5',
    tagline: 'Half the neighbor — plus 5 if the digit is odd',
    group: 'The halving family',
    rule: [
      { when: 'Every digit', what: 'Ignore the digit itself! Write half the neighbor, plus 5 if the digit is odd.' },
      { when: 'Rightmost digit', what: 'No neighbor: write 0, or 5 if the digit is odd.' },
      { when: 'Leading zero', what: 'Half of the first digit.' },
    ],
    tips: [
      'The current digit only decides odd-or-even — its value never gets added.',
      'Answers ending in 0 or 5 fall out automatically. That is your sanity check.',
    ],
    exampleNumber: 426,
  },
  {
    multiplier: 9,
    title: 'Multiply by 9',
    tagline: 'Subtract from 10, then from 9, adding the neighbor',
    group: 'The subtraction family',
    rule: [
      { when: 'Rightmost digit', what: 'Subtract it from 10.' },
      { when: 'Middle digits', what: 'Subtract the digit from 9 and add the neighbor.' },
      { when: 'Leading zero', what: 'Write the neighbor minus 1 (plus any carry).' },
    ],
    tips: [
      'Only the rightmost digit is subtracted from 10 — everything after uses 9.',
      'The “minus 1” at the front is the price of borrowing in the very first step.',
    ],
    exampleNumber: 2130,
  },
  {
    multiplier: 8,
    title: 'Multiply by 8',
    tagline: 'Subtract, double, add the neighbor',
    group: 'The subtraction family',
    rule: [
      { when: 'Rightmost digit', what: 'Subtract it from 10 and double the result.' },
      { when: 'Middle digits', what: 'Subtract the digit from 9, double it, then add the neighbor.' },
      { when: 'Leading zero', what: 'Write the neighbor minus 2 (plus any carry).' },
    ],
    tips: [
      'Exactly the ×9 rule, but you double the subtraction — and finish with “minus 2”.',
      'Doubling first, then adding the neighbor, keeps the mental load small.',
    ],
    exampleNumber: 456,
  },
  {
    multiplier: 4,
    title: 'Multiply by 4',
    tagline: 'Subtract, add half the neighbor — plus 5 if odd',
    group: 'The subtraction family',
    rule: [
      { when: 'Rightmost digit', what: 'Subtract it from 10, and add 5 if the digit is odd.' },
      { when: 'Middle digits', what: 'Subtract the digit from 9, add 5 if odd, then add half the neighbor.' },
      { when: 'Leading zero', what: 'Write half the neighbor, minus 1 (plus any carry).' },
    ],
    tips: [
      'It combines the subtraction trick of ×9 with the halving trick of ×5.',
      'Do the odd check on the digit before you subtract.',
    ],
    exampleNumber: 346,
  },
  {
    multiplier: 3,
    title: 'Multiply by 3',
    tagline: 'Subtract, double, add half the neighbor — plus 5 if odd',
    group: 'The subtraction family',
    rule: [
      { when: 'Rightmost digit', what: 'Subtract it from 10 and double the result; add 5 if the digit is odd.' },
      { when: 'Middle digits', what: 'Subtract the digit from 9 and double; add 5 if odd; add half the neighbor.' },
      { when: 'Leading zero', what: 'Write half the neighbor, minus 2 (plus any carry).' },
    ],
    tips: [
      'The busiest rule in the system — master ×9, ×8 and ×4 first and this feels natural.',
      'Sometimes the front step dips below zero on its own; the carry always rescues it.',
    ],
    exampleNumber: 492,
  },
  {
    multiplier: 2,
    title: 'Multiply by 2',
    tagline: 'Just double every digit',
    group: 'The freebie',
    rule: [
      { when: 'Every digit', what: 'Double the digit and add any carry. That is the whole rule.' },
    ],
    tips: [
      'A warm-up for the carry habit: write the units, carry the tens.',
      'Use it to get fluent at working right-to-left before the fancier rules.',
    ],
    exampleNumber: 76892,
  },
];

export function ruleFor(multiplier: number): RuleInfo | undefined {
  return RULES.find((r) => r.multiplier === multiplier);
}

/** Rules grouped in learning order for the Learn screen. */
export function ruleGroups(): { group: string; rules: RuleInfo[] }[] {
  const groups: { group: string; rules: RuleInfo[] }[] = [];
  for (const rule of RULES) {
    const existing = groups.find((g) => g.group === rule.group);
    if (existing) existing.rules.push(rule);
    else groups.push({ group: rule.group, rules: [rule] });
  }
  return groups;
}
