export const RANK_LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUIT_LABELS = ['♣', '♦', '♥', '♠'];

export const TEN = 8;
export const JACK = 9;
export const ACE = 12;

export function makeCard(rank, suit) {
  return rank * 4 + suit;
}

export function rankOf(card) {
  return Math.floor(card / 4);
}

export function suitOf(card) {
  return card % 4;
}

export function fullDeck() {
  const deck = [];
  for (let card = 0; card < 52; card++) {
    deck.push(card);
  }
  return deck;
}

export function cardLabel(card) {
  return RANK_LABELS[rankOf(card)] + SUIT_LABELS[suitOf(card)];
}

const RANK_CODES = {
  2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
  T: 8, J: 9, Q: 10, K: 11, A: 12,
};
const SUIT_CODES = { c: 0, d: 1, h: 2, s: 3 };

export function parseCard(code) {
  const rank = RANK_CODES[code.slice(0, -1)];
  const suit = SUIT_CODES[code.slice(-1)];
  if (rank === undefined || suit === undefined) {
    throw new Error(`bad card code: ${code}`);
  }
  return makeCard(rank, suit);
}

export function parseHand(codes) {
  return codes.trim().split(/\s+/).map(parseCard);
}
