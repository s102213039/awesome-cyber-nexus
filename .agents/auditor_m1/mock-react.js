let currentStates = [];
let currentStateIdx = 0;
let currentRefs = [];
let currentRefIdx = 0;
let currentEffects = [];
let lastProviderValue = null;

export function useState(initial) {
  const idx = currentStateIdx++;
  if (currentStates[idx] === undefined) {
    currentStates[idx] = [
      initial,
      (newVal) => {
        currentStates[idx][0] = newVal;
      }
    ];
  }
  return currentStates[idx];
}

export function useRef(initial) {
  const idx = currentRefIdx++;
  if (currentRefs[idx] === undefined) {
    currentRefs[idx] = { current: initial };
  }
  return currentRefs[idx];
}

export function useEffect(cb, deps) {
  currentEffects.push(cb);
}

export function createContext(val) {
  return {
    Provider: (props) => {
      lastProviderValue = props.value;
      return props.children;
    }
  };
}

export function resetMock() {
  currentStates = [];
  currentStateIdx = 0;
  currentRefs = [];
  currentRefIdx = 0;
  currentEffects = [];
  lastProviderValue = null;
}

export function getEffects() {
  return currentEffects;
}

export function getStates() {
  return currentStates;
}

export function getRefs() {
  return currentRefs;
}

export function getProviderValue() {
  return lastProviderValue;
}

const React = {
  useState,
  useEffect,
  useRef,
  createContext
};

export default React;
