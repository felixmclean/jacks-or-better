import { fullDeck } from './cards.js';
import { payout } from './evaluator.js';

export function findBestHold(hand) {
  const deck = unseenCards(hand);
  let best = null;

  for (let mask = 0; mask < 32; mask++) {
    const held = heldCards(hand, mask);
    const ev = holdExpectedValue(held, deck);
    // ties go to the hold with more cards, so a pat four of a kind keeps its kicker
    if (best === null || ev > best.ev || (ev === best.ev && held.length > best.held.length)) {
      best = { held, ev };
    }
  }
  return best;
}

export function holdExpectedValue(held, deck) {
  const hand = new Array(5);
  for (let i = 0; i < held.length; i++) {
    hand[i] = held[i];
  }

  let totalPayout = 0;
  let drawCount = 0;

  function fillRemainingSlots(slot, deckStart) {
    if (slot === 5) {
      totalPayout += payout(hand);
      drawCount += 1;
      return;
    }
    for (let i = deckStart; i < deck.length; i++) {
      hand[slot] = deck[i];
      fillRemainingSlots(slot + 1, i + 1);
    }
  }

  fillRemainingSlots(held.length, 0);
  return totalPayout / drawCount;
}

export function unseenCards(hand) {
  return fullDeck().filter((card) => !hand.includes(card));
}

function heldCards(hand, mask) {
  const held = [];
  for (let i = 0; i < 5; i++) {
    if (mask & (1 << i)) {
      held.push(hand[i]);
    }
  }
  return held;
}
