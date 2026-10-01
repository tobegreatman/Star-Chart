// 数据 hook：基础数据一次加载，行情与指数周期刷新
import { useEffect, useRef, useState } from 'react';
import { fetchBase, fetchIndices, fetchQuote } from '../lib/api';
import { mergeQuote, parseBase, parseQuote } from '../lib/parse';
import type { BaseData, Stock } from '../lib/types';

export interface IndexItem {
  name: string;
  price: number;
  change: number; // 涨跌额
  pct: number; // 涨跌幅 %
  market: number;
  code: string;
}

type RawIndex = {
  data?: { diff?: Array<{ f2?: number; f3?: number; f4?: number; f12?: string; f13?: number; f14?: string; f152?: number }> };
};

export function useHotMapData() {
  const [base, setBase] = useState<BaseData | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [quotetime, setQuotetime] = useState(0);
  const [indices, setIndices] = useState<IndexItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const stocksRef = useRef<Stock[]>([]);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const refreshQuote = async () => {
      try {
        const q = await fetchQuote();
        const { quotetime, map } = parseQuote(q as never);
        mergeQuote(stocksRef.current, map);
        if (!alive) return;
        setStocks([...stocksRef.current]);
        setQuotetime(quotetime);
      } catch (e) {
        // 静默：行情刷新失败不阻断
      }
    };

    const refreshIndices = async () => {
      try {
        const raw = (await fetchIndices<RawIndex>()) as RawIndex;
        const diff = raw.data?.diff ?? [];
        if (!alive) return;
        setIndices(
          diff.map((d) => ({
            name: d.f14 ?? '',
            // push2 接口 f2 价格 / f4 涨跌额 / f3 涨跌幅均为 ×100 的整数，需除 100
            price: (d.f2 ?? 0) / 100,
            change: (d.f4 ?? 0) / 100,
            pct: (d.f3 ?? 0) / 100,
            market: d.f13 ?? 0,
            code: d.f12 ?? '',
          })),
        );
      } catch {
        // 静默
      }
    };

    (async () => {
      try {
        const raw = await fetchBase();
        const b = parseBase(raw as never);
        if (!alive) return;
        stocksRef.current = b.stocks;
        setBase(b);
        setStocks(b.stocks);
        await Promise.all([refreshQuote(), refreshIndices()]);
        if (!alive) return;
        setStatus('ready');
        timer = setInterval(() => {
          void refreshQuote();
          void refreshIndices();
        }, 8000);
      } catch (e) {
        if (!alive) return;
        setError(String(e));
        setStatus('error');
      }
    })();

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  return { base, stocks, quotetime, indices, status, error };
}
