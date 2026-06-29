import { describe, it, expect } from "vitest";
import { HttpClient, HttpError, FetchAdapter, type HttpAdapter } from "../src/index";

const mockAdapter: HttpAdapter = {
  async request(config) {
    const is404 = config.url.includes("/404");
    return { data: { method: config.method ?? "GET", body: config.body }, status: is404 ? 404 : 200, statusText: "OK", headers: {}, ok: !is404, config };
  },
};

describe("http", () => {
  it("get/post + interceptor (Adapter pattern)", async () => {
    const api = new HttpClient({ baseURL: "https://x", adapter: mockAdapter });
    let ran = false;
    api.useRequestInterceptor((c) => { ran = true; return c; });
    const res = await api.get<{ method: string }>("/u");
    expect(res.data.method).toBe("GET");
    expect(ran).toBe(true);
    const post = await api.post<{ body: { name: string } }>("/u", { name: "Ana" });
    expect(post.data.body.name).toBe("Ana");
  });
  it("throws HttpError on non-ok", async () => {
    const api = new HttpClient({ adapter: mockAdapter });
    await expect(api.get("/404")).rejects.toBeInstanceOf(HttpError);
  });
  it("FetchAdapter with injected fetch", async () => {
    let lastUrl = "";
    const fakeFetch = (async (url: any) => { lastUrl = String(url); return new Response(JSON.stringify({ ok: 1 }), { status: 200, headers: { "Content-Type": "application/json" } }); }) as typeof fetch;
    const adapter = new FetchAdapter(fakeFetch);
    const r = await adapter.request<{ ok: number }>({ url: "https://x/i", query: { a: 1 } });
    expect(r.data.ok).toBe(1);
    expect(lastUrl).toContain("a=1");
  });
});
