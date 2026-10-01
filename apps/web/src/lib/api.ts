// 前端 API 封装（调用 Vite 中间件 / Express 代理）
export async function fetchBase<T = unknown>(): Promise<T> {
  const r = await fetch('/api/base');
  if (!r.ok) throw new Error(`base ${r.status}`);
  return r.json() as Promise<T>;
}

export async function fetchQuote<T = unknown>(): Promise<T> {
  const r = await fetch('/api/quote');
  if (!r.ok) throw new Error(`quote ${r.status}`);
  return r.json() as Promise<T>;
}

export async function fetchIndices<T = unknown>(): Promise<T> {
  const r = await fetch('/api/indices');
  if (!r.ok) throw new Error(`indices ${r.status}`);
  return r.json() as Promise<T>;
}
