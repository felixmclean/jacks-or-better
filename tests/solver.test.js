import { parseHand } from '../src/cards.js';
import { findBestHold, holdExpectedValue, unseenCards } from '../src/solver.js';

export function runSolverTests() {
  const results = [];
  const check = (code, pass) => results.push({ hand: code, pass });

  {
    // hand-checked EV for holding T J Q K of hearts out of Th Jh Qh Kh 2d,
    // over the 47 unseen cards: Ah completes the royal (800), 9h a straight
    // flush (50), the other 7 hearts a flush (7 * 6), the 3 off-suit aces and
    // 3 off-suit nines a straight (6 * 4), the 9 jacks/queens/kings a high
    // pair (9 * 1), and the 3 tens only a low pair (0), totalling 925
    const code = 'Th Jh Qh Kh 2d';
    const hand = parseHand(code);
    const ev = holdExpectedValue(hand.slice(0, 4), unseenCards(hand));
    check(code, ev === 925 / 47);
  }

  {
    // the classic strategy case: break a pat flush to draw at the royal,
    // EV 919/47 ≈ 19.55 beats the flush's certain 6
    const code = 'Th Jh Qh Kh 8h';
    const hand = parseHand(code);
    const best = findBestHold(hand);
    check(code, sameCards(best.held, hand.slice(0, 4)) && best.ev === 919 / 47);
  }

  {
    const code = '2c 2d 5h 9s Kd';
    const hand = parseHand(code);
    const best = findBestHold(hand);
    check(code, sameCards(best.held, hand.slice(0, 2)));
  }

  {
    const code = '3c 5d 7h 9s Jd';
    const hand = parseHand(code);
    const best = findBestHold(hand);
    check(code, sameCards(best.held, [hand[4]]));
  }

  {
    const code = 'Ts Js Qs Ks As';
    const hand = parseHand(code);
    const best = findBestHold(hand);
    check(code, best.held.length === 5 && best.ev === 800);
  }

  {
    // discarding the kicker cannot change the payout, so both holds have
    // EV 25 exactly and the tie should go to keeping all five
    const code = '7c 7d 7h 7s Kd';
    const hand = parseHand(code);
    const best = findBestHold(hand);
    check(code, best.held.length === 5 && best.ev === 25);
  }

  {
    const code = '2c 7d 9h Js Kd';
    findBestHold(parseHand(code));
    check(code, true);
  }

  return results;
}

function sameCards(actual, expected) {
  const a = [...actual].sort((x, y) => x - y);
  const b = [...expected].sort((x, y) => x - y);
  return a.length === b.length && a.every((card, i) => card === b[i]);
}
