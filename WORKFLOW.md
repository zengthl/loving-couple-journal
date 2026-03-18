# Loving Couple Journal - 开发工作流程

## 项目架构

```
React 19 + TypeScript + Vite 6 + Supabase
```

## 部署链路

```
本地开发 (Vite :3000)
    ↓ git push
GitHub (zengthl/loving-couple-journal)
    ↓ 自动触发
Vercel 部署
    ↓ 绑定域名
Cloudflare DNS → www.zthldyq.top
```

## 开发环境

| 环节 | 地址/位置 | 备注 |
|------|-----------|------|
| 本地开发 | http://localhost:3000 | `npm run dev` |
| GitHub | zengthl/loving-couple-journal | MCP 自动管理 |
| Vercel | 自动部署 | 推送即部署 |
| Cloudflare | www.zthldyq.top | DNS-only |
| Supabase | nstlefmsfvmoeuhgnvhq.supabase.co | MCP 自动管理 |

## 环境变量

**本地 `.env.local`:**
```
VITE_SUPABASE_URL=https://nstlefmsfvmoeuhgnvhq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_EYGfzCjgT3kloGw5pE4KbA_nL_tf1Rn
```

**Vercel (需手动配置一次):**
- Settings → Environment Variables → 添加同上两个变量
- 修改后需 Redeploy

## 日常开发流程

### 1. 前端功能开发

```
用户: "帮我实现 XXX 功能"

Claude 执行:
├── 1. 分析需求，读取相关文件
├── 2. 创建/修改代码文件
├── 3. 验证本地构建 (npm run build)
├── 4. 代码审查 (code-reviewer agent)
└── 5. Git commit + push
```

### 2. 数据库变更

```
用户: "我需要修改数据库 XXX"

Claude 执行:
├── 1. 读取现有迁移文件 (supabase/migrations/)
├── 2. 编写新迁移 SQL (编号续增)
├── 3. 通过 Supabase MCP 执行 SQL
├── 4. 验证表结构变更
├── 5. 更新迁移追踪表
└── 6. Git commit + push
```

### 3. Bug 修复

```
用户: "XXX 有问题"

Claude 执行:
├── 1. 定位问题文件
├── 2. 分析根因
├── 3. 修复代码
├── 4. 验证修复 (构建 + 测试)
└── 5. Git commit + push
```

## Git 工作流

### Commit 格式

```
<type>: <description>

<optional body>
```

**Types:**
- `feat` - 新功能
- `fix` - 修复 bug
- `refactor` - 重构
- `chore` - 维护性工作
- `docs` - 文档更新

### 分支策略

- 直接 push 到 `main`（触发 Vercel 自动部署）
- 无需 feature 分支

### Claude 自动执行

```
1. git add <changed files>
2. git commit -m "feat: description"
3. git push
4. Vercel 自动部署
```

## 数据库迁移规范

### 文件命名

```
supabase/migrations/NNN_description.sql
```

- NNN: 三位数序号，从 000 开始递增
- description: 简短英文描述，用下划线连接

### 迁移文件结构

```sql
-- Migration NNN: 功能描述
-- Depends on: 之前依赖的迁移编号
-- Created: YYYY-MM-DD

-- SQL 内容
-- 使用 IF NOT EXISTS / IF EXISTS 保证幂等性
```

### 迁移追踪

每次执行迁移后，记录到追踪表：

```sql
INSERT INTO schema_migrations (version, name, notes)
VALUES ('NNN', 'description', '备注');
```

查看已应用的迁移：

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

### 现有迁移清单

| # | 文件 | 说明 |
|---|------|------|
| 000 | `000_migration_tracking.sql` | 迁移追踪表 |
| 001 | `001_create_base_tables.sql` | 创建 4 个基础表 |
| 002 | `002_seed_provinces.sql` | 34 个省份数据 |
| 003 | `003_seed_sample_anniversary.sql` | 示例纪念日 |
| 004 | `004_add_auth_and_rls.sql` | 用户认证 + RLS |
| 005 | `005_setup_storage.sql` | 存储桶 + 存储策略 |
| 006 | `006_rls_public_read.sql` | 公开读取策略 |
| 007 | `007_add_city_column.sql` | 城市列 |
| 008 | `008_support_multi_city.sql` | 多城市支持 |

## MCP 工具清单

### GitHub MCP

- `mcp__github__get_file_contents` - 读取仓库文件
- `mcp__github__create_or_update_file` - 创建/更新文件
- `mcp__github__list_commits` - 查看提交历史
- `mcp__github__create_pull_request` - 创建 PR
- `mcp__github__search_code` - 搜索代码
- `mcp__github__get_pull_request_status` - 检查 PR 状态
- `mcp__github__create_issue` - 创建 Issue
- `mcp__github__list_issues` - 查看 Issues

### Supabase MCP

- `mcp__supabase__execute_sql` - 执行 SQL 查询
- `mcp__supabase__apply_migration` - 应用 DDL 迁移
- `mcp__supabase__list_tables` - 查看表结构
- `mcp__supabase__get_advisors` - 安全/性能审计
- `mcp__supabase__list_migrations` - 查看迁移历史
- `mcp__supabase__get_logs` - 查看日志
- `mcp__supabase__list_edge_functions` - Edge Functions

## 常用命令

```bash
# 本地开发
npm run dev          # 启动开发服务器 (端口 3000)
npm run build        # 生产构建
npm run preview      # 预览构建结果

# Git 操作 (Claude 自动执行)
git add .
git commit -m "type: description"
git push
```

## 安全规范

### 禁止事项

- 禁止在代码中硬编码 API Key
- 禁止提交 `.env.local` 到 Git（已在 .gitignore 中）
- 禁止在前端暴露 Supabase Service Role Key

### 允许的环境变量

- `VITE_SUPABASE_URL` - Supabase 项目 URL（公开）
- `VITE_SUPABASE_ANON_KEY` - Supabase 匿名 Key（公开，受 RLS 保护）

## 故障排查

### 本地开发问题

```bash
# 清除缓存重试
rm -rf node_modules .vite
npm install
npm run dev
```

### Vercel 部署失败

1. 检查 Vercel Dashboard 的 Build Logs
2. 本地运行 `npm run build` 验证
3. 确认环境变量已配置

### 数据库问题

1. 检查迁移是否按顺序应用
2. 查看 `schema_migrations` 表
3. 检查 RLS 策略是否正确

---

*最后更新: 2026-03-18*
