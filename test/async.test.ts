import { describe, it, expect } from "vitest";
import {
  sleep, retry, timeout, TimeoutError, pMap, pSettle, Semaphore, Mutex, Deferred,
  CircuitBreaker, CircuitOpenError, Bulkhead, BulkheadFullError, CountDownLatch, Channel, debounceAsync,
} from "../src/index";

describe("async utils", () => {
  it("sleep/retry/timeout", async () => {
    await sleep(1);
    let n = 0;
    expect(await retry(async () => { n++; if (n < 3) throw new Error(); return "ok"; }, { retries: 5, delayMs: 1 })).toBe("ok");
    await expect(timeout(sleep(50).then(() => 1), 5)).rejects.toBeInstanceOf(TimeoutError);
  });
  it("pMap ordered + pSettle", async () => {
    expect(await pMap([1, 2, 3], async (x) => x * 2, { concurrency: 2 })).toEqual([2, 4, 6]);
    const s = await pSettle([() => 1, () => { throw new Error(); }]);
    expect([s[0].status, s[1].status]).toEqual(["fulfilled", "rejected"]);
  });
  it("semaphore/mutex/deferred", async () => {
    const sem = new Semaphore(2); expect(sem.availablePermits).toBe(2);
    const m = new Mutex(); expect(await m.runExclusive(() => 5)).toBe(5);
    const d = new Deferred<number>(); setTimeout(() => d.resolve(9), 1);
    expect(await d.promise).toBe(9);
  });
});

describe("resilience", () => {
  it("circuit breaker opens", async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 10000 });
    for (let i = 0; i < 2; i++) { try { await cb.execute(async () => { throw new Error(); }); } catch { /* ignore */ } }
    expect(cb.state).toBe("open");
    await expect(cb.execute(async () => 1)).rejects.toBeInstanceOf(CircuitOpenError);
  });
  it("bulkhead rejects when full", async () => {
    const bh = new Bulkhead({ maxConcurrent: 1, maxQueue: 0 });
    const p = bh.execute(() => sleep(20));
    await expect(bh.execute(async () => 1)).rejects.toBeInstanceOf(BulkheadFullError);
    await p;
  });
  it("latch & channel & debounceAsync", async () => {
    const latch = new CountDownLatch(2);
    let done = false; latch.wait().then(() => { done = true; });
    latch.countDown(); latch.countDown(); await sleep(0);
    expect(done).toBe(true);
    const ch = new Channel<number>(); await ch.send(1); ch.close();
    expect((await ch.receive()).value).toBe(1);
    let calls = 0; const fn = debounceAsync(async (x: number) => { calls++; return x; }, 5);
    const [a, b] = await Promise.all([fn(1), fn(2)]);
    expect([calls, a, b]).toEqual([1, 2, 2]);
  });
});
