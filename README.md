# 宿舍物证库

React Native 移动端 + Express/MySQL 后端：给宿舍常用物品拍照建档，支持**本地模式**与**登录云同步**（Docker / CI/CD 可部署到阿里云）。

- 未登录：数据保存在手机 AsyncStorage（与原先一致）
- 已登录：物证同步到服务器，支持图片上传

## 功能亮点（答辩 8 项）

| # | 亮点 | 说明 |
|---|------|------|
| L1 | 物品建档 | 拍照/相册 + 名称 + 位置 + 标签 |
| L2 | 标签分类 | 预设与自定义标签，首页 Chip 筛选 |
| L3 | 关键词搜索 | 匹配名称、位置、备注、标签 |
| L4 | 详情大图 | 大图、位置、备注、标签一览 |
| L5 | 本地持久化 | AsyncStorage，杀进程后仍在 |
| L6 | 置顶 / 最近 | 置顶区 + 最近 3 条 |
| L7 | 空状态引导 | 无数据时引导添加第一件 |
| L8 | 编辑 / 删除 | 编辑复用表单，删除二次确认 |

## 环境要求

- Node.js >= 22.11.0
- Android Studio（模拟器或真机 USB 调试）
- 可选：Xcode（iOS）

## 全栈本地运行（后端 + 数据库）

1. 启动 Docker Desktop
2. 项目根目录：

```bash
copy .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

3. RN 模拟器默认 API：`http://10.0.2.2:3000`（设置页可改）

详见 [docs/DEPLOY_RUNBOOK.md](docs/DEPLOY_RUNBOOK.md)、[docs/BACKEND_API_SPEC.md](docs/BACKEND_API_SPEC.md)、[docs/SECRETS_CHECKLIST.md](docs/SECRETS_CHECKLIST.md)

## 运行 App

```bash
npm install
npm start
# 新终端
npm run android
# iOS（macOS）
cd ios && bundle exec pod install && cd ..
npm run ios
```

## 项目结构

详见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 学习文档（按阶段）

| 阶段 | 文档 | 内容 |
|------|------|------|
| A | [docs/phases/phase-a.md](docs/phases/phase-a.md) | 导航、列表、假数据 |
| B | [docs/phases/phase-b.md](docs/phases/phase-b.md) | 相机建档 |
| C | [docs/phases/phase-c.md](docs/phases/phase-c.md) | 持久化、搜索、筛选 |
| D | [docs/phases/phase-d.md](docs/phases/phase-d.md) | 编辑删除、置顶、空状态 |
| E | [docs/phases/phase-e.md](docs/phases/phase-e.md) | 演示包、答辩 |

## 答辩演示

3 分钟台词见 [docs/DEMO.md](docs/DEMO.md)

App 内：**首页右上角「设置」** → 登录云同步 / 配置 API / 离线演示数据。

## 自测

```bash
npm run lint
npm test
```

## 技术栈

- React Native 0.85 · React 19 · TypeScript
- React Navigation · AsyncStorage · react-native-image-picker
