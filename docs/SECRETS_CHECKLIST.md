# 部署配置清单（你的项目）

> 密码、Token、私钥 **不要** 发到公开聊天或提交到 Git。

## 已确定（不用改）

| 项 | 值 |
|----|-----|
| GitHub 仓库（SSH） | `git@github.com:panxinyang-one/MyObject-RN.git` |
| Docker Hub 用户名 | `pxy0921` |
| Docker 镜像名 | `pxy0921/myobject-rn-docker:latest` |
| 阿里云 IP | `47.114.113.35` |
| SSH 用户 | `root` |
| 部署目录 | `/opt/myobject-rn` |
| 生产 API 地址 | `http://47.114.113.35:3000` |

---

## 一、你要自己生成 4 样东西（记在本地记事本）

### 1. JWT_SECRET

PowerShell 执行一次，复制输出：

```powershell
[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
```

### 2. MYSQL_ROOT_PASSWORD / MYSQL_PASSWORD

各设一个 **12 位以上** 强密码（字母+数字），两个不要相同。

### 3. DOCKERHUB_TOKEN

1. 打开 https://hub.docker.com 登录账号 `pxy0921`
2. 右上角头像 → **Account Settings**
3. 左侧 **Security** → **New Access Token**
4. Description 填 `github-actions`，权限选 **Read & Write**
5. **Generate** → **只显示一次**，复制保存

### 4. SERVER_SSH_KEY（私钥）

用于 GitHub Actions 登录你的服务器 `47.114.113.35`。

**若你平时用 Xshell / 阿里云 Workbench 密钥登录：**

- 找到本机私钥文件（常见 `C:\Users\你的用户名\.ssh\id_rsa`）
- 用记事本打开，**从 `-----BEGIN` 到 `-----END` 整段复制**

**若没有密钥，在 PowerShell 生成：**

```powershell
ssh-keygen -t ed25519 -C "github-deploy" -f $env:USERPROFILE\.ssh\id_ed25519_deploy
```

然后把 **公钥** 加到阿里云（下面「服务器首次配置」），**私钥** 填进 GitHub Secret。

---

## 二、GitHub Secrets 是什么？怎么填？

**是什么：** GitHub 仓库里加密保存的「密码抽屉」，只有 Actions 流水线能读，别人看不到。

**怎么打开：**

1. 浏览器打开：https://github.com/panxinyang-one/MyObject-RN
2. 顶部 **Settings**（仓库设置，不是个人设置）
3. 左侧 **Secrets and variables** → **Actions**
4. 点 **New repository secret**，**Name** 和 **Secret** 各填一行，保存

**按下面表逐个新建（共 7 个，SERVER_PORT 可省略）：**

| Name（名称必须一致） | Secret（填什么） |
|----------------------|------------------|
| `DOCKERHUB_USERNAME` | `pxy0921` |
| `DOCKERHUB_TOKEN` | 上一节生成的 Docker Hub Token |
| `SERVER_HOST` | `47.114.113.35` |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | 私钥全文（含 BEGIN/END 行） |
| `SERVER_APP_DIR` | `/opt/myobject-rn` |
| `SERVER_PORT` | `22`（可选，默认就是 22） |

填完后应看到 6～7 个 Repository secrets。

---

## 三、服务器首次配置（SSH 登录 root@47.114.113.35）

### 1. 安全组

阿里云控制台 → ECS → 安全组 → **入方向** 放行：

- **22**（SSH）
- **3000**（API，给手机/外网访问）

### 2. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
```

### 3. 若用新生成的公钥

把 `id_ed25519_deploy.pub` 内容追加到服务器：

```bash
mkdir -p ~/.ssh
echo "你的公钥一整行" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

（或在阿里云控制台 → 实例 → 密钥对/重置密码 里绑定）

### 4. 拉代码

```bash
mkdir -p /opt/myobject-rn
cd /opt/myobject-rn
git clone git@github.com:panxinyang-one/MyObject-RN.git .
```

若服务器 clone 私有仓库失败，可先在 GitHub 给仓库加 **Deploy key**，或改用 HTTPS + Personal Access Token。

### 5. 生产环境变量文件

```bash
cd /opt/myobject-rn
cp deploy/env.prod.example deploy/.env.prod
nano deploy/.env.prod
```

把里面的密码、`JWT_SECRET` 改成你在「第一节」生成的真实值，保存。

### 6. 首次手动启动（验证）

```bash
cd /opt/myobject-rn
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d
curl http://127.0.0.1:3000/health
```

看到 `"status":"ok"` 即成功。浏览器访问：http://47.114.113.35:3000/health

---

## 四、推送代码触发自动部署

本机项目目录：

```bash
git remote add origin git@github.com:panxinyang-one/MyObject-RN.git
git add .
git commit -m "feat: fullstack backend and CI/CD"
git push -u origin main
```

然后 GitHub → **Actions** 页看 `Backend CI/CD` 是否全绿。

---

## 五、手机 App 连生产环境

- **模拟器 + 本机 Docker**：设置里 API 用 `http://10.0.2.2:3000`
- **真机访问阿里云**：设置里 API 改为 `http://47.114.113.35:3000`

---

## 可选（二期）

- 域名 + HTTPS（Nginx）
- 阿里云 OSS 存图
