// Treemap 布局与 Canvas 渲染：复刻 d3.treemapBinary + 原始绘制逻辑
import {
  hierarchy,
  treemap,
  treemapBinary,
  type HierarchyRectangularNode,
} from 'd3-hierarchy';
import type {
  AreaMetric,
  Sector,
  SectorLevel,
  Stock,
  TreemapLeaf,
  TreemapSector,
} from './types';
import { BG, colorForMetric, metricRawValue } from './color';

interface TreeNode {
  name?: string;
  stock?: Stock;
  children?: TreeNode[];
}

/** 面积取值 */
function areaValue(s: Stock, metric: AreaMetric): number {
  switch (metric) {
    case 'cje':
      return s.cje;
    case 'lb':
      return s.lb ?? 1; // "-" 按 1.00
    case 'zsz':
      return s.zsz;
    case 'ltsz':
    default:
      return s.ltsz;
  }
}

export interface LayoutResult {
  sectors: TreemapSector[];
  leaves: TreemapLeaf[];
}

/** 计算布局 */
export function computeLayout(
  stocks: Stock[],
  sectors: Sector[],
  level: SectorLevel,
  areaMetric: AreaMetric,
  w: number,
  h: number,
  paddingTop: number,
): LayoutResult {
  const groups = new Map<number, Stock[]>();
  for (const s of stocks) {
    const idx = level === 1 ? s.bk1 : level === 2 ? s.bk2 : s.bk3;
    if (idx < 0 || !sectors[idx]) continue;
    let arr = groups.get(idx);
    if (!arr) {
      arr = [];
      groups.set(idx, arr);
    }
    arr.push(s);
  }
  const root: TreeNode = {
    children: Array.from(groups.entries()).map(([idx, arr]) => ({
      name: sectors[idx]?.name ?? '未分类',
      children: arr.map((s) => ({ name: s.name, stock: s })),
    })),
  };

  const rootH = hierarchy<TreeNode>(root)
    .sum((d) => (d.stock ? areaValue(d.stock, areaMetric) : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const tiled = treemap<TreeNode>()
    .tile(treemapBinary)
    .size([w, h])
    .padding(1)
    .paddingTop(paddingTop)
    .round(true);
  const rect: HierarchyRectangularNode<TreeNode> = tiled(rootH);

  const sectorNodes: TreemapSector[] =
    rect.children?.map((c) => ({
      x0: c.x0,
      y0: c.y0,
      x1: c.x1,
      y1: c.y1,
      name: c.data.name ?? '未分类',
    })) ?? [];

  const leaves: TreemapLeaf[] = rect.leaves().map((l) => ({
    x0: l.x0,
    y0: l.y0,
    x1: l.x1,
    y1: l.y1,
    stock: l.data.stock!,
    sectorName: l.parent?.data.name ?? '',
  }));

  return { sectors: sectorNodes, leaves };
}

/** 文字字号档位（复刻原始 12 档） */
function fontSize(l: number, c: number): number {
  if (l >= 180 && c >= 120) return 28;
  if (l >= 160 && c >= 100) return 26;
  if (l >= 140 && c >= 90) return 24;
  if (l >= 120 && c >= 80) return 20;
  if (l >= 100 && c >= 70) return 18;
  if (l >= 80 && c >= 60) return 16;
  if (l >= 60 && c >= 50) return 14;
  if (l >= 50 && c >= 40) return 12;
  if (l >= 45 && c >= 30) return 11;
  if (l >= 40 && c >= 25) return 10;
  if (l >= 35 && c >= 22) return 9;
  return l >= 32 && c >= 20 ? 8 : 0;
}

export interface RenderOptions {
  colorMetric: import('./types').ColorMetric;
  highlight: Set<string>; // "market.code" 或 6 位代码
  hasHighlight: boolean;
  hoveredCode?: string | null;
}

/** 渲染到 Canvas（ctx 已按 dpr 缩放，绘制使用 CSS 像素） */
export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  layout: LayoutResult,
  w: number,
  h: number,
  opts: RenderOptions,
): void {
  const { colorMetric, highlight, hasHighlight } = opts;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);

  // 板块头：暗色带 + 白字
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const sec of layout.sectors) {
    ctx.fillStyle = BG;
    ctx.fillRect(sec.x0, sec.y0, sec.x1 - sec.x0, sec.y1 - sec.y0);
    const w0 = sec.x1 - sec.x0;
    ctx.fillStyle = '#ffffff';
    ctx.font = w0 < 40 ? '9px sans-serif' : '13px sans-serif';
    ctx.fillText(sec.name, sec.x0 + 2, sec.y0 + 12);
  }

  // 叶子：彩色块 + 文字
  for (const lf of layout.leaves) {
    const cw = lf.x1 - lf.x0;
    const ch = lf.y1 - lf.y0;
    if (cw <= 0 || ch <= 0) continue;
    ctx.fillStyle = colorForMetric(colorMetric, lf.stock);
    ctx.fillRect(lf.x0, lf.y0, cw, ch);

    const name = lf.stock.name;
    const s = name.length > 4 ? 12 : 0;
    const u = fontSize(cw - s, ch);
    if (u > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${u}px sans-serif`;
      const cx = lf.x0 + cw / 2;
      const cy = lf.y0 + ch / 2;
      ctx.fillText(name, cx, cy - 0.4 * u);
      const raw = metricRawValue(colorMetric, lf.stock);
      if (raw != null) {
        ctx.font = `${0.9 * u}px sans-serif`;
        ctx.fillText(`${(raw / 100).toFixed(2)}%`, cx, cy + 0.7 * u);
      }
    }
  }

  // 高亮层：非高亮个股暗化，高亮个股描白边
  if (hasHighlight) {
    for (const lf of layout.leaves) {
      const key = `${lf.stock.market}.${lf.stock.code}`;
      const hit =
        highlight.has(key) ||
        highlight.has(lf.stock.code) ||
        highlight.has(`0.${lf.stock.code}`) ||
        highlight.has(`1.${lf.stock.code}`);
      if (hit) {
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(lf.x0 + 0.5, lf.y0 + 0.5, lf.x1 - lf.x0, lf.y1 - lf.y0);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(lf.x0, lf.y0, lf.x1 - lf.x0, lf.y1 - lf.y0);
      }
    }
  }

  // 悬停描边
  if (opts.hoveredCode) {
    const lf = layout.leaves.find(
      (l) =>
        l.stock.code === opts.hoveredCode ||
        `${l.stock.market}.${l.stock.code}` === opts.hoveredCode,
    );
    if (lf) {
      ctx.strokeStyle = '#FFD614';
      ctx.lineWidth = 2;
      ctx.strokeRect(lf.x0 + 1, lf.y0 + 1, lf.x1 - lf.x0 - 2, lf.y1 - lf.y0 - 2);
    }
  }
}

/** 命中测试：返回坐标处的叶子 */
export function findLeafAt(
  layout: LayoutResult,
  x: number,
  y: number,
): TreemapLeaf | null {
  for (const lf of layout.leaves) {
    if (x >= lf.x0 && x <= lf.x1 && y >= lf.y0 && y <= lf.y1) return lf;
  }
  return null;
}
