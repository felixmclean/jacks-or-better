import { parseHand } from '../src/cards.js';
import { classifyHand, payout } from '../src/evaluator.js';

const CASES = [
  ['royal flush', 'Th Jh Qh Kh Ah', 'Royal Flush', 800],
  ['straight flush', '5s 6s 7s 8s 9s', 'Straight Flush', 50],
  ['ace-low straight flush is not royal', 'Ad 2d 3d 4d 5d', 'Straight Flush', 50],
  ['four of a kind', '7c 7d 7h 7s Kd', 'Four of a Kind', 25],
  ['full house', 'Qc Qd Qh 9s 9d', 'Full House', 9],
  ['flush', '2h 5h 9h Jh Kh', 'Flush', 6],
  ['straight', '5c 6d 7h 8s 9c', 'Straight', 4],
  ['ace-high straight', 'Tc Jd Qh Ks Ac', 'Straight', 4],
  ['ace-low straight', 'Ac 2d 3h 4s 5c', 'Straight', 4],
  ['three of a kind', '4c 4d 4h 9s Kd', 'Three of a Kind', 3],
  ['two pair', '8c 8d 3h 3s Kd', 'Two Pair', 2],
  ['two pair with jacks still pays two pair', 'Jc Jd 3h 3s Kd', 'Two Pair', 2],
  ['pair of jacks', 'Jc Jd 4h 8s 2d', 'Jacks or Better', 1],
  ['pair of aces', 'Ac Ad 4h 8s 2d', 'Jacks or Better', 1],
  ['pair of tens pays nothing', 'Tc Td 4h 8s 2d', 'Nothing', 0],
  ['ace high pays nothing', 'Ac Kd 9h 5s 2c', 'Nothing', 0],
  ['straights do not wrap around the ace', 'Jc Qd Kh As 2c', 'Nothing', 0],
];

export function runEvaluatorTests() {
  return CASES.map(([label, codes, expectedCategory, expectedPayout]) => {
    const hand = parseHand(codes);
    const category = classifyHand(hand);
    const pay = payout(hand);
    const pass = category === expectedCategory && pay === expectedPayout;
    return {
      label: `${label} (${codes})`,
      pass,
      detail: pass
        ? `${category}, pays ${pay}`
        : `got ${category} paying ${pay}, expected ${expectedCategory} paying ${expectedPayout}`,
    };
  });
}
