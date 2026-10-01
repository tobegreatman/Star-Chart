// 顶栏：品牌 + 指数条 + 时间 + 全屏
import { memo, useCallback } from 'react';
import type { IndexItem } from '../hooks/useHotMapData';
import { pctClass } from '../lib/format';

interface Props {
  indices: IndexItem[];
  quotetime: number;
}

function formatTime(ts: number): string {
  if (!ts) return '--';
  const d = new Date(ts * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function TopBarImpl({ indices, quotetime }: Props) {
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }, []);

  return (
    <div className="topbar">
      <div className="brand">
        <span className="star">★</span>大盘星图
      </div>
      <div className="indices">
        {indices.map((idx) => {
          const cls = pctClass(idx.pct);
          const chgStr =
            idx.change > 0
              ? `+${idx.change.toFixed(2)}`
              : idx.change < 0
                ? idx.change.toFixed(2)
                : '0.00';
          const pctStr =
            idx.pct > 0
              ? `+${idx.pct.toFixed(2)}%`
              : idx.pct < 0
                ? `${idx.pct.toFixed(2)}%`
                : '0.00%';
          return (
            <a
              key={`${idx.market}.${idx.code}`}
              className="index-item"
              href={`https://quote.eastmoney.com/zs${idx.code}.html`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="name">{idx.name}</span>
              <span className="price">{idx.price.toFixed(2)}</span>
              <span className={`chg ${cls}`}>{chgStr}</span>
              <span className={`pct ${cls}`}>{pctStr}</span>
            </a>
          );
        })}
      </div>
      <span className="time">{formatTime(quotetime)}</span>
      <a
        className="link"
        href="https://quote.eastmoney.com/stockhotmap/"
        target="_blank"
        rel="noreferrer"
      >
        意见反馈
      </a>
      <button className="link" onClick={toggleFullscreen} style={{ background: 'none', border: 'none' }}>
        全屏
      </button>
    </div>
  );
}

export const TopBar = memo(TopBarImpl);
