// Supabase客户端配置
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';  // 替换为你的Supabase URL
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY_HERE';  // 替换为你的Supabase anon key

// 创建Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 导出供其他文件使用
window.supabaseClient = supabase;

console.log('Supabase客户端已初始化');
