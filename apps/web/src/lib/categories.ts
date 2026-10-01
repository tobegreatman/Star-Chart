// 顶部市场分类标签
import type { Category, Stock } from './types';

export const CATEGORIES: { key: Category; name: string }[] = [
  { key: 'hsj', name: '沪深京A股' },
  { key: 'sh', name: '上证A股' },
  { key: 'sz', name: '深证A股' },
  { key: 'bj', name: '北证A股' },
  { key: 'kc', name: '科创板' },
  { key: 'cy', name: '创业板' },
  { key: 'hs300', name: '沪深300' },
  { key: 'zz500', name: '中证500' },
  { key: 'zz1000', name: '中证1000' },
  { key: 'fav', name: '我的自选股' },
];

/** labels 形如 ",hsj,sz,hs300," */
export function filterByCategory(
  stocks: Stock[],
  key: Category,
  favs: Set<string>,
): Stock[] {
  if (key === 'fav') {
    return stocks.filter((s) => favs.has(`${s.market}.${s.code}`));
  }
  const tag = `,${key},`;
  return stocks.filter((s) => s.labels.includes(tag));
}
