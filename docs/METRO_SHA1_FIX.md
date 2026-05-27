# Metro 红屏 SHA-1 错误 — 根因与修复说明

## 现象

```
Failed to get the SHA-1 for: ...\node_modules\metro-runtime\src\polyfills\require.js
```

模拟器红屏 500，Metro 终端在 `BUNDLE ./index.js` 时报错。

## 不是 blockList 的问题

当前 `blockList` 仅为默认：`/(\\__tests__\\.*)$/`，**不会**排除 `metro-runtime/require.js`。

Metro 错误文案里的第 2 条只是通用排查提示。

## 真正原因（已验证）

Metro 0.84 默认开启：

- `watcher.unstable_lazySha1: true` — 懒计算 SHA-1
- `watcher.unstable_autoSaveCache.enabled: true` — 磁盘缓存 haste map

在 **Windows + 未安装 Watchman + Node 24** 下，Dev Server 按需计算 `require.js` 的 SHA-1 时会失败；  
而 `npx react-native bundle` 一次性打包有时能成功，所以容易误判。

## 项目内修复（metro.config.js）

已设置：

| 配置 | 值 | 作用 |
|------|-----|------|
| `watcher.unstable_lazySha1` | `false` | 索引阶段就算 SHA-1 |
| `resolver.useWatchman` | `false` | 用 Node 监视文件 |
| `watcher.unstable_autoSaveCache.enabled` | `false` | 避免坏缓存 |
| `watchFolders` | `[projectRoot]` | 明确监视根目录 |

本地 Dev Server 请求 `index.bundle` 已验证 **HTTP 200**。

## 你必须执行的步骤（cmd）

**说明**：你电脑上的 `nvm use` 在脚本里会破坏 `C:\nvm4w\nodejs` 快捷方式，所以不要在脚本里切 Node。用当前终端已有的 Node 24 即可（metro.config 已修好）。

```cmd
cd /d d:\RNobject\personalProject

REM 1. 关掉所有 Metro 黑窗口

REM 2. 清缓存 + 启动（一条命令）
npm run start:dev

REM 或分两步：
REM npm run clean:metro
REM npm run start:reset

REM 3. 等 Dev server ready，且没有红色 ERROR

REM 4. 再开 cmd
adb reverse tcp:8081 tcp:8081

REM 5. 模拟器 RELOAD
```

若提示 npm/node 找不到：先**新开一个 cmd**，执行 `nvm use 24.13.0`，再进项目目录重复上面步骤。

## 若仍失败

1. 确认 `metro.config.js` 含 `unstable_lazySha1: false`（勿改回 true）
2. 用 `npm run start:dev` 强制 Node 22.11.0
3. 重装依赖：

```cmd
rmdir /s /q node_modules
npm install
npm run start:dev
```
