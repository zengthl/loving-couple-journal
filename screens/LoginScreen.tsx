import React, { useState } from 'react';
import {
  ArrowRight,
  Heart,
  KeyRound,
  Loader,
  Lock,
  LogIn,
  Mail,
  UserPlus,
  X,
} from 'lucide-react';
import { signIn, signUp } from '../lib/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onGuestLogin: () => void;
}

type AuthMode = 'login' | 'register';

const VALID_INVITE_CODE = '250323';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onGuestLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleStageClick = () => {
    if (loading) return;

    if (isAuthPanelOpen) {
      setIsAuthPanelOpen(false);
      return;
    }

    onGuestLogin();
  };

  const openAuthPanel = (mode: AuthMode) => {
    resetMessages();
    setAuthMode(mode);
    setIsAuthPanelOpen(true);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();
    setLoading(true);

    const { user, error: authError } = await signIn(email.trim(), password);

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? '邮箱或密码错误' : '登录失败，请稍后重试');
      setLoading(false);
      return;
    }

    if (user) {
      onLoginSuccess();
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (inviteCode.trim() !== VALID_INVITE_CODE) {
      setError('邀请码不正确');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要 6 位');
      return;
    }

    setLoading(true);

    const { user, error: authError } = await signUp(email.trim(), password);

    if (authError) {
      setError(authError.message.includes('already registered') ? '该邮箱已注册' : '注册失败，请稍后重试');
      setLoading(false);
      return;
    }

    if (user) {
      setSuccessMessage('注册成功，请使用新账号登录');
      setAuthMode('login');
      setConfirmPassword('');
      setInviteCode('');
    }

    setLoading(false);
  };

  const renderAuthPanel = () => (
    <div
      className="absolute right-4 top-20 z-40 max-h-[calc(100svh-6rem)] w-[calc(100%-2rem)] max-w-[24rem] overflow-y-auto rounded-[28px] border border-white/20 bg-[rgba(16,14,32,0.54)] p-5 text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)] backdrop-blur-2xl animate-slide-up"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Private Entry</p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {authMode === 'login' ? '登录日记' : '创建账号'}
          </h2>
        </div>
        <button
          onClick={() => setIsAuthPanelOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/80 transition-colors hover:bg-white/12"
          aria-label="关闭登录面板"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/6 p-1">
        <button
          onClick={() => {
            resetMessages();
            setAuthMode('login');
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${authMode === 'login' ? 'bg-white text-[#2a1836]' : 'text-white/60 hover:text-white'}`}
        >
          登录
        </button>
        <button
          onClick={() => {
            resetMessages();
            setAuthMode('register');
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${authMode === 'register' ? 'bg-white text-[#2a1836]' : 'text-white/60 hover:text-white'}`}
        >
          注册
        </button>
      </div>

      <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="mt-5 space-y-3">
        {error && (
          <div className="rounded-2xl border border-red-300/25 bg-red-400/12 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/12 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
          </div>
        )}

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Email</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
            <Mail size={18} className="text-white/45" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
        </label>

        {authMode === 'register' && (
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Invite Code</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
              <KeyRound size={18} className="text-white/45" />
              <input
                type="text"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="输入邀请码"
                required
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
            <Lock size={18} className="text-white/45" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={authMode === 'login' ? '输入密码' : '至少 6 位'}
              required
              minLength={6}
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
        </label>

        {authMode === 'register' && (
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Confirm Password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
              <Lock size={18} className="text-white/45" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="再次输入密码"
                required
                minLength={6}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#2a1836] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin" />
              处理中
            </>
          ) : authMode === 'login' ? (
            <>
              <LogIn size={18} />
              登录
            </>
          ) : (
            <>
              <UserPlus size={18} />
              注册
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-xs leading-6 text-white/42">
        右上角是私人入口。当前封面任何空白处都可以直接进入访客模式。
      </p>
    </div>
  );

  return (
    <div className="auth-dusk-stage relative flex min-h-[100svh] flex-col overflow-hidden text-white" onClick={handleStageClick}>
      <div className="pointer-events-none absolute inset-0">
        <div className="auth-dusk-aurora auth-dusk-aurora-left" />
        <div className="auth-dusk-aurora auth-dusk-aurora-right" />
        <div className="auth-dusk-waterline" />
        <div className="auth-dusk-reflection" />
        <div className="auth-dusk-noise" />
      </div>

      <header className="relative z-30 flex items-start justify-between px-5 pb-4 pt-6">
        <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
              <Heart size={16} className="fill-[#ff7aa2] text-[#ff7aa2]" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.14em] text-white">Loving</p>
              <p className="text-[11px] text-white/50">private couple journal</p>
            </div>
          </div>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            setIsAuthPanelOpen((current) => !current);
          }}
          className="rounded-full border border-white/14 bg-[rgba(18,16,34,0.42)] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors hover:bg-[rgba(18,16,34,0.55)]"
        >
          登录 / 注册
        </button>
      </header>

      {isAuthPanelOpen && renderAuthPanel()}

      <main className="relative z-20 flex flex-1 flex-col justify-center px-6 pb-16 pt-6">
        <div className="max-w-[20rem]">
          <p className="text-xs uppercase tracking-[0.36em] text-white/45">Guest First Experience</p>
          <h1 className="mt-5 text-[3.6rem] font-semibold leading-[0.92] tracking-[-0.08em] text-white sm:text-[4.6rem]">
            Loving
          </h1>
          <p className="mt-5 max-w-[16rem] text-[15px] leading-7 text-white/72">
            暮色、海风和你们的日记。默认不打断画面，轻触任意位置就先进去看看。
          </p>
        </div>

        <div className="mt-10 flex max-w-[16rem] flex-col gap-3 text-sm text-white/68">
          <div className="h-px w-16 bg-white/18" />
          <p>右上角收纳登录与注册，正常状态只保留这张主页封面。</p>
        </div>
      </main>

      <footer className="relative z-20 px-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-md">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">点</span>
          <div>
            <p className="text-sm font-medium text-white">轻触任意位置</p>
            <p className="text-xs text-white/52">直接以访客模式进入</p>
          </div>
          <ArrowRight size={16} className="text-white/60" />
        </div>
      </footer>
    </div>
  );
};
