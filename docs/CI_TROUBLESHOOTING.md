# CI/CD 排错清单（宿舍物证库）

## 流水线三步

| Job | 做什么 | 常见失败 |
|-----|--------|----------|
| **test** | 单元测试 + 编译 + 冒烟 curl | 缺 `JWT_SECRET`、MySQL 未就绪 |
| **build-and-push** | Docker 构建并推 Hub | Secrets 错、Dockerfile 失败 |
| **deploy** | SCP backend + SSH 部署 | Hub 超时、缺 `.env.prod`、3000 被占 |

## 什么改动会触发部署？

只有 push 到 `main`/`master` 且改了：

- `backend/**`
- `deploy/**`
- `docker-compose.yml`
- `.github/workflows/backend-cicd.yml`

**只改 RN 的 `src/` 不会部署后端**（正常）。

## 部署脚本策略（`deploy/scripts/deploy-remote.sh`）

1. 跳过服务器 `git pull`（CI 设 `DEPLOY_SKIP_GIT_PULL=1`）
2. CI 先把最新 `backend/` **SCP 到服务器**（Hub 拉失败时本地 build 用最新代码）
3. `docker compose pull` ×2（每次最多 90s）
4. 仍失败 → 服务器 `docker build`
5. `compose up -d --pull never` + curl `/health`

**deploy 跑 5～15 分钟都可能是正常的**（尤其 fallback build）。

## 服务器必备（一次性）

```bash
# /opt/myobject-rn/deploy/.env.prod 必须存在且填好：
# DOCKER_IMAGE=pxy0921/myobject-rn-docker:latest
# MYSQL_* / JWT_SECRET / PUBLIC_BASE_URL=http://47.114.113.35:3000
```

## 本机 push 失败（SSH 断连）

```text
Connection closed by 198.18.0.26 port 22
```

多为 Clash fake-ip。处理：

1. 重试 `git push`
2. 或改 HTTPS：`git remote set-url origin https://github.com/panxinyang-one/MyObject-RN.git`
3. 或 SSH 走 443 端口（见 GitHub 文档）

## 服务器上手动验证

```bash
cd /opt/myobject-rn
docker ps
curl -fsS http://127.0.0.1:3000/health
docker logs evidence-api --tail 50
```

## GitHub Secrets（7 个）

| Secret | 用途 |
|--------|------|
| DOCKERHUB_USERNAME | 推/拉镜像 |
| DOCKERHUB_TOKEN | Hub 登录 |
| SERVER_HOST | 47.114.113.35 |
| SERVER_USER | root |
| SERVER_SSH_KEY | 私钥全文 |
| SERVER_PORT | 22 |
| SERVER_APP_DIR | /opt/myobject-rn |

## 手动重跑流水线

GitHub → Actions → Backend CI/CD → **Run workflow**（workflow_dispatch）

## 端口冲突

若 health 返回奇怪 JSON 或「登录已失效」，可能是 PM2 占了 3000：

```bash
pm2 stop all
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d
```
