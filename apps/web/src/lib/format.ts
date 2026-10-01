// 数值格式化（东财单位约定）

/** 成交额：入参为元 */
export function formatAmount(yuan: number): string {
  if (!Number.isFinite(yuan) || yuan === 0) return '0';
  if (yuan >= 1e12) return (yuan / 1e12).toFixed(2) + '万亿';
  if (yuan >= 1e8) return (yuan / 1e8).toFixed(2) + '亿';
  if (yuan >= 1e4) return (yuan / 1e4).toFixed(2) + '万';
  return yuan.toFixed(0);
}

/** 市值：入参为 0.01亿 */
export function formatCap(raw01yi: number): string {
  const yi = raw01yi / 100;
  if (!Number.isFinite(yi) || yi === 0) return '0';
  if (yi >= 1e4) return (yi / 1e4).toFixed(2) + '万亿';
  return yi.toFixed(2) + '亿';
}

/** 涨跌幅：入参为 0.01% */
export function formatPct(raw: number | null): string {
  if (raw == null) return '--';
  return (raw / 100).toFixed(2) + '%';
}

/** 价格：入参为 0.01元 */
export function formatPrice(raw: number | null): string {
  if (raw == null) return '--';
  return (raw / 100).toFixed(2);
}

/** 量比：入参为 0.01 */
export function formatLb(raw: number | null): string {
  if (raw == null) return '--';
  return (raw / 100).toFixed(2);
}

/** 换手率：入参为 0.01% */
export function formatHsl(raw: number | null): string {
  if (raw == null) return '--';
  return (raw / 100).toFixed(2) + '%';
}

export function pctClass(raw: number | null): string {
  if (raw == null || raw === 0) return 'flat';
  return raw > 0 ? 'up' : 'down';
}
