# 用户认证集成说明

## 已完成的工作

### 1. SQL Migration (`supabase/auth_migration.sql`)
✅ 创建了数据库迁移文件，包含：
- 为所有表添加 `user_id` 列
- 创建 `user_province_visits` 表（用于用户特定的省份访问记录）
- 启用 RLS（Row Level Security）
- 创建 RLS 策略确保数据隔离

### 2. Auth 服务层
✅ `lib/auth.ts` - Supabase Auth 操作（注册、登录、登出、获取会话）
✅ `lib/useAuth.ts` - React hook 管理认证状态

### 3. UI 组件
✅ `LoginScreen.tsx` - 登录界面
✅ `RegisterScreen.tsx` - 注册界面
✅ 更新 `Layout.tsx` - 显示用户邮箱和登出按钮
✅ 更新 `App.tsx` - 集成认证流程

---

## 需要完成的步骤

### 步骤 1: 在 Supabase 运行 Migration SQL

1. 打开 Supabase Dashboard → **SQL Editor**
2. 点击 **"New Query"**
3. 复制 `supabase/auth_migration.sql` 的全部内容
4. 粘贴并点击 **"Run"**

**重要提示：** 如果您已经有测试数据，有两种选择：

**选项 A - 删除测试数据（推荐用于开发测试）：**
```sql
DELETE FROM timeline_events;
DELETE FROM discovery_items;
DELETE FROM anniversaries;
```

**选项 B - 保留数据并分配给用户：**
```sql
-- 首先注册一个用户获取 user_id
-- 然后替换下面的 'your-user-uuid'
UPDATE timeline_events SET user_id = 'your-user-uuid';
UPDATE discovery_items SET user_id = 'your-user-uuid';
UPDATE anniversaries SET user_id = 'your-user-uuid';
```

### 步骤 2: 启用 Email Auth

1. 在 Supabase Dashboard，前往 **Authentication → Providers**
2. 确保 **Email** provider 已启用
3. （可选）配置 Email 模板：**Authentication → Email Templates**
4. （可选）关闭电子邮件确认：**Authentication → Settings** → 取消勾选 "Enable email confirmations"（仅用于开发测试）

### 步骤 3: 更新数据库操作（需要修改代码）

当前代码还不包含 `user_id`，需要更新 `lib/db.ts`：

#### 修改 Timeline Events

```typescript
// createTimelineEvent 函数中
export async function createTimelineEvent(event: Omit<TimelineEvent, 'id'>, userId: string): Promise<TimelineEvent | null> {
  const { data, error } = await supabase
    .from('timeline_events')
    .insert([{ ...toDbTimelineEvent(event), user_id: userId }])
    .select()
    .single();
  // ...
}
```

#### 修改  Discovery Items

```typescript
export async function createDiscoveryItem(item: Omit<DiscoveryItem, 'id'>, userId: string): Promise<DiscoveryItem | null> {
  const { data, error } = await supabase
    .from('discovery_items')
    .insert([{ ...toDbDiscoveryItem(item), user_id: userId }])
    .select()
    .single();
  // ...
}
```

#### 修改 Anniversaries

```typescript
export async function createAnniversary(ann: Omit<Anniversary, 'id'>, userId: string): Promise<Anniversary | null> {
  const { data, error } = await supabase
    .from('anniversaries')
    .insert([{ ...toDbAnniversary(ann), user_id: userId }])
    .select()
    .single();
  // ...
}
```

#### 修改 Province 更新

省份访问需要使用新的 `user_province_visits` 表：

```typescript
export async function markProvinceVisited(
  userId: string,
  provinceId: string,
  visitDate: string,
  photos: string[]
): Promise<void> {
  const { error } = await supabase
    .from('user_province_visits')
    .upsert({
      user_id: userId,
      province_id: provinceId,
      visit_date: visitDate,
      photos: photos
    });

  if (error) {
    console.error('Error marking province as visited:', error);
  }
}

export async function fetchUserProvinceVisits(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_province_visits')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user province visits:', error);
    return [];
  }

  return data || [];
}
```

### 步骤 4: 更新 App.tsx 的 Handler Functions

所有 CRUD 操作都需要传递 `user.id`：

```typescript
// 在 App.tsx 中
const { user } = useAuth();

// handlePublish
const handlePublish = async (data: Omit<DiscoveryItem, 'id' | 'checked'>) => {
  if (!user) return;
  
  await addItem(newItem, user.id); // 传递 user.id
  await addEvent(newEvent, user.id); // 传递 user.id
  // ...
};

// handleUpload
const handleUpload = async (data: { ... }) => {
  if (!user) return;
  
  await addEvent(newEvent, user.id);
  await markVisited(data.provinceId, { ... }, user.id);
  // ...
};

// 同样更新 handleAddAnniversary
```

---

## 测试步骤

完成以上步骤后：

### 1. 测试注册流程
1. 打开应用（`http://localhost:3000`）
2. 点击 "立即注册"
3. 输入邮箱和密码（至少 6 个字符）
4. 点击 "注册"
5. ✅ 应该看到 "注册成功" 页面

### 2. 测试登录流程
1. 在登录页面输入注册的邮箱和密码
2. 点击 "登录"
3. ✅ 应该进入应用主界面
4. ✅ 顶部应显示您的邮箱地址

### 3. 测试数据隔离
1. 登录用户 A，创建一些数据
2. 登出
3. 注册并登录用户 B
4. ✅ 用户 B 看不到用户 A 的数据

### 4. 测试登出
1. 点击右上角 "退出"
2. ✅ 应该返回登录页面
3. ✅ 刷新页面仍然显示登录页面

---

## 当前状态

- ✅ UI 组件已完成
- ✅ Auth 服务层已完成
- ✅ SQL Migration 已创建
- ⚠️ **需要手动完成：运行 SQL + 修改数据库操作代码**

由于数据库操作的改动较大，我建议您：
1. 先运行 SQL migration
2. 测试基础认证流程（注册/登录/登出）
3. 然后我可以帮您完成数据库操作的更新

---

## 需要帮助？

如果遇到问题，请告诉我您在哪一步遇到了困难，我会进一步指导您！
