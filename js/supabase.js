// Supabase客户端配置
const SUPABASE_URL = 'https://roiwcognyukhwnfqqams.supabase.co';  // 替换为你的Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaXdjb2dueXVraHduZnFxYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjUyNzIsImV4cCI6MjA4MTIwMTI3Mn0.1SbFGwxZM4gFWel8S869rJLk7Yz5ZhJH7VggWEHIL1Q';  // 替换为你的Supabase anon key

// 创建Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 导出供其他文件使用
window.supabaseClient = supabase;

console.log('Supabase客户端已初始化');
