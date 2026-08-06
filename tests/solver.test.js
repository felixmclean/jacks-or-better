import { cardLabel, parseHand } from '../src/cards.js';
import { findBestHold, holdExpectedValue, unseenCards } from '../src/solver.js';

export function runSolverTests() {
  const results = [];
  const check = (label, pass, detail) => results.push({ label, pass, detail });

  {
    // hand-checked EV for holding T J Q K of hearts out of Th Jh Qh Kh 2d,
    // over the 47 unseen cards: Ah completes the royal (800), 9h a straight
    // flush (50), the other 7 hearts a flush (7 * 6), the 3 off-suit aces and
    // 3 off-suit nines a straight (6 * 4), the 9 jacks/queens/kings a high
    // pair (9 * 1), and the 3 tens only a low pair (0), totalling 925
    const hand = parseHand('Th Jh Qh Kh 2d');
    const ev = holdExpectedValue(hand.slice(0, 4), unseenCards(hand));
    check(
      'EV of four to the royal matches hand-computed 925/47',
      ev === 925 / 47,
      `got ${ev}, expected ${925 / 47}`,
    );
  }

  {
    // the classic strategy case: break a pat flush to draw at the royal,
    // EV 919/47 ≈ 19.55 beats the flush's certain 6
    const hand = parseHand('Th Jh Qh Kh 8h');
    const best = findBestHold(hand);
    check(
      'breaks a pat flush to chase the royal',
      sameCards(best.held, hand.slice(0, 4)) && best.ev === 919 / 47,
      `held ${describeHold(best)}`,
    );
  }

  {
    const hand = parseHand('2c 2d 5h 9s Kd');
    const best = findBestHold(hand);
    check(
      'keeps a low pair over a single high card',
      sameCards(best.held, hand.slice(0, 2)),
      `held ${describeHold(best)}`,
    );
  }

  {
    const hand = parseHand('3c 5d 7h 9s Jd');
    const best = findBestHold(hand);
    check(
      'keeps a lone jack over drawing five new cards',
      sameCards(best.held, [hand[4]]),
      `held ${describeHold(best)}`,
    );
  }

  {
    const hand = parseHand('Ts Js Qs Ks As');
    const best = findBestHold(hand);
    check(
      'stands pat on a royal flush',
      best.held.length === 5 && best.ev === 800,
      `held ${describeHold(best)}`,
    );
  }

  {
    // discarding the kicker cannot change the payout, so both holds have
    // EV 25 exactly and the tie should go to keeping all five
    const hand = parseHand('7c 7d 7h 7s Kd');
    const best = findBestHold(hand);
    check(
      'stands pat on four of a kind instead of tossing the kicker',
      best.held.length === 5 && best.ev === 25,
      `held ${describeHold(best)}`,
    );
  }

  {
    const start = performance.now();
    findBestHold(parseHand('2c 7d 9h Js Kd'));
    const elapsed = performance.now() - start;
    check('timing (informational)', true, `full 32-hold solve in ${elapsed.toFixed(0)} ms`);
  }

  return results;
}

function sameCards(actual, expected) {
  const a = [...actual].sort((x, y) => x - y);
  const b = [...expected].sort((x, y) => x - y);
  return a.length === b.length && a.every((card, i) => card === b[i]);
}

function describeHold(best) {
  const cards = best.held.map(cardLabel).join(' ') || 'nothing';
  return `${cards} with EV ${best.ev}`;
}
