// 东财大盘星图数据代理获取（服务端运行，规避 CORS 与浏览器 UA 限制）
// 官方公开 API：与 https://quote.eastmoney.com/stockhotmap/ 同源同接口

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
const REFERER = 'https://quote.eastmoney.com/stockhotmap/';
const BASE_URL =
  'https://quote.eastmoney.com/stockhotmap/api/getquotebasedata?hash=';
const QUOTE_URL =
  'https://quote.eastmoney.com/stockhotmap/api/getquotedata?quotedata_hash=';
const INDEX_URL =
  'https://push2.eastmoney.com/api/qt/ulist/get?fltt=1&invt=2&fields=f1,f2,f3,f4,f12,f13,f14,f152&secids=1.000001,0.399001,0.399006,1.000680,0.899050&ut=8dec03ba335b81bf4ebdf7b29ec27d15&pn=1&np=1&dect=1&pz=20';

export type EastMoneyPayload = {
  base?: unknown;
  quote?: unknown;
};

// 简易内存缓存：base 静态数据 30 分钟，quote 行情 8 秒
let baseCache: { ts: number; data: unknown } | null = null;
let quoteCache: { ts: number; data: unknown } | null = null;
const BASE_TTL = 30 * 60 * 1000;
const QUOTE_TTL = 8 * 1000;

async function getJSON(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: REFERER },
  });
  if (!res.ok) throw new Error(`upstream ${res.status}: ${url}`);
  return res.json();
}

export async function fetchEastMoney(kind: 'base' | 'quote'): Promise<unknown> {
  if (kind === 'base') {
    if (baseCache && Date.now() - baseCache.ts < BASE_TTL) return baseCache.data;
    const data = await getJSON(BASE_URL);
    baseCache = { ts: Date.now(), data };
    return data;
  }
  if (quoteCache && Date.now() - quoteCache.ts < QUOTE_TTL) return quoteCache.data;
  const data = await getJSON(QUOTE_URL);
  quoteCache = { ts: Date.now(), data };
  return data;
}

export async function fetchIndices(): Promise<unknown> {
  return getJSON(INDEX_URL);
}
