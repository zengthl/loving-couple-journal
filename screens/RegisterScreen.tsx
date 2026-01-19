import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader, Check } from 'lucide-react';
import { signUp } from '../lib/auth';

interface RegisterScreenProps {
    onRegisterSuccess: () => void;
    onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('密码至少需要 6 个字符');
            return;
        }

        setLoading(true);

        const { user, error: authError } = await signUp(email, password);

        if (authError) {
            if (authError.message.includes('already registered')) {
                setError('该邮箱已被注册');
            } else {
                setError('注册失败，请稍后重试');
            }
            setLoading(false);
            return;
        }

        if (user) {
            setSuccess(true);
            setTimeout(() => {
                onRegisterSuccess();
            }, 1500);
        } else {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-background-light to-pink-50 items-center justify-center">
                <div className="text-center animate-scale-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                        <Check size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main mb-2">注册成功！</h2>
                    <p className="text-text-sub">即将跳转到登录页面...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-background-light to-pink-50">
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <span className="text-3xl">💑</span>
                        </div>
                        <h1 className="text-3xl font-bold text-text-main mb-2">创建账号</h1>
                        <p className="text-text-sub">开始记录你们的爱情故事</p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
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
                                    placeholder="至少 6 个字符"
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-bold text-text-sub mb-2">确认密码</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub/50" size={20} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="再次输入密码"
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    注册中...
                                </>
                            ) : (
                                <>
                                    注册
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-text-sub text-sm">
                            已有账号？{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-primary font-bold hover:underline"
                            >
                                立即登录
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
