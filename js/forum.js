// 论坛核心功能 - 简化版（无需登录）

// 加载帖子
async function loadPosts(category = null) {
    const postsListDiv = document.getElementById('postsList');
    if (!postsListDiv) return;
    
    postsListDiv.innerHTML = '<div class="spinner"></div><p>正在加载帖子...</p>';
    
    try {
        let query = window.supabaseClient
            .from('posts')
            .select('*') // 直接选择所有字段，不再关联用户表
            .order('created_at', { ascending: false });
            
        if (category) {
            query = query.eq('category', category);
        }
        
        const { data: posts, error } = await query;
        
        if (error) throw error;
        
        if (posts && posts.length > 0) {
            renderPosts(posts);
        } else {
            postsListDiv.innerHTML = '<p>暂无帖子，快来发布第一个吧！</p>';
        }
    } catch (error) {
        console.error('加载帖子错误:', error.message);
        postsListDiv.innerHTML = '<p>加载帖子失败，请稍后重试。</p>';
    }
}

// 渲染帖子列表
function renderPosts(posts) {
    const postsListDiv = document.getElementById('postsList');
    if (!postsListDiv) return;
    
    postsListDiv.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item card';
        
        const authorName = post.author_name || '匿名用户'; // 直接使用 author_name 字段
        const category = post.category || 'general';
        const categoryText = getCategoryText(category);
        const postTime = formatTime(post.created_at);
        
        postElement.innerHTML = `
            <span class="category-tag">${categoryText}</span>
            <div class="post-title">${post.title}</div>
            <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            <div class="post-meta">
                <span class="post-author">${authorName}</span>
                <span>${postTime}</span>
                <span>评论: ${post.comment_count || 0}</span>
            </div>
        `;
        
        postsListDiv.appendChild(postElement);
    });
}

// 新的简化发帖函数
async function createPostSimple(title, content, category, authorName) {
    try {
        const { data, error } = await window.supabaseClient
            .from('posts')
            .insert([
                {
                    title: title,
                    content: content,
                    category: category || 'general',
                    author_name: authorName, // 直接存储用户名
                    comment_count: 0,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
            
        if (error) throw error;
        
        return { success: true, post: data[0] };
    } catch (error) {
        console.error('发帖错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 加载单个帖子（用于未来可能需要的详情页）
async function loadPost(postId) {
    try {
        const { data: post, error } = await window.supabaseClient
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();
            
        if (error) throw error;
        
        return { post };
    } catch (error) {
        console.error('加载帖子错误:', error.message);
        return { post: null, error: error.message };
    }
}

// 添加评论（如果需要保留评论功能）
async function addComment(postId, content, authorName) {
    try {
        const { data, error } = await window.supabaseClient
            .from('comments')
            .insert([
                {
                    post_id: postId,
                    content: content,
                    author_name: authorName, // 直接存储评论者名字
                    created_at: new Date().toISOString()
                }
            ]);
            
        if (error) throw error;
        
        // 更新评论计数
        await updateCommentCount(postId);
        
        return { success: true };
    } catch (error) {
        console.error('添加评论错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 更新评论数
async function updateCommentCount(postId) {
    try {
        const { count } = await window.supabaseClient
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);
            
        await window.supabaseClient
            .from('posts')
            .update({ comment_count: count })
            .eq('id', postId);
    } catch (error) {
        console.error('更新评论数错误:', error.message);
    }
}

// 辅助函数：获取分类文本
function getCategoryText(category) {
    const categories = {
        'general': '综合讨论',
        'tech': '技术交流',
        'help': '求助问答',
        'feedback': '反馈建议'
    };
    return categories[category] || category;
}

// 辅助函数：格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 导出函数
window.loadPosts = loadPosts;
window.loadPost = loadPost;
window.createPostSimple = createPostSimple;
window.addComment = addComment;
window.getCategoryText = getCategoryText;
window.formatTime = formatTime;
