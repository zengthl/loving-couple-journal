# Supabase 数据库配置指南

## 📋 前置要求

1. 拥有 [Supabase](https://supabase.com) 账号
2. 已安装 Node.js 和 npm

## 🚀 快速开始

### 步骤 1：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 并登录
2. 点击 **"New Project"（新建项目）**
3. 填写项目信息：
   - **Name（名称）**: `loving-couple-journal`（或任意名称）
   - **Database Password（数据库密码）**: 选择一个强密码
   - **Region（地区）**: 选择离用户最近的地区
4. 点击 **"Create new project"（创建新项目）** 并等待约 2 分钟完成设置

### 步骤 2：运行数据库 Schema

1. 在 Supabase 项目中，前往 **SQL Editor（SQL 编辑器）**（左侧边栏）
2. 点击 **"New Query"（新建查询）**
3. 复制 `supabase/schema.sql` 文件的全部内容并粘贴到编辑器中
4. 点击 **"Run"（运行）**（或按 Ctrl/Cmd + Enter）
5. 应该看到 "Success. No rows returned"（成功，无返回行）

### 步骤 3：（可选）添加初始数据

1. 仍在 SQL Editor 中，创建另一个 **"New Query"（新建查询）**
2. 复制 `supabase/seed.sql` 的内容并粘贴
3. 点击 **"Run"（运行）**
4. 这将填充全部 34 个省份和一个初始纪念日数据

### 步骤 4：获取 API 凭证

1. 前往 **Settings（设置）** → **API**（左侧边栏）
2. 复制以下两个值：
   - **Project URL（项目 URL）**（例如：`https://xxxxx.supabase.co`）
   - **anon public** 密钥（在 "Project API keys" 下）

### 步骤 5：配置环境变量

1. 在项目根目录，将 `.env.example` 复制为 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local` 并粘贴您的凭证：
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=你的anon密钥
   ```

### 步骤 6：启动应用

```bash
npm run dev
```

在浏览器中打开 [http://localhost:5173](http://localhost:5173)。

## ✅ 验证测试

### 检查数据库连接

1. 打开浏览器开发者工具（F12）→ Console（控制台）
2. 刷新页面
3. 应该**没有**关于 Supabase 连接的错误

### 测试 CRUD 操作

#### 1. **时间轴事件**（通过上传足迹）
   - 在时间轴页面点击 **"+"** 按钮
   - 填写省份、城市、日期、备注和照片
   - 点击 **"发布"**
   - ✅ 事件应该出现在时间轴中
   - 刷新页面 → ✅ 事件仍然存在

#### 2. **地图省份**
   - 步骤 1 中的省份应该在地图上点亮
   - 刷新页面 → ✅ 省份保持点亮状态

#### 3. **纪念日**
   - 前往纪念日页面（底部导航栏）
   - 点击右上角的 **"+"**
   - 填写标题、日期、地点、照片
   - 点击 **"确认添加"**
   - ✅ 纪念日出现在列表中
   - 刷新页面 → ✅ 纪念日仍然存在

#### 4. **发现项目**（通过发布）
   - 导航到"发布"页面
   - 选择分类（美食/好物/好店/好玩）
   - 填写详细信息
   - 提交
   - ✅ 项目出现在发现页面
   - 刷新页面 → ✅ 项目仍然存在

## 🔍 故障排除

### 出现 "Missing Supabase environment variables" 警告
- 确保 `.env.local` 文件存在且包含有效凭证
- 创建 `.env.local` 后重启开发服务器

### 数据未持久化
- 检查浏览器控制台是否有错误
- 验证 schema.sql 在 Supabase 中成功运行
- 检查 Supabase Dashboard → Table Editor 查看数据是否被创建

### 加载动画一直显示
- 数据库连接失败
- 检查 Supabase URL 和密钥是否正确
- 验证您的 Supabase 项目是否正在运行（未暂停）

## 📊 数据库结构

- **`timeline_events`（时间轴事件）**: 所有时间轴/日记条目
- **`provinces`（省份）**: 34 个中国行政区及访问状态
- **`discovery_items`（发现项目）**: 美食、好物、好店、好玩的地方
- **`anniversaries`（纪念日）**: 特殊日期和里程碑

## 🔒 安全提示

目前，行级安全（RLS）**已禁用**以便于开发。所有数据无需身份验证即可公开访问。

要在未来启用用户身份验证，您需要：
1. 在所有表上启用 RLS
2. 添加 Supabase Auth
3. 创建策略以限制数据访问

---

**需要帮助？** 查看 [Supabase 文档](https://supabase.com/docs) 或提交 issue！
