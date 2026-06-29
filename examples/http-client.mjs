// HTTP client (Adapter). Run: npm run build && node examples/http-client.mjs  (Node 18+, network)
import { HttpClient } from "../dist/index.js";

const api = new HttpClient({ baseURL: "https://jsonplaceholder.typicode.com", timeout: 5000 });
api.useRequestInterceptor((config) => {
  config.headers = { ...config.headers, "X-Demo": "craft-kit" };
  return config;
});

const { data, status } = await api.get("/todos/1");
console.log(status, data);
