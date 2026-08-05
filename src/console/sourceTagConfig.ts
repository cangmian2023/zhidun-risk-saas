// 全局开关：新建页面是否显示「数据来源标签」
// 橙=样例JSON(使用域) ｜ 蓝=配置JSON(配置) ｜ 灰=实时计算
// 持久化到本地配置文件 src/console/sourceTag.json（非内存，刷新保留），默认开启。
import { useSyncExternalStore } from 'react';

let showSourceTags = true;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function loadFromDisk() {
  fetch('/api/load-source-tag')
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && typeof data.showSourceTags === 'boolean') {
        if (data.showSourceTags !== showSourceTags) {
          showSourceTags = data.showSourceTags;
          emit();
        }
      } else {
        // 文件缺失或结构不符 → 用默认值落盘创建
        saveToDisk(true);
      }
    })
    .catch(() => {
      // 网络/端点异常：保留内存默认 true
    });
}

function saveToDisk(v: boolean) {
  fetch('/api/save-source-tag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ showSourceTags: v }),
  }).catch(() => {});
}

// 启动加载
loadFromDisk();

export function setShowSourceTags(v: boolean) {
  if (showSourceTags === v) return;
  showSourceTags = v;
  emit();
  saveToDisk(v);
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
