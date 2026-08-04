// 全局开关：新建页面是否显示「数据来源标签」
// 橙=样例JSON(使用域) ｜ 蓝=配置JSON(配置) ｜ 灰=实时计算
// 默认开启；生产环境可通过 setShowSourceTags(false) 关闭。
import { useSyncExternalStore } from 'react';

let showSourceTags = true;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setShowSourceTags(v: boolean) {
  if (showSourceTags === v) return;
  showSourceTags = v;
  emit();
}

export function getShowSourceTags(): boolean {
  return showSourceTags;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useShowSourceTags(): boolean {
  return useSyncExternalStore(subscribe, getShowSourceTags, getShowSourceTags);
}
