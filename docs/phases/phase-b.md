# 阶段 B：拍照建档闭环

## 本阶段做了什么

- 集成 **react-native-image-picker**：支持拍照、从相册选图
- **添加物证**表单：名称、位置、备注、预设标签 + 自定义标签
- 提交校验：名称、位置、照片必填
- 新建条目写入 **ItemsContext**（内存 + 同步持久化，见阶段 C）
- 首页列表 **即时刷新** 新物品
- 详情页 **大图 + 备注 + 标签** 完整展示

**达成亮点**：**L1** 物品建档 · **L4** 详情页大图+备注

---

## 核心文件

| 文件 | 变更 |
|------|------|
| `src/screens/AddItemScreen.tsx` | 相机/相册、表单、提交 |
| `src/context/ItemsContext.tsx` | `addItem` 追加到列表头部 |
| `src/screens/ItemDetailScreen.tsx` | 大图 Image、备注区块 |
| `android/.../AndroidManifest.xml` | CAMERA、READ_MEDIA_IMAGES 权限 |
| `ios/.../Info.plist` | NSCameraUsageDescription 等 |

---

## RN 知识点

### 1. 原生权限

Android 6+ 危险权限需运行时申请；`image-picker` 会在调用时弹窗。Manifest 里必须先声明。

### 2. 本地图片 URI

拍照/选图返回 `file://` 或 `content://` URI，用 `<Image source={{ uri }} />` 显示。

### 3. 受控表单

每个 `TextInput` 用 `useState` 绑定 `value` + `onChangeText`，提交时读 state 组装对象。

### 4. Context 增删

`addItem` 更新 `items` 数组并 `saveItems`；所有订阅 `useItems()` 的页面自动 re-render。

---

## 自测步骤

1. 点 `+` → 拍照或相册选图
2. 填名称、位置 → 保存物证
3. 返回首页，新条目出现在「最近添加」
4. 点进详情，大图与备注正确

**Android 真机**：若相机无反应，到 设置 → 应用 → 物证库 → 权限，打开相机和存储。

---

## 答辩小问题

**Q1：为什么必须拍照？**  
A：产品是「物证库」，视觉记忆比纯文字更符合场景；答辩时这也是差异化。

**Q2：图片存在哪？**  
A：阶段 B 存 URI 引用；若用户清缓存可能失效，答辩演示用刚拍的图即可。后续可扩展复制到应用文档目录。

**Q3：addItem 为什么放在 Context？**  
A：多页面共享同一份列表，避免 props 层层传递。

---

## 下一阶段预告（阶段 C）

搜索框、标签筛选、AsyncStorage 持久化验证 → **L2 L3 L5**
