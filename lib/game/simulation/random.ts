// Seeded Deterministic Pseudo-Random Number Generator (xorshift128+)

export class SeededRNG {
  private s0: number;
  private s1: number;

  constructor(seed: number = 19470815) {
    this.s0 = (seed >>> 0) || 123456789;
    this.s1 = (seed ^ 0x49616e42) >>> 0 || 987654321;
  }

  // Next 32-bit float [0, 1)
  next(): number {
    let s1 = this.s0;
    const s0 = this.s1;
    this.s0 = s0;
    s1 ^= s1 << 23;
    this.s1 = (s1 ^ s0 ^ (s1 >>> 17) ^ (s0 >>> 26)) >>> 0;
    return (this.s1 >>> 0) / 4294967296;
  }

  // Integer in range [min, max] inclusive
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // True with probability p in [0, 1]
  chance(p: number): number | boolean {
    return this.next() < p;
  }

  // Pick random element from array
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  // Export current seed state
  getState(): { s0: number; s1: number } {
    return { s0: this.s0, s1: this.s1 };
  }

  // Restore seed state
  setState(state: { s0: number; s1: number }) {
    this.s0 = state.s0;
    this.s1 = state.s1;
  }
}
