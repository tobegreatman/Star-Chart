// 颜色图例：离散色块 + 下方刻度（复刻原站 colorbar 结构）
import { memo, useMemo } from 'react';
import { colorForZdf, colorForZljzb } from '../lib/color';
import type { ColorMetric } from '../lib/types';

interface Props {
  colorMetric: ColorMetric;
}

function LegendImpl({ colorMetric }: Props) {
  const isZljzb = colorMetric === 'zljzb';
  // 涨跌幅：-4..+4 步长 1（共 9 个）；主力净占比：-20..+20 步长 5（共 9 个）
  const max = isZljzb ? 20 : 4;
  const step = isZljzb ? 5 : 1;

  const items = useMemo(() => {
    const arr: { label: string; color: string }[] = [];
    for (let i = -max; i <= max; i += step) {
      // 入参为 0.01%，刻度单位为 1%，故 raw = i*100
      const raw = i * 100;
      const color = isZljzb ? colorForZljzb(raw) : colorForZdf(raw);
      arr.push({
        label: i === 0 ? '0' : i > 0 ? `+${i}%` : `${i}%`,
        color,
      });
    }
    return arr;
  }, [max, step, isZljzb]);

  return (
    <div className="legend">
      <span className="title">色彩图例</span>
      <div className="legend-bar">
        {items.map((it) => (
          <span
            className="legend-item"
            key={it.label}
            style={{ background: it.color }}
          >
            {it.label}
          </span>
        ))}
      </div>
      <span className="meta">
        {isZljzb ? '主力净占比 ±20%' : '涨跌幅 ±4%'} · 红涨绿跌
      </span>
    </div>
  );
}

export const Legend = memo(LegendImpl);
