import React, { useState } from 'react';
import { ArrowRight, Heart, KeyRound, Loader2, Lock, Mail, Menu, UserPlus, X } from 'lucide-react';
import { signIn, signUp } from '../lib/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onGuestLogin: () => void;
}

type AuthMode = 'login' | 'register';

const VALID_INVITE_CODE = '250323';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onGuestLogin }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
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

  const openPanel = (nextMode: AuthMode) => {
    resetMessages();
    setMode(nextMode);
    setIsAuthOpen(true);
  };

  const closePanel = () => {
    setIsAuthOpen(false);
    resetMessages();
  };

  const handleGuestEntry = () => {
    if (loading || isAuthOpen) {
      return;
    }
    onGuestLogin();
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
      return;
    }

    setLoading(false);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (inviteCode.trim() !== VALID_INVITE_CODE) {
      setError('邀请码不正确，请确认后再试');
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
      setError(authError.message.includes('already registered') ? '该邮箱已经注册过' : '注册失败，请稍后重试');
      setLoading(false);
      return;
    }

    if (user) {
      setMode('login');
      setSuccessMessage('注册成功，请直接登录');
      setInviteCode('');
      setConfirmPassword('');
    }

    setLoading(false);
  };

  return (
    <div
      className="relative flex min-h-[100svh] overflow-hidden bg-[#100f1e] text-white"
      onClick={handleGuestEntry}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !isAuthOpen && !loading) {
          event.preventDefault();
          onGuestLogin();
        }
      }}
    >
      <div className="landing-sunset absolute inset-0" />
      <div className="landing-grain absolute inset-0 opacity-40" />
      <div className="landing-orb absolute -left-12 top-24 h-56 w-56 rounded-full bg-[#ff8db7]/25 blur-3xl" />
      <div className="landing-orb landing-orb-right absolute right-[-5rem] top-[-1rem] h-72 w-72 rounded-full bg-[#ffb39f]/30 blur-3xl" />
      <div className="landing-haze absolute inset-x-0 bottom-0 h-[42%]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0d1120] via-[#12172a]/75 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-16 h-px bg-white/10" />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (isAuthOpen) {
            closePanel();
          } else {
            openPanel('login');
          }
        }}
        className="absolute right-5 top-5 z-30 inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/20 px-4 py-2 text-sm font-medium text-white/92 backdrop-blur-xl transition-all hover:bg-black/30"
      >
        {isAuthOpen ? <X size={16} /> : <Menu size={16} />}
        <span>{isAuthOpen ? '收起' : '登录 / 注册'}</span>
      </button>

      {isAuthOpen && (
        <div
          className="absolute right-5 top-20 z-30 max-h-[calc(100svh-6rem)] w-[min(22rem,calc(100vw-2.5rem))] overflow-y-auto rounded-[28px] border border-white/12 bg-[rgba(10,12,22,0.62)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-5 flex items-center gap-2 rounded-full bg-white/8 p-1">
            <button
              type="button"
              onClick={() => openPanel('login')}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-[#211633]' : 'text-white/70 hover:text-white'}`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => openPanel('register')}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white text-[#211633]' : 'text-white/70 hover:text-white'}`}
            >
              注册
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {successMessage}
            </div>
          )}

          {mode === 'login' ? (
            <form className="space-y-3" onSubmit={handleLogin}>
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-white/45 uppercase">
                  <Mail size={14} />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-white/45 uppercase">
                  <Lock size={14} />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="至少 6 位密码"
                  required
                  minLength={6}
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#241733] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                进入日记
              </button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleRegister}>
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-white/45 uppercase">
                  <Mail size={14} />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-white/45 uppercase">
                  <KeyRound size={14} />
                  Invite
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value)}
                  placeholder="输入邀请码"
                  required
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-white/45 uppercase">
                  <Lock size={14} />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="至少 6 位密码"
                  required
                  minLength={6}
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-white/45 uppercase">
                  <UserPlus size={14} />
                  Confirm
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="再次输入密码"
                  required
                  minLength={6}
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#241733] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                创建账户
              </button>
            </form>
          )}
        </div>
      )}

      <div className="relative z-10 flex min-h-[100svh] w-full flex-col px-6 pb-10 pt-20 sm:px-8">
        <div className="pointer-events-none mt-auto max-w-[18rem] animate-[fadeIn_0.8s_ease-out]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11px] font-medium tracking-[0.26em] text-white/78 uppercase backdrop-blur-md">
            <Heart size={14} className="fill-current" />
            Loving Journal
          </div>

          <h1 className="font-display text-[3.4rem] font-black leading-[0.92] tracking-[-0.05em] text-white sm:text-[4.3rem]">
            Loving
          </h1>

          <p className="mt-4 max-w-[16rem] text-[15px] leading-7 text-white/78">
            把晚霞、海风、争吵和心动都留在这里。现在先轻触屏幕，直接进入属于你们的恋爱日记。
          </p>

          <div className="mt-7 inline-flex items-center gap-3 rounded-full bg-white/9 px-4 py-2.5 text-sm text-white/85 backdrop-blur-md">
            <span className="landing-pulse inline-block h-2.5 w-2.5 rounded-full bg-[#ffb3c9]" />
            {isAuthOpen ? '右上角可切换登录或注册' : '轻触任意位置，先以访客模式进入'}
          </div>
        </div>

        <div className="pointer-events-none mt-14 flex items-end justify-between text-white/45">
          <div>
            <p className="text-[11px] tracking-[0.32em] uppercase">Guest Entry</p>
            <p className="mt-2 text-sm">默认进入访客模式，登录入口已收纳到右上角。</p>
          </div>
          <div className="landing-wave-strip h-16 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
};
