// 大盘星图核心：Canvas treemap 渲染 + 悬停/双击交互
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  computeLayout,
  findLeafAt,
  renderCanvas,
  type LayoutResult,
} from '../lib/treemap';
import { colorForMetric } from '../lib/color';
import {
  formatAmount,
  formatCap,
  formatHsl,
  formatLb,
  formatPct,
  formatPrice,
  pctClass,
} from '../lib/format';
import type {
  AreaMetric,
  ColorMetric,
  Sector,
  SectorLevel,
  Stock,
  TreemapLeaf,
} from '../lib/types';

interface HotMapProps {
  stocks: Stock[];
  sectors: Sector[];
  level: SectorLevel;
  areaMetric: AreaMetric;
  colorMetric: ColorMetric;
  highlight: Set<string>;
  hasHighlight: boolean;
  drillSector: number; // -1 = 未下钻
  favs: Set<string>;
  onJump: (stock: Stock) => void;
  onSectorDrill: (sectorName: string) => void;
  onBack: () => void;
  onToggleFav: (key: string) => void;
}

function HotMapImpl(props: HotMapProps) {
  const {
    stocks,
    sectors,
    level,
    areaMetric,
    colorMetric,
    highlight,
    hasHighlight,
    drillSector,
    favs,
    onSectorDrill,
    onBack,
    onToggleFav,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<{
    leaf: TreemapLeaf | null;
    x: number;
    y: number;
  }>({ leaf: null, x: 0, y: 0 });

  const cbRef = useRef(props.onJump);
  cbRef.current = props.onJump;

  // 布局（仅在面积维度/数据/尺寸变化时重算）
  const layout: LayoutResult | null = useMemo(() => {
    if (size.w < 10 || size.h < 10 || stocks.length === 0) return null;
    return computeLayout(stocks, sectors, level, areaMetric, size.w, size.h, 16);
  }, [stocks, sectors, level, areaMetric, size.w, size.h]);

  const hoveredCode = hover.leaf
    ? `${hover.leaf.stock.market}.${hover.leaf.stock.code}`
    : null;

  // 渲染（色彩/高亮/悬停变化时重绘）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout || size.w < 10) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== size.w * dpr || canvas.height !== size.h * dpr) {
      canvas.width = size.w * dpr;
      canvas.height = size.h * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderCanvas(ctx, layout, size.w, size.h, {
      colorMetric,
      highlight,
      hasHighlight,
      hoveredCode,
    });
  }, [layout, colorMetric, highlight, hasHighlight, hoveredCode, size.w, size.h]);

  // 尺寸观测
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cv = canvasRef.current;
      const lay = layout;
      if (!cv || !lay) return;
      const rect = cv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const leaf = findLeafAt(lay, x, y);
      setHover((prev) => {
        const prevCode = prev.leaf
          ? `${prev.leaf.stock.market}.${prev.leaf.stock.code}`
          : null;
        const newCode = leaf
          ? `${leaf.stock.market}.${leaf.stock.code}`
          : null;
        // 仅当个股变化时才更新 leaf（触发画布重绘描边）；位置每次更新
        if (prevCode === newCode) {
          return { leaf: prev.leaf, x: e.clientX, y: e.clientY };
        }
        return { leaf, x: e.clientX, y: e.clientY };
      });
    },
    [layout],
  );

  const onLeave = useCallback(() => {
    setHover({ leaf: null, x: 0, y: 0 });
  }, []);

  const onDblClick = useCallback(() => {
    if (hover.leaf) cbRef.current(hover.leaf.stock);
  }, [hover.leaf]);

  // 单击板块标题区（顶部 16px）→ 下钻；下钻态下点击空白标题不重复触发
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cv = canvasRef.current;
      const lay = layout;
      if (!cv || !lay) return;
      const rect = cv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // 命中叶子则不下钻（避免与叶子交互冲突）
      if (findLeafAt(lay, x, y)) return;
      for (const sec of lay.sectors) {
        if (
          x >= sec.x0 &&
          x <= sec.x1 &&
          y >= sec.y0 &&
          y <= sec.y0 + 16
        ) {
          if (drillSector < 0) onSectorDrill(sec.name);
          return;
        }
      }
    },
    [layout, drillSector, onSectorDrill],
  );

  const drillName =
    drillSector >= 0 && sectors[drillSector] ? sectors[drillSector].name : '';

  const tip = hover.leaf;
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipPos, setTipPos] = useState<{ left: number; top: number } | null>(
    null,
  );
  useLayoutEffect(() => {
    if (!tip || !tipRef.current) {
      setTipPos(null);
      return;
    }
    const el = tipRef.current;
    // 等待 K 线图加载完成后再测量，避免高度跳变
    const img = el.querySelector('img');
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const margin = 14;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = hover.x + margin;
      let top = hover.y + margin;
      if (left + w > vw - 8) left = hover.x - w - margin;
      if (top + h > vh - 8) top = hover.y - h - margin;
      if (left < 8) left = Math.max(8, Math.min(vw - w - 8, hover.x + margin));
      if (top < 8) top = Math.max(8, Math.min(vh - h - 8, hover.y + margin));
      setTipPos({ left, top });
    };
    measure();
    if (img && !img.complete) {
      img.addEventListener('load', measure);
      img.addEventListener('error', measure);
      return () => {
        img.removeEventListener('load', measure);
        img.removeEventListener('error', measure);
      };
    }
  }, [tip, hover.x, hover.y]);

  const tipStyle: React.CSSProperties = tip
    ? {
        left: tipPos?.left ?? hover.x + 14,
        top: tipPos?.top ?? hover.y + 14,
        display: 'block',
      }
    : { display: 'none' };

  return (
    <div className="stage" ref={containerRef}>
      {drillSector >= 0 && (
        <div className="drillbar">
          <button className="back" onClick={onBack}>
            ‹ 返回全部
          </button>
          <span className="crumb">
            {['', '一', '二', '三'][level]}级行业 / <strong>{drillName}</strong>
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
        onDoubleClick={onDblClick}
      />
      {tip && (
        <div className="tooltip" style={tipStyle} ref={tipRef}>
          <div className="t-name">
            {tip.stock.name}
            <span className={`t-name-pct ${pctClass(tip.stock.zdf)}`}>
              {formatPct(tip.stock.zdf)}
            </span>
          </div>
          <div className="t-code">
            {tip.stock.market === 1 ? 'SH' : tip.stock.market === 0 ? 'SZ' : 'BJ'}
            {tip.stock.code} · {tip.sectorName}
          </div>
          <img
            className="t-kline"
            src={`https://webquoteklinepic.eastmoney.com/GetPic.aspx?nid=${tip.stock.market}.${tip.stock.code}&imageType=KL`}
            alt="日K线"
            loading="lazy"
          />
          <div className="t-grid">
            <div className="t-row">
              <span className="k">最新价</span>
              <span className="v">{formatPrice(tip.stock.zxj)}</span>
            </div>
            <div className="t-row">
              <span className="k">涨跌幅</span>
              <span className={`v ${pctClass(tip.stock.zdf)}`}>
                {formatPct(tip.stock.zdf)}
              </span>
            </div>
            <div className="t-row">
              <span className="k">涨跌额</span>
              <span className={`v ${pctClass(tip.stock.zde)}`}>
                {tip.stock.zde == null
                  ? '--'
                  : (tip.stock.zde / 100).toFixed(2)}
              </span>
            </div>
            <div className="t-row">
              <span className="k">成交额</span>
              <span className="v">{formatAmount(tip.stock.cje)}</span>
            </div>
            <div className="t-row">
              <span className="k">流通市值</span>
              <span className="v">{formatCap(tip.stock.ltsz)}</span>
            </div>
            <div className="t-row">
              <span className="k">总市值</span>
              <span className="v">{formatCap(tip.stock.zsz)}</span>
            </div>
            <div className="t-row">
              <span className="k">量比</span>
              <span className="v">{formatLb(tip.stock.lb)}</span>
            </div>
            <div className="t-row">
              <span className="k">换手率</span>
              <span className="v">{formatHsl(tip.stock.hsl)}</span>
            </div>
            <div className="t-row">
              <span className="k">主力净占比</span>
              <span className={`v ${pctClass(tip.stock.zljzb)}`}>
                {formatPct(tip.stock.zljzb)}
              </span>
            </div>
          </div>
          <div
            className="t-hint"
            style={{ borderLeft: `3px solid ${colorForMetric(colorMetric, tip.stock)}` }}
          >
            <span className="t-hint-text">
              双击打开行情页 · 颜色：{labelOf(colorMetric)}
            </span>
            <button
              className={`star-btn ${favs.has(`${tip.stock.market}.${tip.stock.code}`) ? 'on' : ''}`}
              onClick={() =>
                onToggleFav(`${tip.stock.market}.${tip.stock.code}`)
              }
              title={favs.has(`${tip.stock.market}.${tip.stock.code}`) ? '移出自选' : '加入自选'}
            >
              {favs.has(`${tip.stock.market}.${tip.stock.code}`) ? '★' : '☆'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function labelOf(m: ColorMetric): string {
  const map: Record<ColorMetric, string> = {
    zdf: '涨跌幅',
    zdf_3: '3日涨跌幅',
    zdf_5: '5日涨跌幅',
    zdf_10: '10日涨跌幅',
    zdf_20: '20日涨跌幅',
    zdf_60: '60日涨跌幅',
    zdf_nc: '年初至今',
    zljzb: '主力净占比',
  };
  return map[m];
}

export const HotMap = memo(HotMapImpl);
