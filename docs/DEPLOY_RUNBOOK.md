# 部署手册（Docker Hub + 阿里云 + GitHub Actions）

## 1. 你需要准备的内容

见 [SECRETS_CHECKLIST.md](./SECRETS_CHECKLIST.md)。

## 2. 本地验证（Windows）

```bash
# 项目根目录
copy .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

Postman 或 curl 测试注册/登录/items。

## 3. 新 Git 仓库推送

1. 在 GitHub 创建空仓库（例如 `dorm-evidence-fullstack`）
2. 本地：

```bash
git init
git add .
git commit -m "feat: fullstack evidence library with backend and CI/CD"
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

## 4. GitHub Secrets（Settings → Secrets and variables → Actions）

| Secret | 说明 |
|--------|------|
| `DOCKERHUB_USERNAME` | Docker Hub 用户名 |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token |
| `SERVER_HOST` | 阿里云公网 IP |
| `SERVER_USER` | SSH 用户（如 root） |
| `SERVER_SSH_KEY` | 私钥全文 |
| `SERVER_PORT` | 可选，默认 22 |
| `SERVER_APP_DIR` | 服务器目录，如 `/opt/evidence-api` |

## 5. 阿里云服务器一次性初始化

```bash
# 安装 Docker（若未装）
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

mkdir -p /opt/evidence-api
cd /opt/evidence-api
git clone https://github.com/<you>/<repo>.git .
cp deploy/env.prod.example deploy/.env.prod
# 编辑 deploy/.env.prod 填入真实密码、JWT、PUBLIC_BASE_URL
nano deploy/.env.prod

# 首次手动启动
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d
curl http://127.0.0.1:3000/health
```

安全组放行 **3000**（或你映射的 API 端口）。

## 6. CI/CD 触发

向 `main` 分支 push 且改动 `backend/**` 时：

1. 跑单元测试 + MySQL 冒烟
2. 构建镜像推送到 `DOCKERHUB_USERNAME/evidence-api:latest` 和 `:<sha>`
3. SSH 到服务器 `docker compose pull && up -d`

## 7. RN 连接地址

| 场景 | API Base URL |
|------|----------------|
| Android 模拟器 + 本机 Docker | `http://10.0.2.2:3000` |
| 真机 + 电脑局域网 | `http://<电脑IP>:3000` |
| 生产（阿里云） | `http://<公网IP>:3000` 或 HTTPS 域名 |

在 App **设置** 页可修改 API 地址；默认开发环境为 `10.0.2.2:3000`。

## 8. 回滚

```bash
cd /opt/evidence-api
# 使用某次 commit 的 sha tag
export DOCKER_IMAGE=youruser/evidence-api:<git-sha>
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d
```

## 9. 常见问题

| 现象 | 处理 |
|------|------|
| RN 连不上 API | 检查 `adb reverse tcp:3000 tcp:3000`（USB 调试）或 API 地址是否为 `10.0.2.2` |
| 401 on /items | 先登录；检查 token 是否过期 |
| 图片不显示 | `PUBLIC_BASE_URL` 必须与手机能访问的地址一致 |
| CI deploy 失败 | 检查 `SERVER_APP_DIR` 是否已 clone 仓库且存在 `deploy/.env.prod` |
| MySQL 起不来 | 检查 `MYSQL_ROOT_PASSWORD` 与 healthcheck 一致 |
