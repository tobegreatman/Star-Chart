// 大盘星图应用根组件：整合数据层、控制面板、画布与图例
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryTabs } from './components/CategoryTabs';
import { ControlBar } from './components/ControlBar';
import { HotMap } from './components/HotMap';
import { Legend } from './components/Legend';
import { StatsBar } from './components/StatsBar';
import { TopBar } from './components/TopBar';
import { useHotMapData } from './hooks/useHotMapData';
import { filterByCategory } from './lib/categories';
import type {
  AreaMetric,
  Category,
  ColorMetric,
  Sector,
  SectorLevel,
  Stock,
} from './lib/types';

const FAV_KEY = 'star-chart-favs';

function loadFavs(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export default function App() {
  const { base, stocks, quotetime, indices, status, error } = useHotMapData();

  const [category, setCategory] = useState<Category>('hsj');
  const [colorMetric, setColorMetric] = useState<ColorMetric>('zdf');
  const [areaMetric, setAreaMetric] = useState<AreaMetric>('cje');
  const [level, setLevel] = useState<SectorLevel>(2);
  const [sectorFilter, setSectorFilter] = useState(-1);
  const [showFav, setShowFav] = useState(false);
  const [highlightInput, setHighlightInput] = useState('');
  const [version, setVersion] = useState<1 | 0>(1);
  const [favs, setFavs] = useState<Set<string>>(() => loadFavs());

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    } catch {
      // 忽略写入失败
    }
  }, [favs]);

  // 当前层级板块列表
  const sectors: Sector[] = useMemo(() => {
    if (!base) return [];
    return level === 1 ? base.bk1 : level === 2 ? base.bk2 : base.bk3;
  }, [base, level]);

  // 切换层级 / 分类时重置板块下钻
  useEffect(() => {
    setSectorFilter(-1);
  }, [level, category]);

  // 按市场分类筛选
  const categorized = useMemo(
    () => filterByCategory(stocks, category, favs),
    [stocks, category, favs],
  );

  // 板块下钻：仅保留命中板块的个股
  const visibleStocks = useMemo(() => {
    if (sectorFilter < 0) return categorized;
    return categorized.filter((s) => {
      const idx = level === 1 ? s.bk1 : level === 2 ? s.bk2 : s.bk3;
      return idx === sectorFilter;
    });
  }, [categorized, sectorFilter, level]);

  // 高亮集合：自选（开启时）+ 输入框代码
  const highlight = useMemo(() => {
    const set = new Set<string>();
    if (showFav) for (const k of favs) set.add(k);
    const parts = highlightInput
      .split(/[,，\s]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    for (const p of parts) {
      set.add(p);
      if (/^\d{6}$/.test(p)) {
        set.add(`0.${p}`);
        set.add(`1.${p}`);
      }
    }
    return set;
  }, [showFav, favs, highlightInput]);

  const hasHighlight = highlight.size > 0;

  const onJump = useCallback(
    (stock: Stock) => {
      const path = version === 1 ? 'cr' : 'r';
      const url = `https://quote.eastmoney.com/unify/${path}/${stock.market}.${stock.code}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [version],
  );

  const onSectorDrill = useCallback(
    (name: string) => {
      const idx = sectors.findIndex((s) => s.name === name);
      if (idx >= 0) setSectorFilter(idx);
    },
    [sectors],
  );

  const onBack = useCallback(() => setSectorFilter(-1), []);

  const onToggleFav = useCallback((key: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (status === 'loading') {
    return (
      <div className="app">
        <div className="overlay">
          <div className="spinner" />
          <div className="msg">正在加载大盘数据…</div>
        </div>
      </div>
    );
  }

  if (status === 'error' || !base) {
    return (
      <div className="app">
        <div className="overlay">
          <div className="msg err">数据加载失败</div>
          <div className="msg">{error ?? '请稍后重试'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar indices={indices} quotetime={quotetime} />
      <div className="tabs-row">
        <CategoryTabs active={category} onChange={setCategory} />
        <StatsBar stocks={visibleStocks} />
      </div>
      <ControlBar
        colorMetric={colorMetric}
        areaMetric={areaMetric}
        level={level}
        sectorFilter={sectorFilter}
        sectors={sectors}
        showFav={showFav}
        highlightInput={highlightInput}
        version={version}
        onColor={setColorMetric}
        onArea={setAreaMetric}
        onLevel={setLevel}
        onSector={setSectorFilter}
        onShowFav={setShowFav}
        onHighlight={setHighlightInput}
        onVersion={setVersion}
      />
      <HotMap
        stocks={visibleStocks}
        sectors={sectors}
        level={level}
        areaMetric={areaMetric}
        colorMetric={colorMetric}
        highlight={highlight}
        hasHighlight={hasHighlight}
        drillSector={sectorFilter}
        favs={favs}
        onJump={onJump}
        onSectorDrill={onSectorDrill}
        onBack={onBack}
        onToggleFav={onToggleFav}
      />
      <Legend colorMetric={colorMetric} />
    </div>
  );
}
