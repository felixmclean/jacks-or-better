import { RANK_LABELS, SUIT_LABELS, makeCard, rankOf, suitOf } from './cards.js';
import { findBestHold } from './solver.js';

const RANK_NAMES = [
  'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'jack', 'queen', 'king', 'ace',
];
const SUIT_NAMES = ['clubs', 'diamonds', 'hearts', 'spades'];
const RED_SUITS = [1, 2];
const GRID_SUIT_ORDER = [2, 1, 3, 0];

const handElement = document.getElementById('hand');
const resultElement = document.getElementById('result');
const gridElement = document.getElementById('grid');
const resetButton = document.getElementById('reset');

const gridButtons = new Map();

let hand = [];
let bestHold = null;
let calculating = false;

buildGrid();
resetButton.addEventListener('click', reset);
render();

function buildGrid() {
  for (const suit of GRID_SUIT_ORDER) {
    for (let rank = 0; rank < RANK_LABELS.length; rank++) {
      const card = makeCard(rank, suit);
      const button = cardElement(card);
      button.addEventListener('click', () => selectCard(card));
      gridButtons.set(card, button);
      gridElement.append(button);
    }
  }
}

function selectCard(card) {
  if (hand.length >= 5 || hand.includes(card)) return;
  hand.push(card);
  if (hand.length === 5) startCalculation();
  render();
}

function removeCard(index) {
  hand.splice(index, 1);
  bestHold = null;
  calculating = false;
  render();
}

function reset() {
  hand = [];
  bestHold = null;
  calculating = false;
  render();
}

function startCalculation() {
  calculating = true;
  afterNextPaint(() => {
    if (!calculating || hand.length !== 5) return;
    bestHold = findBestHold(hand);
    calculating = false;
    render();
  });
}

function render() {
  renderHand();
  renderResult();
  for (const [card, button] of gridButtons) {
    button.disabled = hand.includes(card) || hand.length === 5;
  }
  resetButton.disabled = hand.length === 0;
}

function renderHand() {
  handElement.replaceChildren();
  for (let i = 0; i < 5; i++) {
    handElement.append(i < hand.length ? handCardElement(hand[i], i) : emptySlotElement());
  }
}

function handCardElement(card, index) {
  const button = cardElement(card);
  button.classList.add('hand-card');
  button.setAttribute('aria-label', `remove ${cardName(card)}`);
  button.title = 'Click to remove';
  if (bestHold) {
    if (bestHold.held.includes(card)) {
      button.classList.add('held');
      const chip = document.createElement('span');
      chip.className = 'hold-chip';
      chip.textContent = 'HOLD';
      button.append(chip);
    } else {
      button.classList.add('discarded');
    }
  }
  button.addEventListener('click', () => removeCard(index));
  return button;
}

function emptySlotElement() {
  const slot = document.createElement('div');
  slot.className = 'card-slot';
  return slot;
}

function renderResult() {
  if (calculating) {
    resultElement.textContent = 'Calculating…';
    return;
  }
  if (!bestHold) {
    const remaining = 5 - hand.length;
    resultElement.textContent = remaining === 5
      ? 'Select 5 cards'
      : `Select ${remaining} more ${remaining === 1 ? 'card' : 'cards'}`;
    return;
  }

  const value = document.createElement('div');
  value.className = 'result-ev-value';
  value.textContent = `${bestHold.ev.toFixed(2)} EV`;

  const caption = document.createElement('div');
  caption.className = 'result-ev-caption';
  caption.textContent = 'average credits returned per credit bet';

  if (bestHold.held.length === 0) {
    const note = document.createElement('div');
    note.className = 'result-note';
    note.textContent = 'Discard all 5 cards';
    resultElement.replaceChildren(note, value, caption);
  } else {
    resultElement.replaceChildren(value, caption);
  }
}

function cardElement(card) {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('card', RED_SUITS.includes(suitOf(card)) ? 'red' : 'black');
  button.setAttribute('aria-label', cardName(card));

  const rank = document.createElement('span');
  rank.className = 'card-rank';
  rank.textContent = RANK_LABELS[rankOf(card)];

  const suit = document.createElement('span');
  suit.className = `card-suit card-suit-${SUIT_NAMES[suitOf(card)]}`;
  suit.textContent = SUIT_LABELS[suitOf(card)];

  button.append(rank, suit);
  return button;
}

function cardName(card) {
  return `${RANK_NAMES[rankOf(card)]} of ${SUIT_NAMES[suitOf(card)]}`;
}

// let the browser paint the fifth card and the calculating notice before
// the solver blocks the main thread for a few hundred milliseconds
function afterNextPaint(callback) {
  requestAnimationFrame(() => setTimeout(callback, 0));
}
