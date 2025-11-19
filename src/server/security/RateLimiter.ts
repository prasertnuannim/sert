export class RateLimiter {
  private store: Record<string, number[]> = {};

  constructor(
    private limit: number,
    private windowSec: number
  ) {}

  async check(key: string) {
    const now = Date.now();

    // สร้าง key ใหม่ถ้ายังไม่มี
    if (!this.store[key]) this.store[key] = [];

    // เก็บเฉพาะ timestamp ที่ยังอยู่ใน window
    this.store[key] = this.store[key].filter(
      (t) => now - t < this.windowSec * 1000
    );

    // ถ้า request เกิน limit → block
    if (this.store[key].length >= this.limit) {
      throw new Error("Too many requests");
    }

    // บันทึก request ใหม่
    this.store[key].push(now);
  }
}
