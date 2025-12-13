-- 创建用户资料表
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建帖子表
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- 启用行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 创建策略：任何人都可以查看帖子
CREATE POLICY "任何人都可以查看帖子" ON posts
    FOR SELECT USING (true);

-- 创建策略：登录用户可以创建帖子
CREATE POLICY "登录用户可以创建帖子" ON posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 创建策略：用户可以编辑自己的帖子
CREATE POLICY "用户可以编辑自己的帖子" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

-- 创建策略：用户可以删除自己的帖子
CREATE POLICY "用户可以删除自己的帖子" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- 创建策略：任何人都可以查看评论
CREATE POLICY "任何人都可以查看评论" ON comments
    FOR SELECT USING (true);

-- 创建策略：登录用户可以创建评论
CREATE POLICY "登录用户可以创建评论" ON comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 创建策略：用户可以编辑自己的评论
CREATE POLICY "用户可以编辑自己的评论" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

-- 创建策略：用户可以删除自己的评论
CREATE POLICY "用户可以删除自己的评论" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- 创建策略：任何人都可以查看用户资料
CREATE POLICY "任何人都可以查看用户资料" ON profiles
    FOR SELECT USING (true);

-- 创建策略：用户可以编辑自己的资料
CREATE POLICY "用户可以编辑自己的资料" ON profiles
    FOR UPDATE USING (auth.uid() = id);
