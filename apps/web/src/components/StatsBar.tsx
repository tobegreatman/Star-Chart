// 统计栏：上涨/平盘/下跌 + 成交额
import { memo, useMemo } from 'react';
import { formatAmount } from '../lib/format';
import type { Stock } from '../lib/types';

interface Props {
  stocks: Stock[];
}

function StatsBarImpl({ stocks }: Props) {
  const stats = useMemo(() => {
    let up = 0;
    let flat = 0;
    let down = 0;
    let total = 0;
    for (const s of stocks) {
      const z = s.zdf;
      if (z == null || z === 0) flat++;
      else if (z > 0) up++;
      else down++;
      total += s.cje;
    }
    return { up, flat, down, total };
  }, [stocks]);

  return (
    <div className="statsbar">
      <div className="group">
        <span className="label">上涨</span>
        <span className="value up">{stats.up}</span>
      </div>
      <div className="group">
        <span className="label">平盘</span>
        <span className="value flat">{stats.flat}</span>
      </div>
      <div className="group">
        <span className="label">下跌</span>
        <span className="value down">{stats.down}</span>
      </div>
      <div className="group">
        <span className="label">成交额</span>
        <span className="value">{formatAmount(stats.total)}</span>
      </div>
      <div className="group">
        <span className="label">个股</span>
        <span className="value">{stocks.length}</span>
      </div>
    </div>
  );
}

export const StatsBar = memo(StatsBarImpl);
