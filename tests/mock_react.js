import { createContext } from 'react';

let mockState = null;
let mockStateSetter = null;
let mockEffects = [];
let mockRefs = [];
let refIndex = 0;

export function resetMockReact() {
  mockState = null;
  mockStateSetter = null;
  mockEffects = [];
  mockRefs = [];
  refIndex = 0;
}

export function useState(initialValue) {
  if (mockState === null) {
    mockState = initialValue;
  }
  mockStateSetter = (newValue) => {
    mockState = newValue;
  };
  return [mockState, mockStateSetter];
}

export function getMockState() {
  return mockState;
}

export function setMockState(val) {
  mockState = val;
}

export function useEffect(callback, deps) {
  mockEffects.push({ callback, deps });
}

export function getMockEffects() {
  return mockEffects;
}

export function useRef(initialValue) {
  if (mockRefs[refIndex] === undefined) {
    mockRefs[refIndex] = { current: initialValue };
  }
  const ref = mockRefs[refIndex];
  refIndex++;
  return ref;
}

export function getMockRefs() {
  return mockRefs;
}

const React = {
  useState,
  useEffect,
  useRef,
  createContext
};

export default React;
export { createContext };
