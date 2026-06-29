import { describe, it, expect } from "vitest";
import { EventEmitter, StateMachine, CommandManager, Signal, computed, ObjectPool, Builder, Mediator, singleton } from "../src/index";

describe("patterns", () => {
  it("event emitter & pubsub-like", () => {
    const ee = new EventEmitter<{ x: number }>();
    let got = 0; const off = ee.on("x", (v) => { got = v; });
    ee.emit("x", 9); expect(got).toBe(9);
    off(); ee.emit("x", 1); expect(got).toBe(9);
  });
  it("fsm & command", () => {
    const sm = new StateMachine({ initial: "idle", transitions: { idle: { go: "run" }, run: { stop: "idle" } } });
    expect(sm.send("go")).toBe(true); expect(sm.state).toBe("run");
    let v = 0; const cm = new CommandManager();
    cm.execute({ execute: () => { v++; }, undo: () => { v--; } });
    cm.undo(); expect(v).toBe(0); cm.redo(); expect(v).toBe(1);
  });
  it("signal/objectpool/builder/mediator/singleton", () => {
    const s = new Signal(1); const c = computed(() => s.value * 2, [s]); s.set(5);
    expect([s.value, c.value]).toEqual([5, 10]);
    let created = 0; const pool = new ObjectPool(() => ({ id: ++created }), { initialSize: 0 });
    const a = pool.acquire(); pool.release(a); expect(pool.acquire()).toBe(a);
    expect(new Builder<{ a: number }>().set("a", 1).build().a).toBe(1);
    const med = new Mediator(); med.register("sum", (p: any) => p.a + p.b);
    expect(med.send("sum", { a: 2, b: 3 })).toBe(5);
    let n = 0; const get = singleton(() => ({ id: ++n })); expect(get()).toBe(get());
  });
});
