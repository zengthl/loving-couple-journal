import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader, Eye } from 'lucide-react';
import { signIn } from '../lib/auth';

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onSwitchToRegister: () => void;
    onGuestLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onSwitchToRegister, onGuestLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { user, error: authError } = await signIn(email, password);

        if (authError) {
            setError(authError.message === 'Invalid login credentials'
                ? '邮箱或密码错误'
                : '登录失败，请稍后重试');
            setLoading(false);
            return;
        }

        if (user) {
            onLoginSuccess();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-background-light to-pink-50">
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <span className="text-3xl">❤️</span>
                        </div>
                        <h1 className="text-3xl font-bold text-text-main mb-2">欢迎回来</h1>
                        <p className="text-text-sub">登录你的情侣日记</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-bold text-text-sub mb-2">邮箱</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub/50" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-bold text-text-sub mb-2">密码</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub/50" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    登录中...
                                </>
                            ) : (
                                <>
                                    登录
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-text-sub text-sm">
                            还没有账号？{' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="text-primary font-bold hover:underline"
                            >
                                立即注册
                            </button>
                        </p>
                    </div>

                    {/* Guest Mode */}
                    <div className="mt-4">
                        <div className="relative flex items-center justify-center my-3">
                            <div className="border-t border-gray-200 w-full"></div>
                            <span className="bg-transparent px-3 text-xs text-text-sub/60 whitespace-nowrap" style={{ background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb, 255,107,129), 0.02), rgba(255,255,255,0.8), rgba(255,182,193, 0.05))' }}>或者</span>
                            <div className="border-t border-gray-200 w-full"></div>
                        </div>
                        <button
                            onClick={onGuestLogin}
                            className="w-full border-2 border-gray-200 hover:border-primary/30 text-text-sub hover:text-primary font-medium py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Eye size={18} />
                            访客模式浏览
                        </button>
                        <p className="text-center text-xs text-text-sub/50 mt-2">仅可浏览，无法编辑内容</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
