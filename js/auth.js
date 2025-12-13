// 用户认证功能

// 检查用户是否登录
async function checkAuth() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (user) {
        // 用户已登录，更新UI
        updateUserUI(user);
        return user;
    } else {
        // 用户未登录
        updateUserUI(null);
        return null;
    }
}

// 更新用户界面显示
function updateUserUI(user) {
    const userInfoDiv = document.getElementById('userInfo');
    if (!userInfoDiv) return;
    
    if (user) {
        // 获取用户元数据（用户名）
        const username = user.user_metadata?.username || user.email.split('@')[0];
        const firstLetter = username.charAt(0).toUpperCase();
        
        userInfoDiv.innerHTML = `
            <div class="avatar">${firstLetter}</div>
            <span>${username}</span>
            <a href="#" class="nav-link" id="logoutBtn">退出</a>
        `;
        
        // 添加退出事件
        document.getElementById('logoutBtn').addEventListener('click', async function(e) {
            e.preventDefault();
            await logoutUser();
            window.location.reload();
        });
    } else {
        userInfoDiv.innerHTML = '<a href="login.html" class="nav-link">登录/注册</a>';
    }
}

// 用户登录
async function loginUser(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('登录错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 用户注册
async function registerUser(email, password, username) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                }
            }
        });
        
        if (error) throw error;
        
        // 创建用户资料
        if (data.user) {
            await createUserProfile(data.user.id, username, email);
        }
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('注册错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 创建用户资料
async function createUserProfile(userId, username, email) {
    try {
        const { error } = await supabaseClient
            .from('profiles')
            .insert([
                { 
                    id: userId, 
                    username: username,
                    email: email,
                    created_at: new Date().toISOString()
                }
            ]);
            
        if (error) throw error;
        
        console.log('用户资料创建成功');
    } catch (error) {
        console.error('创建用户资料错误:', error.message);
    }
}

// 用户退出
async function logoutUser() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        console.error('退出错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 获取当前用户
async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

// 导出函数供其他文件使用
window.checkAuth = checkAuth;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
