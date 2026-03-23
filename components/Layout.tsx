import React from 'react';
import { CalendarHeart, Home, Images, LogOut, Map, Plus } from 'lucide-react';
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

interface NavButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ active, label, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
      active ? 'text-primary' : 'text-text-sub hover:text-primary'
    }`}
  >
    {children}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeScreen, onNavigate, user, onLogout, isGuest }) => {
  const showBottomNav = !!user && [
    ScreenName.TIMELINE,
    ScreenName.ALBUM_LIST,
    ScreenName.MAP,
    ScreenName.ANNIVERSARY,
    ScreenName.MESSAGE_BOARD,
  ].includes(activeScreen);

  const showUserInfo = !!user && showBottomNav;
  const isAppShell = !!user;

  return (
    <div
      className={`relative mx-auto flex h-full min-h-screen w-full max-w-md flex-col overflow-x-hidden ${
        isAppShell ? 'bg-background-light shadow-2xl' : 'bg-[#09070d] shadow-2xl'
      }`}
    >
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

      <main className={`relative flex-1 ${showBottomNav ? 'overflow-y-auto no-scrollbar pb-24' : 'overflow-hidden pb-0'}`}>
        {children}
      </main>

      {showBottomNav && (
        <nav className="fixed bottom-0 z-50 w-full max-w-md border-t border-gray-100 bg-white/95 px-4 pb-6 pt-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md">
          {isGuest ? (
            <div className="grid grid-cols-4 items-end">
              <NavButton active={activeScreen === ScreenName.TIMELINE} label="动态" onClick={() => onNavigate(ScreenName.TIMELINE)}>
                <Home className="h-6 w-6" strokeWidth={activeScreen === ScreenName.TIMELINE ? 2.5 : 2} />
              </NavButton>
              <NavButton active={activeScreen === ScreenName.ALBUM_LIST} label="相册" onClick={() => onNavigate(ScreenName.ALBUM_LIST)}>
                <Images className="h-6 w-6" strokeWidth={activeScreen === ScreenName.ALBUM_LIST ? 2.5 : 2} />
              </NavButton>
              <NavButton active={activeScreen === ScreenName.MAP} label="足迹" onClick={() => onNavigate(ScreenName.MAP)}>
                <Map className="h-6 w-6" strokeWidth={activeScreen === ScreenName.MAP ? 2.5 : 2} />
              </NavButton>
              <NavButton active={activeScreen === ScreenName.ANNIVERSARY} label="纪念日" onClick={() => onNavigate(ScreenName.ANNIVERSARY)}>
                <CalendarHeart className="h-6 w-6" strokeWidth={activeScreen === ScreenName.ANNIVERSARY ? 2.5 : 2} />
              </NavButton>
            </div>
          ) : (
            <div className="flex items-end justify-between px-2">
              <NavButton active={activeScreen === ScreenName.TIMELINE} label="动态" onClick={() => onNavigate(ScreenName.TIMELINE)}>
                <Home className="h-6 w-6" strokeWidth={activeScreen === ScreenName.TIMELINE ? 2.5 : 2} />
              </NavButton>
              <NavButton active={activeScreen === ScreenName.ALBUM_LIST} label="相册" onClick={() => onNavigate(ScreenName.ALBUM_LIST)}>
                <Images className="h-6 w-6" strokeWidth={activeScreen === ScreenName.ALBUM_LIST ? 2.5 : 2} />
              </NavButton>

              <div className="relative -top-5 flex h-14 w-14 items-center justify-center">
                <button
                  onClick={() => onNavigate(ScreenName.PUBLISH)}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-transform active:scale-95 hover:scale-105"
                >
                  <Plus className="h-8 w-8" strokeWidth={3} />
                </button>
              </div>

              <NavButton active={activeScreen === ScreenName.MAP} label="足迹" onClick={() => onNavigate(ScreenName.MAP)}>
                <Map className="h-6 w-6" strokeWidth={activeScreen === ScreenName.MAP ? 2.5 : 2} />
              </NavButton>
              <NavButton active={activeScreen === ScreenName.ANNIVERSARY} label="纪念日" onClick={() => onNavigate(ScreenName.ANNIVERSARY)}>
                <CalendarHeart className="h-6 w-6" strokeWidth={activeScreen === ScreenName.ANNIVERSARY ? 2.5 : 2} />
              </NavButton>
            </div>
          )}
        </nav>
      )}
    </div>
  );
};
