// 图谱画布居中适配工具：根据内容包围盒与画布实际尺寸，计算初始 transform，使内容居中并选择合适的比例尺。
import { useLayoutEffect, useRef, useState } from 'react';

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
export type Transform = { x: number; y: number; k: number };

/** 计算使内容 (bounds) 在画布 (w×h) 内居中并留边距的 transform。 */
export function computeCenterFit(bounds: Bounds, w: number, h: number, padding = 40): Transform {
  const contentW = Math.max(1, bounds.maxX - bounds.minX);
  const contentH = Math.max(1, bounds.maxY - bounds.minY);
  const availW = Math.max(50, w - padding * 2);
  const availH = Math.max(50, h - padding * 2);
  const k = Math.min(1.2, Math.max(0.2, Math.min(availW / contentW, availH / contentH)));
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return { x: w / 2 - cx * k, y: h / 2 - cy * k, k };
}

/**
 * 图谱画布居中适配 hook。
 * getBounds: () => Bounds，返回当前内容包围盒（随数据/筛选变化）。
 * 返回 { transform, setTransform, canvasRef, reset }。
 */
export function useCenterFit(getBounds: () => Bounds) {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    boxRef.current = { w: rect.width, h: rect.height };
    setTransform(computeCenterFit(getBounds(), rect.width, rect.height));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    const box = boxRef.current;
    if (!box) return;
    setTransform(computeCenterFit(getBounds(), box.w, box.h));
  };

  return { transform, setTransform, canvasRef, reset };
}
