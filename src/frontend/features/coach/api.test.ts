import { describe, it, expect } from 'vitest';
import { parseMention } from './api';

describe('parseMention', () => {
  it('resolves @todo / @progress / @done to the enum', () => {
    expect(parseMention('why are my @todo tasks stuck?')).toBe('todo');
    expect(parseMention('move @progress along')).toBe('progress');
    expect(parseMention('everything @done')).toBe('done');
  });

  it('is case-insensitive', () => {
    expect(parseMention('check @TODO')).toBe('todo');
  });

  it('returns undefined when there is no valid mention', () => {
    expect(parseMention('just a normal question')).toBeUndefined();
    expect(parseMention('@unknown column')).toBeUndefined();
  });
});
