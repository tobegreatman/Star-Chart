// 东财原始字符串解析为结构化数据
import type { BaseData, Sector, Stock } from './types';

type RawBase = {
  re?: boolean;
  baseinfo?: string[];
  bk1?: string[];
  bk2?: string[];
  bk3?: string[];
};

type RawQuote = {
  data?: string[];
  quotetime?: number;
};

/** "-" 或空值 → null，否则数字 */
function num(v: string | undefined): number | null {
  if (v == null || v === '' || v === '-') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** 解析板块列表：name|market|code */
function parseSectors(arr: string[] | undefined): Sector[] {
  if (!arr) return [];
  return arr.map((s) => {
    const [name, market, code] = s.split('|');
    return { name: name ?? '', market: market ?? '', code: code ?? '' };
  });
}

/** 解析基础数据：hy1|hy2|hy3|name|market|code|labels */
export function parseBase(raw: RawBase): BaseData {
  const stocks: Stock[] = (raw.baseinfo ?? []).map((line) => {
    const p = line.split('|');
    return {
      bk1: Number(p[0]) || 0,
      bk2: Number(p[1]) || 0,
      bk3: Number(p[2]) || 0,
      name: p[3] ?? '',
      market: Number(p[4]) || 0,
      code: p[5] ?? '',
      labels: p[6] ?? '',
      zde: 0,
      zdf: 0,
      zdf3: 0,
      zdf5: 0,
      zdf10: 0,
      zdf20: 0,
      zdf60: 0,
      zdfnc: 0,
      cje: 0,
      hsl: null,
      zxj: null,
      ltsz: 0,
      zsz: 0,
      lb: 0,
      zljzb: null,
    };
  });
  return {
    stocks,
    bk1: parseSectors(raw.bk1),
    bk2: parseSectors(raw.bk2),
    bk3: parseSectors(raw.bk3),
  };
}

/** 解析行情数据，返回 market|code → 行情字段 的映射 */
export function parseQuote(raw: RawQuote): {
  quotetime: number;
  map: Map<string, string[]>;
} {
  const map = new Map<string, string[]>();
  for (const line of raw.data ?? []) {
    const p = line.split('|');
    map.set(`${p[0]}|${p[1]}`, p);
  }
  return { quotetime: raw.quotetime ?? 0, map };
}

/** 将行情合并到股票列表（原地填充） */
export function mergeQuote(stocks: Stock[], map: Map<string, string[]>): void {
  for (const s of stocks) {
    const p = map.get(`${s.market}|${s.code}`);
    if (!p) continue;
    // market[0] code[1] zde[2] zdf[3] zdf_3[4] zdf_5[5] zdf_10[6] zdf_20[7]
    // zdf_60[8] zdf_nc[9] cje[10] hsl[11] zxj[12] ltsz[13] zsz[14] lb[15] zljzb[16]
    s.zde = num(p[2]);
    s.zdf = num(p[3]);
    s.zdf3 = num(p[4]);
    s.zdf5 = num(p[5]);
    s.zdf10 = num(p[6]);
    s.zdf20 = num(p[7]);
    s.zdf60 = num(p[8]);
    s.zdfnc = num(p[9]);
    s.cje = Number(p[10]) || 0;
    s.hsl = num(p[11]);
    s.zxj = num(p[12]);
    s.ltsz = Number(p[13]) || 0;
    s.zsz = Number(p[14]) || 0;
    s.lb = num(p[15]); // 量比 "-" → null
    s.zljzb = num(p[16]);
  }
}

/** 取股票某指标值（用于色彩/面积映射） */
export function metricValue(s: Stock, key: string): number {
  switch (key) {
    case 'zdf':
      return s.zdf ?? 0;
    case 'zdf_3':
      return s.zdf3 ?? 0;
    case 'zdf_5':
      return s.zdf5 ?? 0;
    case 'zdf_10':
      return s.zdf10 ?? 0;
    case 'zdf_20':
      return s.zdf20 ?? 0;
    case 'zdf_60':
      return s.zdf60 ?? 0;
    case 'zdf_nc':
      return s.zdfnc ?? 0;
    case 'zljzb':
      return s.zljzb ?? 0;
    case 'cje':
      return s.cje;
    case 'lb':
      return s.lb ?? 1;
    case 'zsz':
      return s.zsz;
    case 'ltsz':
    default:
      return s.ltsz;
  }
}
