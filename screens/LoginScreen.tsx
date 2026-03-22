import React, { useState } from 'react';
import {
  ArrowRight,
  Heart,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Sparkles,
  UserPlus,
  X,
  type LucideIcon,
} from 'lucide-react';
import { signIn, signUp } from '../lib/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onGuestLogin: () => void;
}

type AuthMode = 'login' | 'register';

interface AuthFieldProps {
  icon: LucideIcon;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  minLength?: number;
}

const VALID_INVITE_CODE = '250323';

const AuthField: React.FC<AuthFieldProps> = ({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold tracking-[0.24em] text-white/55 uppercase">
      {label}
    </span>
    <div className="flex items-center gap-3 rounded-[24px] border border-white/12 bg-white/8 px-4 py-3 text-white/92">
      <Icon size={18} className="text-white/50" />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="w-full bg-transparent text-[15px] outline-none placeholder:text-white/35"
      />
    </div>
  </label>
);

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
    if (loading) {
      return;
    }
    setIsAuthOpen(false);
    resetMessages();
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();
    setLoading(true);

    const { user, error: authError } = await signIn(email.trim(), password);

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? '邮箱或密码不正确。' : '登录失败，请稍后再试。');
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
      setError('邀请码不正确，请确认后再试。');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致。');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要 6 位。');
      return;
    }

    setLoading(true);

    const { user, error: authError } = await signUp(email.trim(), password);

    if (authError) {
      setError(authError.message.includes('already registered') ? '这个邮箱已经注册过了。' : '注册失败，请稍后再试。');
      setLoading(false);
      return;
    }

    if (user) {
      setMode('login');
      setSuccessMessage('注册成功，现在可以直接登录了。');
      setInviteCode('');
      setConfirmPassword('');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#09070d] text-white">
      <img
        src="/assets/landing-hero.jpg"
        alt="黄昏海边牵手的背影"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="landing-grain absolute inset-0 opacity-35" />
      <div className="landing-vignette absolute inset-0" />
      <div className="landing-glow absolute -left-20 top-[28%] h-52 w-52 rounded-full bg-[#b98bff]/18 blur-3xl" />
      <div className="landing-glow absolute -right-12 top-16 h-64 w-64 rounded-full bg-[#ffb4c8]/25 blur-3xl [animation-delay:-5s]" />

      <span className="landing-particle absolute left-[12%] top-[20%] h-2 w-2 rounded-full bg-white/45 [animation-delay:-1s]" />
      <span className="landing-particle absolute left-[84%] top-[30%] h-3 w-3 rounded-full bg-[#ffd2de]/45 [animation-delay:-3s]" />
      <span className="landing-particle absolute left-[22%] top-[72%] h-2.5 w-2.5 rounded-full bg-[#d8c7ff]/40 [animation-delay:-5s]" />

      <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-10 text-center">
        <div className="w-full max-w-3xl animate-[fadeIn_1s_ease-out]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.28em] text-white/90 uppercase shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-md">
            <Heart size={14} className="fill-current" />
            Loving
          </div>

          <h1 className="mt-10 font-script text-[3.9rem] leading-[0.9] text-white drop-shadow-[0_10px_32px_rgba(0,0,0,0.38)] sm:text-[5.8rem]">
            Our Forever
            <span className="block">Begins Here</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-white/82 sm:text-lg sm:leading-8">
            A quiet space for our loudest laughs and softest whispers.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => openPanel('login')}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full bg-[#a62f75] px-8 py-4 text-sm font-bold tracking-[0.18em] text-white uppercase shadow-[0_18px_48px_rgba(166,47,117,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#972168]"
            >
              <LogIn size={18} />
              账号登录
            </button>

            <button
              type="button"
              onClick={() => openPanel('register')}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-bold tracking-[0.18em] text-white uppercase backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/16"
            >
              <UserPlus size={18} />
              立即注册
            </button>
          </div>

          <button
            type="button"
            onClick={onGuestLogin}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium tracking-[0.18em] text-white/82 uppercase transition-colors duration-300 hover:text-white"
          >
            访客登录
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="landing-panel absolute bottom-28 left-6 hidden max-w-[250px] rounded-[28px] p-5 text-left text-white/88 md:block">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white">
              <Sparkles size={18} />
            </div>
            <div className="space-y-1">
              <span className="block text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
                New Memory
              </span>
              <p className="text-sm leading-6 text-white/85">
                The way you looked at the horizon tonight.
              </p>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6 text-xs text-white/62 sm:flex-row sm:justify-between sm:px-10">
          <div className="font-semibold tracking-[0.14em] uppercase text-white/80">Loving</div>
          <div className="text-white/58">Every wave remembers us.</div>
        </footer>
      </main>

      {isAuthOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-[rgba(7,6,14,0.45)] px-4 py-4 backdrop-blur-sm sm:items-center"
          onClick={closePanel}
        >
          <div
            className="landing-panel w-full max-w-md rounded-[32px] p-5 text-left text-white animate-[panelRise_0.35s_cubic-bezier(0.22,1,0.36,1)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-white/55 uppercase">
                  {mode === 'login' ? 'Welcome back' : 'Create your place'}
                </p>
                <h2 className="mt-2 text-[1.9rem] font-bold tracking-[-0.04em] text-white">
                  {mode === 'login' ? '登录 Loving' : '注册 Loving'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closePanel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/80 transition-colors hover:bg-white/14 hover:text-white"
                aria-label="关闭登录面板"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-2 rounded-full bg-white/8 p-1">
              <button
                type="button"
                onClick={() => openPanel('login')}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === 'login' ? 'bg-white text-[#211633]' : 'text-white/72 hover:text-white'
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => openPanel('register')}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === 'register' ? 'bg-white text-[#211633]' : 'text-white/72 hover:text-white'
                }`}
              >
                注册
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-[22px] border border-red-300/20 bg-red-500/12 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-[22px] border border-emerald-300/20 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100">
                {successMessage}
              </div>
            )}

            {mode === 'login' ? (
              <form className="space-y-4" onSubmit={handleLogin}>
                <AuthField
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="your@email.com"
                  autoComplete="email"
                />

                <AuthField
                  icon={Lock}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="至少 6 位密码"
                  autoComplete="current-password"
                  minLength={6}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold tracking-[0.18em] text-[#241733] uppercase transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  登录进入
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleRegister}>
                <AuthField
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="your@email.com"
                  autoComplete="email"
                />

                <AuthField
                  icon={KeyRound}
                  label="Invite"
                  type="text"
                  value={inviteCode}
                  onChange={setInviteCode}
                  placeholder="输入邀请码"
                />

                <AuthField
                  icon={Lock}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="至少 6 位密码"
                  autoComplete="new-password"
                  minLength={6}
                />

                <AuthField
                  icon={UserPlus}
                  label="Confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="再次输入密码"
                  autoComplete="new-password"
                  minLength={6}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold tracking-[0.18em] text-[#241733] uppercase transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  完成注册
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={onGuestLogin}
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              先以访客模式浏览
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
