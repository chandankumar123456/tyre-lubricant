import { describe, expect, it } from 'vitest';
import { FrameBudgetMonitor } from './QualityController';

describe('sustained quality fallback', () => {
  it('retains normal quality at a steady fast frame rate', () => {
    const budget = new FrameBudgetMonitor();
    for (let i = 0; i < 600; i++) expect(budget.observe(1 / 60)).toBe(false);
  });
  it('detects sustained slowdown after an initially healthy startup', () => {
    const budget = new FrameBudgetMonitor();
    for (let i = 0; i < 240; i++) budget.observe(1 / 60);
    const decisions = Array.from({ length: 100 }, () => budget.observe(.07));
    expect(decisions.some(Boolean)).toBe(true);
  });
  it('ignores an isolated long pause followed by normal frames', () => {
    const budget = new FrameBudgetMonitor();
    expect(budget.observe(2)).toBe(false);
    for (let i = 0; i < 300; i++) expect(budget.observe(1 / 60)).toBe(false);
  });
});
