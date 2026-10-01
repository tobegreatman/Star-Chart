// 东财大盘星图数据代理获取（生产端，与 web/src/lib/eastmoney.ts 同逻辑）
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
const REFERER = 'https://quote.eastmoney.com/stockhotmap/';
const BASE_URL =
  'https://quote.eastmoney.com/stockhotmap/api/getquotebasedata?hash=';
const QUOTE_URL =
  'https://quote.eastmoney.com/stockhotmap/api/getquotedata?quotedata_hash=';

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
