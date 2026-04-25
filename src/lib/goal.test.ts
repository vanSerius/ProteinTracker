import { describe, it, expect } from 'vitest';
import { calculateGoal, lbToKg, kgToLb, multiplier } from './goal';

describe('multiplier', () => {
  it('returns build_muscle multipliers', () => {
    expect(multiplier('very_active', 'build_muscle')).toBe(2.2);
    expect(multiplier('active', 'build_muscle')).toBe(2.0);
    expect(multiplier('light', 'build_muscle')).toBe(1.8);
    expect(multiplier('sedentary', 'build_muscle')).toBe(1.6);
  });

  it('returns lose_fat multipliers (high to preserve muscle)', () => {
    expect(multiplier('very_active', 'lose_fat')).toBe(2.0);
    expect(multiplier('active', 'lose_fat')).toBe(1.8);
    expect(multiplier('light', 'lose_fat')).toBe(1.6);
    expect(multiplier('sedentary', 'lose_fat')).toBe(1.4);
  });

  it('returns maintain multipliers', () => {
    expect(multiplier('very_active', 'maintain')).toBe(1.8);
    expect(multiplier('active', 'maintain')).toBe(1.6);
    expect(multiplier('light', 'maintain')).toBe(1.2);
    expect(multiplier('sedentary', 'maintain')).toBe(0.8);
  });
});

describe('calculateGoal', () => {
  it('rounds to nearest 5g', () => {
    expect(calculateGoal(60, 'active', 'build_muscle')).toBe(120);
    expect(calculateGoal(70, 'active', 'maintain')).toBe(110);
    expect(calculateGoal(55, 'active', 'build_muscle')).toBe(110);
  });

  it('handles a typical female athlete profile', () => {
    expect(calculateGoal(60, 'active', 'build_muscle')).toBe(120);
  });
});

describe('weight conversion', () => {
  it('round-trips kg<->lb', () => {
    expect(Math.round(lbToKg(154))).toBe(70);
    expect(Math.round(kgToLb(70))).toBe(154);
  });
});
