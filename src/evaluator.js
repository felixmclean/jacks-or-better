import { rankOf, suitOf, TEN, JACK, ACE } from './cards.js';

export const PAY_TABLE = {
  'Royal Flush': 800,
  'Straight Flush': 50,
  'Four of a Kind': 25,
  'Full House': 9,
  'Flush': 6,
  'Straight': 4,
  'Three of a Kind': 3,
  'Two Pair': 2,
  'Jacks or Better': 1,
  'Nothing': 0,
};

export function payout(hand) {
  return PAY_TABLE[classifyHand(hand)];
}

export function classifyHand(hand) {
  const counts = rankCounts(hand);
  const flush = isFlush(hand);
  const straight = isStraight(counts);

  if (flush && straight) {
    // the only straight containing both a ten and an ace is T-J-Q-K-A
    const royal = counts[TEN] === 1 && counts[ACE] === 1;
    return royal ? 'Royal Flush' : 'Straight Flush';
  }

  const { pairCount, hasTrips, hasQuads, hasHighPair } = groupSummary(counts);

  if (hasQuads) return 'Four of a Kind';
  if (hasTrips && pairCount === 1) return 'Full House';
  if (flush) return 'Flush';
  if (straight) return 'Straight';
  if (hasTrips) return 'Three of a Kind';
  if (pairCount === 2) return 'Two Pair';
  if (pairCount === 1 && hasHighPair) return 'Jacks or Better';
  return 'Nothing';
}

function rankCounts(hand) {
  const counts = new Array(13).fill(0);
  for (let i = 0; i < hand.length; i++) {
    counts[rankOf(hand[i])] += 1;
  }
  return counts;
}

function isFlush(hand) {
  const suit = suitOf(hand[0]);
  for (let i = 1; i < hand.length; i++) {
    if (suitOf(hand[i]) !== suit) return false;
  }
  return true;
}

function isStraight(counts) {
  let lowest = -1;
  let highest = -1;
  for (let rank = 0; rank < 13; rank++) {
    if (counts[rank] === 0) continue;
    if (counts[rank] > 1) return false;
    if (lowest === -1) lowest = rank;
    highest = rank;
  }
  // five distinct ranks spanning exactly four steps must be consecutive
  if (highest - lowest === 4) return true;
  // the ace also plays low: A-2-3-4-5 (rank indices 12, 0, 1, 2, 3)
  return counts[ACE] === 1 && counts[0] === 1 && counts[1] === 1 && counts[2] === 1 && counts[3] === 1;
}

function groupSummary(counts) {
  let pairCount = 0;
  let hasTrips = false;
  let hasQuads = false;
  let hasHighPair = false;
  for (let rank = 0; rank < 13; rank++) {
    if (counts[rank] === 2) {
      pairCount += 1;
      if (rank >= JACK) hasHighPair = true;
    } else if (counts[rank] === 3) {
      hasTrips = true;
    } else if (counts[rank] === 4) {
      hasQuads = true;
    }
  }
  return { pairCount, hasTrips, hasQuads, hasHighPair };
}
