import React from 'react';
import { Home, Compass, Map, CalendarHeart, Plus, LogOut } from 'lucide-react';
import { ScreenName } from '../types';
import { AuthUser } from '../lib/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  user?: AuthUser | null;
  onLogout?: () => void;
  isGuest?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeScreen, onNavigate, user, onLogout, isGuest }) => {
  const showBottomNav = !!user && [
    ScreenName.DISCOVERY,
    ScreenName.TIMELINE,
    ScreenName.MAP,
    ScreenName.ANNIVERSARY,
  ].includes(activeScreen);
  const showUserInfo = !!user && showBottomNav;

  return (
    <div className="relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-background-light shadow-2xl">
      {showUserInfo && (
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm">
              <span>{isGuest ? '游' : '爱'}</span>
            </div>
            {isGuest ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-sm font-medium text-amber-600">游客模式</span>
            ) : (
              <span className="max-w-[200px] truncate text-sm font-medium text-text-sub">{user?.email}</span>
            )}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-text-sub transition-colors hover:bg-gray-50 hover:text-primary"
            >
              <LogOut size={14} />
              {isGuest ? '退出浏览' : '退出登录'}
            </button>
          )}
        </div>
      )}

      <main className="relative flex-1 overflow-y-auto pb-24 no-scrollbar">
        {children}
      </main>

      {showBottomNav && (
        <nav className="fixed bottom-0 z-50 flex w-full max-w-md items-end justify-between border-t border-gray-100 bg-white/95 px-6 pb-6 pt-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md">
          <button
            onClick={() => onNavigate(ScreenName.TIMELINE)}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${activeScreen === ScreenName.TIMELINE ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
          >
            <Home className="h-6 w-6" strokeWidth={activeScreen === ScreenName.TIMELINE ? 2.5 : 2} />
            <span className="text-[10px] font-medium">首页</span>
          </button>

          <button
            onClick={() => onNavigate(ScreenName.DISCOVERY)}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${activeScreen === ScreenName.DISCOVERY ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
          >
            <Compass className="h-6 w-6" strokeWidth={activeScreen === ScreenName.DISCOVERY ? 2.5 : 2} />
            <span className="text-[10px] font-medium">发现</span>
          </button>

          <div className="relative -top-5">
            <button
              onClick={() => onNavigate(ScreenName.PUBLISH)}
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 hover:scale-105 ${isGuest ? 'cursor-not-allowed bg-gray-300 text-gray-500 shadow-gray-200/40' : 'bg-primary text-white shadow-primary/40'}`}
            >
              <Plus className="h-8 w-8" strokeWidth={3} />
            </button>
          </div>

          <button
            onClick={() => onNavigate(ScreenName.MAP)}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${activeScreen === ScreenName.MAP ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
          >
            <Map className="h-6 w-6" strokeWidth={activeScreen === ScreenName.MAP ? 2.5 : 2} />
            <span className="text-[10px] font-medium">足迹</span>
          </button>

          <button
            onClick={() => onNavigate(ScreenName.ANNIVERSARY)}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${activeScreen === ScreenName.ANNIVERSARY ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
          >
            <CalendarHeart className="h-6 w-6" strokeWidth={activeScreen === ScreenName.ANNIVERSARY ? 2.5 : 2} />
            <span className="text-[10px] font-medium">纪念日</span>
          </button>
        </nav>
      )}
    </div>
  );
};
