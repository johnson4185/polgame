import { describe, it, expect } from 'vitest';
import { INDIA_STATES } from './indiaMap';
import { INITIAL_STATES } from './statesAndConstituencies';

describe('India map data', () => {
  it('has a shape for every state/UT in the game, with matching names', () => {
    const mapNames = INDIA_STATES.map(s => s.name).sort();
    const gameNames = INITIAL_STATES.map(s => s.name).sort();
    expect(mapNames).toEqual(gameNames);
    for (const s of INDIA_STATES) expect(s.d.startsWith('M')).toBe(true);
  });
});
