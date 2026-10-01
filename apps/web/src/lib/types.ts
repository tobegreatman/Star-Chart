// 大盘星图核心类型定义

/** 行情指标（色彩代表） */
export type ColorMetric =
  | 'zdf'
  | 'zdf_3'
  | 'zdf_5'
  | 'zdf_10'
  | 'zdf_20'
  | 'zdf_60'
  | 'zdf_nc'
  | 'zljzb';

/** 面积指标 */
export type AreaMetric = 'ltsz' | 'zsz' | 'cje' | 'lb';

/** 板块层级 */
export type SectorLevel = 1 | 2 | 3;

/** 市场分类标签（顶部切换） */
export type Category =
  | 'hsj'
  | 'sh'
  | 'sz'
  | 'bj'
  | 'kc'
  | 'cy'
  | 'hs300'
  | 'zz500'
  | 'zz1000'
  | 'fav';

/** 板块定义 */
export interface Sector {
  market: string;
  code: string;
  name: string;
}

/** 个股（合并基础数据与行情） */
export interface Stock {
  market: number;
  code: string;
  name: string;
  bk1: number;
  bk2: number;
  bk3: number;
  labels: string;
  zde: number | null; // 涨跌额
  zdf: number | null; // 涨跌幅 (0.01%)
  zdf3: number | null;
  zdf5: number | null;
  zdf10: number | null;
  zdf20: number | null;
  zdf60: number | null;
  zdfnc: number | null; // 年初至今
  cje: number; // 成交额 (元)
  hsl: number | null; // 换手率 (0.01%)
  zxj: number | null; // 最新价 (0.01元)
  ltsz: number; // 流通市值 (0.01亿)
  zsz: number; // 总市值 (0.01亿)
  lb: number | null; // 量比 (0.01)
  zljzb: number | null; // 主力净占比 (0.01%)
}

/** 解析后的基础数据 */
export interface BaseData {
  stocks: Stock[];
  bk1: Sector[];
  bk2: Sector[];
  bk3: Sector[];
}

/** 行情快照 */
export interface QuoteSnapshot {
  quotetime: number;
  data: Stock[];
}

/** Treemap 叶子节点（含布局坐标） */
export interface TreemapLeaf {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  stock: Stock;
  sectorName: string;
}

/** Treemap 板块节点 */
export interface TreemapSector {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  name: string;
}
