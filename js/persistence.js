import { SAVE_KEY } from "./data/config.js";

export function defaultState() {
  return {
    dna: 0,
    totalDNA: 0,
    taps: 0,
    choices: 0,
    nextMilestone: 50,
    parts: {},
    shop: {},
    boostUntil: 0,
    boostType: null
  };
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    return Object.assign(defaultState(), saved || {}, {
      parts: saved?.parts || {},
      shop: saved?.shop || {}
    });
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}
