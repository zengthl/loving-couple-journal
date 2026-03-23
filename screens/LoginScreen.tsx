import React, { useState } from 'react';
import {
  ArrowRight,
  Heart,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Menu,
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
    <span className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-white/58 uppercase">
      {label}
    </span>
    <div className="flex items-center gap-3 rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-white/92">
      <Icon size={18} className="text-white/48" />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="w-full bg-transparent text-[15px] outline-none placeholder:text-white/36"
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
        className="landing-portrait-image absolute inset-0 h-full w-full object-cover"
      />
      <div className="landing-grain absolute inset-0 opacity-30" />
      <div className="landing-vignette absolute inset-0" />
      <div className="landing-glow absolute -left-10 top-[18%] h-44 w-44 rounded-full bg-[#8f7fe8]/18 blur-3xl" />
      <div className="landing-glow absolute right-0 top-[8%] h-52 w-52 rounded-full bg-[#f7a9c8]/28 blur-3xl [animation-delay:-4s]" />

      <span className="pointer-events-none absolute left-16 top-[14%] z-10 text-white/22">
        <Heart size={18} className="fill-current" />
      </span>
      <span className="pointer-events-none absolute right-9 top-[40%] z-10 text-[#f4a2c3]/60">
        <Heart size={13} className="fill-current" />
      </span>
      <span className="pointer-events-none absolute bottom-[23%] left-10 z-10 text-white/14">
        <div className="grid grid-cols-4 gap-[3px]">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className="h-[3px] w-[3px] rounded-full bg-current" />
          ))}
        </div>
      </span>

      <button
        type="button"
        onClick={() => (isAuthOpen ? closePanel() : openPanel('login'))}
        className="landing-instruction absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/18 px-4 py-2 text-[12px] font-semibold tracking-[0.14em] text-white/92"
      >
        {isAuthOpen ? <X size={16} /> : <Menu size={16} />}
        <span>{isAuthOpen ? '收起' : '登录'}</span>
      </button>

      <main className="relative z-10 flex min-h-[100svh] flex-col px-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
        <div className="pt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.28em] text-white/90 uppercase backdrop-blur-md">
            <Heart size={13} className="fill-current" />
            LOVING
          </div>
        </div>

        <div className="mt-auto pb-10">
          <div className="mx-auto max-w-[18rem] animate-[fadeIn_0.9s_ease-out]">
            <h1 className="text-[3.7rem] leading-[0.88] text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.25)] [font-family:'Dancing_Script','Times_New_Roman',cursive]">
              Our Forever
              <span className="block">Begins Here</span>
            </h1>

            <p className="mt-4 text-[14px] leading-7 text-white/86 [font-family:'Manrope','Noto_Sans_SC',sans-serif]">
              A quiet space for our loudest laughs
              <br />
              and softest whispers.
            </p>

            <div className="mt-9 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openPanel('login')}
                className="inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-full bg-[#b5337f] px-5 py-4 text-[13px] font-semibold tracking-[0.1em] text-white shadow-[0_18px_45px_rgba(181,51,127,0.35)] transition-transform hover:scale-[1.02]"
              >
                <LogIn size={16} />
                账号登录
              </button>

              <button
                type="button"
                onClick={() => openPanel('register')}
                className="inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-full border border-white/16 bg-white/10 px-5 py-4 text-[13px] font-semibold tracking-[0.1em] text-white backdrop-blur-md transition-transform hover:scale-[1.02]"
              >
                <UserPlus size={16} />
                注册
              </button>
            </div>

            <button
              type="button"
              onClick={onGuestLogin}
              className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-white/86 transition-colors hover:text-white"
            >
              访客登录
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <footer className="pb-2 text-center text-white/68 [font-family:'Manrope','Noto_Sans_SC',sans-serif]">
          <div className="text-sm font-semibold">Kinetic Love Letter</div>
          <div className="mt-3 flex items-center justify-center gap-5 text-[13px]">
            <span>Our Story</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <div className="mt-3 text-[12px] text-white/54">© 2024 Kinetic Love Letter. All rights reserved.</div>
        </footer>
      </main>

      {isAuthOpen && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-end bg-[rgba(6,5,12,0.32)] px-4 pb-4 pt-[calc(max(1rem,env(safe-area-inset-top))+3rem)] backdrop-blur-[2px]"
          onClick={closePanel}
        >
          <div
            className="landing-panel w-[min(22rem,calc(100vw-2rem))] rounded-[30px] p-5 text-left text-white animate-[panelRise_0.35s_cubic-bezier(0.22,1,0.36,1)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-white/55 uppercase">
                {mode === 'login' ? 'Welcome Back' : 'Create Your Place'}
              </p>
              <h2 className="mt-2 text-[1.75rem] font-bold tracking-[-0.04em] text-white [font-family:'Noto_Serif_SC','Noto_Sans_SC',serif]">
                {mode === 'login' ? '登录 Loving' : '注册 Loving'}
              </h2>
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
              <div className="mb-4 rounded-[20px] border border-red-300/20 bg-red-500/12 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-[20px] border border-emerald-300/20 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100">
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
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
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
              onClick={() => {
                closePanel();
                onGuestLogin();
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/72 transition-colors hover:text-white"
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
