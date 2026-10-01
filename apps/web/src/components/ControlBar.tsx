// 控制条：色彩代表 / 面积代表 / 高亮 / 板块选择 / 版本
import { memo } from 'react';
import type { AreaMetric, ColorMetric, Sector, SectorLevel } from '../lib/types';

interface Props {
  colorMetric: ColorMetric;
  areaMetric: AreaMetric;
  level: SectorLevel;
  sectorFilter: number; // -1 = 所有
  sectors: Sector[];
  showFav: boolean;
  highlightInput: string;
  version: 1 | 0;
  onColor: (m: ColorMetric) => void;
  onArea: (m: AreaMetric) => void;
  onLevel: (l: SectorLevel) => void;
  onSector: (idx: number) => void;
  onShowFav: (v: boolean) => void;
  onHighlight: (v: string) => void;
  onVersion: (v: 1 | 0) => void;
}

function ControlBarImpl(p: Props) {
  return (
    <div className="controlbar">
      <label>
        色彩代表
        <select
          value={p.colorMetric}
          onChange={(e) => p.onColor(e.target.value as ColorMetric)}
        >
          <optgroup label="——涨跌幅——">
            <option value="zdf">涨跌幅</option>
            <option value="zdf_3">3日涨跌幅</option>
            <option value="zdf_5">5日涨跌幅</option>
            <option value="zdf_10">10日涨跌幅</option>
            <option value="zdf_20">20日涨跌幅</option>
            <option value="zdf_60">60日涨跌幅</option>
            <option value="zdf_nc">年初至今涨跌幅</option>
          </optgroup>
          <optgroup label="——资金流向——">
            <option value="zljzb">主力净占比</option>
          </optgroup>
        </select>
      </label>

      <label>
        面积代表
        <select
          value={p.areaMetric}
          onChange={(e) => p.onArea(e.target.value as AreaMetric)}
        >
          <option value="ltsz">流通市值</option>
          <option value="zsz">总市值</option>
          <option value="cje">成交额</option>
          <option value="lb">量比</option>
        </select>
      </label>

      <span className="sep" />

      <label className="chk">
        <input
          type="checkbox"
          checked={p.showFav}
          onChange={(e) => p.onShowFav(e.target.checked)}
        />
        我的自选股
      </label>

      <label>
        高亮
        <input
          type="text"
          placeholder="自定义高亮代码 (逗号分隔)"
          value={p.highlightInput}
          onChange={(e) => p.onHighlight(e.target.value)}
        />
      </label>

      <span className="sep" />

      <label>
        板块选择
        <select
          value={`hy${p.level}all`}
          onChange={(e) => {
            const v = e.target.value;
            p.onLevel(v === 'hy1all' ? 1 : v === 'hy3all' ? 3 : 2);
          }}
        >
          <option value="hy1all">东财一级行业</option>
          <option value="hy2all">东财二级行业</option>
          <option value="hy3all">东财三级行业</option>
        </select>
      </label>

      <label>
        <select
          value={p.sectorFilter}
          onChange={(e) => p.onSector(Number(e.target.value))}
        >
          <option value={-1}>所有{['', '一', '二', '三'][p.level]}级行业</option>
          {p.sectors.map((s, i) => (
            <option key={`${i}-${s.code}`} value={i}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <span className="spacer" />

      <label>
        双击跳转到
        <select
          value={p.version}
          onChange={(e) => p.onVersion(Number(e.target.value) as 1 | 0)}
        >
          <option value={1}>极速版行情页面</option>
          <option value={0}>经典版行情页面</option>
        </select>
      </label>
    </div>
  );
}

export const ControlBar = memo(ControlBarImpl);
