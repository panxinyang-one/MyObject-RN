const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const defaultConfig = getDefaultConfig(projectRoot);

/**
 * Windows + Node 24 下 Metro 红屏 SHA-1 修复要点：
 * 1. unstable_lazySha1: false — 建索引时就算好 SHA-1，避免懒加载失败
 * 2. useWatchman: false — 未装 Watchman 时用 Node 监视
 * 3. unstable_autoSaveCache: false — 避免损坏的磁盘 haste 缓存
 * blockList 保持默认，不排除 metro-runtime/require.js
 */
const config = {
  projectRoot,
  watchFolders: [projectRoot],
  resolver: {
    useWatchman: false,
  },
  watcher: {
    unstable_lazySha1: false,
    unstable_autoSaveCache: {
      enabled: false,
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
