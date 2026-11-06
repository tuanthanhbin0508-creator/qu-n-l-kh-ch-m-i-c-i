import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, Sparkles, Building2, HeartHandshake } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Tài khoản hoặc mật khẩu không chính xác.');
        setIsLoading(false);
        return;
      }

      // Store token in sessionStorage ONLY (destroyed when tab or browser closes)
      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('auth_user', data.username);
      
      onLoginSuccess(data.token, data.username);
    } catch (err: any) {
      setError('Lỗi kết nối máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-amber-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Top Brand Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-500/25 mb-3">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            QUẢN LÝ KHÁCH MỜI
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Hệ thống Quản lý Khách mời & Chi tiêu Đám cưới
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          {/* Security Banner like a Banking App */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-6 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 leading-relaxed">
              <span className="font-semibold block text-emerald-900">Bảo mật chuẩn ngân hàng:</span>
              Phiên làm việc tạm thời. Tự động đăng xuất ngay khi bạn đóng tab, đóng trình duyệt hoặc tắt ứng dụng.
            </div>
          </div>

          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-3 animate-fade-in text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Helper hint for default login */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Tài khoản mặc định ban đầu:{' '}
              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">admin</span> /{' '}
              Mật khẩu:{' '}
              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">admin123</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              (Bạn có thể đổi mật khẩu bất kỳ lúc nào trong mục Cài đặt)
            </p>
          </div>
        </div>

        {/* Bottom copyright & features */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p>© QUẢN LÝ KHÁCH MỜI • Hỗ trợ thiết bị máy tính, máy tính bảng & điện thoại</p>
          <p className="text-[11px] text-slate-400">Kết nối lưu trữ Google Sheets • In ấn A4 • Xuất Excel</p>
        </div>
      </div>
    </div>
  );
};
