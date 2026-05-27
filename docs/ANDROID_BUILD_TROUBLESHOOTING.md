# Android 构建常见问题（国内网络）

## 症状：`Could not resolve com.android.tools.build:gradle:8.7.2`

Gradle 无法从 `dl.google.com` 下载依赖，常见于网络/TLS 限制。

本项目已在 `android/build.gradle`、`android/settings.gradle` 配置 **阿里云 Maven 镜像**，并在 `gradle-wrapper.properties` 使用腾讯云 Gradle 分发地址。

## 推荐重试步骤

1. 先启动 Android 模拟器（Device Manager → Run）
2. 只保留一个 Metro：`npm start`（若 8081 被占用，关掉旧终端）
3. 清理后重编：

```bash
cd d:\RNobject\personalProject\android
.\gradlew.bat clean
cd ..
npm run android
```

## 红屏 / Metro 500：`Failed to get the SHA-1 for ... require.js`

**Node 版本**：RN 0.85 官方支持 `^20.19.4 || ^22.13.0 || ^24.3.0` 等，**Node 24.13.0 可以用**。若 Metro 仍异常，可再尝试切换到 Node 22 对比排查。

**完整恢复步骤**（按顺序）：

```bash
cd d:\RNobject\personalProject
# 1. 关掉所有 Metro 窗口

# 2. 清 Metro 缓存
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 3. 重启 Metro（等 Dev server ready）
npm run start:reset

# 4. 新终端
adb reverse tcp:8081 tcp:8081

# 5. 模拟器里 RELOAD（或 Metro 按 r）
```

**根因**：Metro 默认 `unstable_lazySha1: true`，在 Windows 上 Dev Server 懒算 SHA-1 会失败。  
**修复**：`metro.config.js` 已设 `unstable_lazySha1: false` 等，详见 [METRO_SHA1_FIX.md](./METRO_SHA1_FIX.md)。

**一键启动（推荐）**：

```cmd
npm run clean:metro
npm run start:dev
```

`start:dev` 会切 Node 22、清缓存、启动 Metro。然后 `adb reverse` + RELOAD。

## Metro 崩溃：`ENOENT ... watch ... android\.cxx\...`

Gradle 编译时会动 `node_modules/**/android/.cxx`。**先** `npm start` 等 ready，**再** 另开终端 `npm run android`，可减少崩溃。

若 Metro 仍因 `.cxx` 退出：关掉 Metro → 等 android 编译结束 → 再 `npm run start:reset`。

## 仍失败时

- 检查是否开了能访问 Google 的网络/VPN
- Android Studio → SDK Manager → 确认 **Android SDK Build-Tools** 已安装
- 运行 `npx react-native doctor` 查看环境项
