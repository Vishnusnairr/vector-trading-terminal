'use client';

import React, { useState, useMemo, useRef } from 'react';
import type { Candle, Instrument } from '@/types';
import { fmt } from '@/lib/format';

interface CandlestickChartProps {
  candles: Candle[];
  livePrice: number;
  instrument: Instrument;
  smaEnabled?: boolean;
  emaEnabled?: boolean;
}

export default function CandlestickChart({
  candles,
  livePrice,
  instrument,
  smaEnabled = true,
  emaEnabled = true,
}: CandlestickChartProps) {
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);
  const containerRef = useRef<SVGSVGElement>(null);
  
  // Dimensions
  const W = 800;
  const H = 340;
  const padL = 8;
  const padR = 65;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Stream live last candle
  const data = useMemo(() => {
    if (!candles || !candles.length) return [];
    const arr = candles.map((c) => ({ ...c }));
    const last = arr[arr.length - 1];
    
    // Wire live tick updates
    last.c = livePrice;
    last.h = Math.max(last.h, livePrice);
    last.l = Math.min(last.l, livePrice);
    
    return arr;
  }, [candles, livePrice]);

  const min = Math.min(...data.map((d) => d.l));
  const max = Math.max(...data.map((d) => d.h));
  const range = max - min || 1;
  const pad = range * 0.05;
  const yMin = min - pad;
  const yMax = max + pad;

  // Coordinate scales
  const x = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  const cw = Math.max(3, (innerW / data.length) * 0.7);

  // Moving Averages calculations
  const sma = useMemo(() => {
    if (!smaEnabled || data.length < 20) return null;
    const period = 20;
    return data.map((_, i) => {
      if (i < period - 1) return null;
      const slice = data.slice(i - period + 1, i + 1);
      return slice.reduce((a, b) => a + b.c, 0) / period;
    });
  }, [data, smaEnabled]);

  const ema = useMemo(() => {
    if (!emaEnabled || data.length < 9) return null;
    const period = 9;
    const k = 2 / (period + 1);
    let prev = data[0].c;
    return data.map((d, i) => {
      if (i === 0) return d.c;
      prev = d.c * k + prev * (1 - k);
      return prev;
    });
  }, [data, emaEnabled]);

  if (!data.length) {
    return (
      <div className="flex h-[340px] items-center justify-center font-mono text-xs text-fg-mute">
        Hydrating candle streams...
      </div>
    );
  }

  // Generate 5 Y-ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const idx = Math.round(((px - padL) / innerW) * (data.length - 1));
    
    if (idx >= 0 && idx < data.length) {
      setHover({ idx, x: x(idx), y: py });
    }
  };

  const currentCandle = hover ? data[hover.idx] : data[data.length - 1];

  return (
    <div className="relative w-full select-none">
      {/* OHLC overlay HUD with premium dark panel background for ultimate readability */}
      <div className="absolute left-4 top-3 z-10 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] bg-bg-panel/90 px-3 py-1.5 rounded-lg border border-border/80 shadow-lg backdrop-blur-md">
        <span className="text-fg-dim">
          O: <span className="text-fg font-bold tabular-nums">{fmt.price(currentCandle.o)}</span>
        </span>
        <span className="text-fg-dim">
          H: <span className="text-bull font-bold tabular-nums">{fmt.price(currentCandle.h)}</span>
        </span>
        <span className="text-fg-dim">
          L: <span className="text-bear font-bold tabular-nums">{fmt.price(currentCandle.l)}</span>
        </span>
        <span className="text-fg-dim">
          C: <span className="text-fg font-bold tabular-nums">{fmt.price(currentCandle.c)}</span>
        </span>
        <span className="text-fg-dim">
          V: <span className="text-brand-cyan/95 font-bold tabular-nums">{fmt.compact(currentCandle.v)}</span>
        </span>
        {hover && (
          <span className="text-brand-cyan font-bold flex items-center gap-1.5 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-brand-cyan"></span>
            Historical Bar
          </span>
        )}
      </div>

      <svg
        ref={containerRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <pattern id="gridPattern" width="40" height="32" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Base Grid */}
        <rect x={padL} y={padT} width={innerW} height={innerH} fill="url(#gridPattern)" />

        {/* Y Gridlines and Tick labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={y(t)}
              x2={W - padR}
              y2={y(t)}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="3 3"
            />
            <text
              x={W - padR + 6}
              y={y(t) + 3}
              fill="rgba(255,255,255,0.7)"
              className="font-mono text-[9px] font-bold tabular-nums"
              textAnchor="start"
            >
              {fmt.price(t)}
            </text>
          </g>
        ))}

        {/* X timeline axis labels */}
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => {
          const d = new Date(data[i].t);
          const label = `${d.getHours().toString().padStart(2, '0')}:${d
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
          return (
            <text
              key={i}
              x={x(i)}
              y={H - padB + 15}
              fill="rgba(255,255,255,0.7)"
              className="font-mono text-[9px] font-bold"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}

        {/* SMA Line */}
        {sma && (
          <path
            d={sma
              .map((v, i) => (v == null ? '' : `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`))
              .join(' ')
              .trim()}
            fill="none"
            stroke="#ffb547"
            strokeWidth="1.8"
            opacity="1"
          />
        )}

        {/* EMA Line */}
        {ema && (
          <path
            d={ema
              .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`)
              .join(' ')}
            fill="none"
            stroke="#9d6bff"
            strokeWidth="1.8"
            opacity="1"
          />
        )}

        {/* Candlesticks plots */}
        {data.map((d, i) => {
          const isBull = d.c >= d.o;
          const color = isBull ? 'var(--color-bull)' : 'var(--color-bear)';
          const bodyTop = y(Math.max(d.o, d.c));
          const bodyBot = y(Math.min(d.o, d.c));
          const bodyHeight = Math.max(1, bodyBot - bodyTop);
          const isLast = i === data.length - 1;

          return (
            <g
              key={i}
              opacity={hover && hover.idx !== i ? 0.45 : 1}
              className="transition-opacity duration-150"
            >
              {/* Wick */}
              <line x1={x(i)} x2={x(i)} y1={y(d.h)} y2={y(d.l)} stroke={color} strokeWidth="1.2" />
              {/* Body */}
              <rect
                x={x(i) - cw / 2}
                y={bodyTop}
                width={cw}
                height={bodyHeight}
                fill={color}
                stroke={color}
                strokeWidth="0.5"
                className={isLast ? 'shadow-[0_0_8px_var(--color-cyan)]' : ''}
              />
            </g>
          );
        })}

        {/* Live current price dot tag */}
        <line
          x1={padL}
          x2={W - padR}
          y1={y(livePrice)}
          y2={y(livePrice)}
          stroke="var(--color-cyan)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.9"
        />
        <rect
          x={W - padR + 2}
          y={y(livePrice) - 8}
          width={54}
          height={16}
          rx={3}
          fill="var(--color-cyan)"
          className="shadow-lg animate-pulse"
        />
        <text
          x={W - padR + 7}
          y={y(livePrice) + 4}
          fill="#001019"
          className="font-mono text-[9px] font-black tabular-nums"
        >
          {fmt.price(livePrice)}
        </text>

        {/* Interactive Hover crosshair indicator overlay */}
        {hover && (
          <>
            {/* Vertical crosshair */}
            <line
              x1={hover.x}
              x2={hover.x}
              y1={padT}
              y2={H - padB}
              stroke="rgba(255,255,255,0.45)"
              strokeDasharray="3 3"
            />
            {/* Horizontal crosshair */}
            <line
              x1={padL}
              x2={W - padR}
              y1={hover.y}
              y2={hover.y}
              stroke="rgba(255,255,255,0.45)"
              strokeDasharray="3 3"
            />
          </>
        )}
      </svg>
    </div>
  );
}
