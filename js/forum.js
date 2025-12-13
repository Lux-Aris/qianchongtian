// 论坛核心功能

// 加载帖子
async function loadPosts(category = null) {
    const postsListDiv = document.getElementById('postsList');
    if (!postsListDiv) return;
    
    postsListDiv.innerHTML = '<div class="spinner"></div><p>正在加载帖子...</p>';
    
    try {
        let query = supabaseClient
            .from('posts')
            .select(`
                *,
                profiles:user_id (username)
            `)
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
        
        const authorName = post.profiles?.username || '匿名用户';
        const category = post.category || 'general';
        const categoryText = getCategoryText(category);
        
        // 格式化时间
        const postTime = formatTime(post.created_at);
        
        postElement.innerHTML = `
            <span class="category-tag">${categoryText}</span>
            <a href="topic.html?id=${post.id}" class="post-title">${post.title}</a>
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

// 加载单个帖子
async function loadPost(postId) {
    try {
        // 获取帖子
        const { data: post, error: postError } = await supabaseClient
            .from('posts')
            .select(`
                *,
                profiles:user_id (username)
            `)
            .eq('id', postId)
            .single();
            
        if (postError) throw postError;
        
        // 获取评论
        const { data: comments, error: commentsError } = await supabaseClient
            .from('comments')
            .select(`
                *,
                profiles:user_id (username)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
            
        if (commentsError) throw commentsError;
        
        return { post, comments: comments || [] };
    } catch (error) {
        console.error('加载帖子错误:', error.message);
        return { post: null, comments: [], error: error.message };
    }
}

// 创建新帖子
async function createPost(title, content, category = 'general') {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: '请先登录' };
        }
        
        const { data, error } = await supabaseClient
            .from('posts')
            .insert([
                {
                    title,
                    content,
                    category,
                    user_id: user.id,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
            
        if (error) throw error;
        
        return { success: true, post: data[0] };
    } catch (error) {
        console.error('创建帖子错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 添加评论
async function addComment(postId, content) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: '请先登录' };
        }
        
        const { data, error } = await supabaseClient
            .from('comments')
            .insert([
                {
                    post_id: postId,
                    content,
                    user_id: user.id,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
            
        if (error) throw error;
        
        // 更新帖子评论数
        await updateCommentCount(postId);
        
        return { success: true, comment: data[0] };
    } catch (error) {
        console.error('添加评论错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 更新评论数
async function updateCommentCount(postId) {
    try {
        // 获取当前评论数
        const { count, error: countError } = await supabaseClient
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);
            
        if (countError) throw countError;
        
        // 更新帖子评论数
        const { error: updateError } = await supabaseClient
            .from('posts')
            .update({ comment_count: count })
            .eq('id', postId);
            
        if (updateError) throw updateError;
        
        return { success: true };
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

// 导出函数供其他文件使用
window.loadPosts = loadPosts;
window.loadPost = loadPost;
window.createPost = createPost;
window.addComment = addComment;
window.getCategoryText = getCategoryText;
window.formatTime = formatTime;
