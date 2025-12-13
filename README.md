# 静态API论坛

这是一个完全静态的HTML论坛，使用Supabase作为后端API服务。

## 功能特点

- 用户注册/登录
- 发布新帖子
- 帖子分类浏览
- 评论功能
- 响应式设计
- 无需服务器，完全静态部署

## 快速开始

### 1. 注册Supabase账户
1. 访问 [supabase.com](https://supabase.com) 注册账户
2. 创建一个新项目
3. 获取API密钥（URL和anon key）

### 2. 设置数据库
1. 在Supabase控制台中，进入SQL编辑器
2. 运行 `setup-database.sql` 中的SQL语句
3. 这将创建所需的表和策略

### 3. 配置项目
1. 将 `js/supabase.js` 中的URL和密钥替换为你自己的
2. 文件位置：`js/supabase.js` 第3-4行

### 4. 运行论坛
1. 直接在浏览器中打开 `index.html`
2. 或使用本地服务器（如VS Code的Live Server扩展）

## 文件结构
