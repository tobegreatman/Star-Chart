// 配色：精确复刻东财大盘星图 41 色梯度（红涨绿跌，中国惯例）
import type { ColorMetric, Stock } from './types';

// 原始色阶：index 0 红 → index 40 绿
const RAW_SCALE = [
  '#f63538', '#ee373a', '#e6393b', '#df3a3d', '#d73c3f', '#ce3d41', '#c73e43',
  '#bf4045', '#b64146', '#ae4248', '#a5424a', '#9d434b', '#94444d', '#8b444e',
  '#824450', '#784551', '#6f4552', '#644553', '#5a4554', '#4f4554', '#414554',
  '#3f4c53', '#3d5451', '#3b5a50', '#3a614f', '#38694f', '#366f4e', '#35764e',
  '#347d4e', '#32844e', '#31894e', '#31904e', '#30974f', '#2f9e4f', '#2fa450',
  '#2faa51', '#2fb152', '#2fb854', '#30be56', '#30c558', '#30cc5a',
];

// 反转后：index 0 绿 → index 40 红（涨红跌绿）
const SCALE = [...RAW_SCALE].reverse();
const BG = '#262931';

/** 涨跌幅类指标（±4%）配色 */
export function colorForZdf(raw: number | null): string {
  const t = raw == null ? 0 : raw / 100; // 转百分比
  if (t >= 4) return SCALE[40];
  if (t <= -4) return SCALE[0];
  const i = Math.floor((t + 4) * 5);
  return SCALE[Math.max(0, Math.min(40, i))];
}

/** 主力净占比（±20%）配色 */
export function colorForZljzb(raw: number | null): string {
  const t = raw == null ? 0 : raw / 100;
  if (t >= 20) return SCALE[40];
  if (t <= -20) return SCALE[0];
  const i = Math.floor(t) + 20;
  return SCALE[Math.max(0, Math.min(40, i))];
}

/** 取某色彩指标对应的配色 */
export function colorForMetric(metric: ColorMetric, s: Stock): string {
  switch (metric) {
    case 'zdf':
      return colorForZdf(s.zdf);
    case 'zdf_3':
      return colorForZdf(s.zdf3);
    case 'zdf_5':
      return colorForZdf(s.zdf5);
    case 'zdf_10':
      return colorForZdf(s.zdf10);
    case 'zdf_20':
      return colorForZdf(s.zdf20);
    case 'zdf_60':
      return colorForZdf(s.zdf60);
    case 'zdf_nc':
      return colorForZdf(s.zdfnc);
    case 'zljzb':
      return colorForZljzb(s.zljzb);
  }
}

/** 取色彩指标的原始值（用于文字显示） */
export function metricRawValue(metric: ColorMetric, s: Stock): number | null {
  switch (metric) {
    case 'zdf':
      return s.zdf;
    case 'zdf_3':
      return s.zdf3;
    case 'zdf_5':
      return s.zdf5;
    case 'zdf_10':
      return s.zdf10;
    case 'zdf_20':
      return s.zdf20;
    case 'zdf_60':
      return s.zdf60;
    case 'zdf_nc':
      return s.zdfnc;
    case 'zljzb':
      return s.zljzb;
  }
}

export { SCALE, BG };
