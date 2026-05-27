# 物证库 Backend API

Base URL: `http://<host>:3000`（生产请用 HTTPS + 域名）

## Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | No |

Response `200`:

```json
{ "status": "ok", "db": "ok", "timestamp": "..." }
```

## Auth

| Method | Path | Body |
|--------|------|------|
| POST | `/auth/register` | `{ "email", "password" }` |
| POST | `/auth/login` | `{ "email", "password" }` |

Success: `{ "token": "...", "user": { "id", "email" } }`

后续请求头: `Authorization: Bearer <token>`

## Items（均需登录）

| Method | Path | 说明 |
|--------|------|------|
| GET | `/items` | 列表 `{ items: Item[] }` |
| POST | `/items` | 创建 `{ item }` |
| PATCH | `/items/:id` | 部分更新 `{ item }` |
| DELETE | `/items/:id` | 204 |
| POST | `/items/:id/toggle-pin` | 切换置顶 `{ item }` |

`Item` 字段与 RN 一致：

```json
{
  "id": "1",
  "name": "充电器",
  "location": "书桌",
  "note": "",
  "imageUri": "http://host/uploads/xxx.jpg",
  "tags": ["数码"],
  "isPinned": false,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

## Upload

| Method | Path | Body |
|--------|------|------|
| POST | `/uploads` | `multipart/form-data` 字段名 `image` |

Response: `{ "url": "/uploads/xxx.jpg", "imageUri": "http://..." }`

静态访问: `GET /uploads/<filename>`

## 错误格式

```json
{ "error": "Unauthorized", "message": "..." }
```
