import React from 'react';
import { Home, Compass, Map, CalendarHeart, User, Plus } from 'lucide-react';
import { LogOut } from 'lucide-react';
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
  // Hide bottom nav for detail screens and auth screens
  const showBottomNav = user && [ScreenName.DISCOVERY, ScreenName.TIMELINE, ScreenName.MAP, ScreenName.PROFILE].includes(activeScreen);
  const showUserInfo = user && showBottomNav;

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light shadow-2xl">
      {/* User Info Header */}
      {showUserInfo && (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm">{isGuest ? '👁️' : '❤️'}</span>
            </div>
            {isGuest ? (
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">访客模式</span>
            ) : (
              <span className="text-sm font-medium text-text-sub truncate max-w-[200px]">{user?.email}</span>
            )}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-xs font-medium text-text-sub hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              <LogOut size={14} />
              {isGuest ? '退出浏览' : '退出'}
            </button>
          )}
        </div>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        {children}
      </main>

      {showBottomNav && (
        <nav className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-between items-end px-6 pb-6 pt-2 z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => onNavigate(ScreenName.TIMELINE)}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${activeScreen === ScreenName.TIMELINE ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
          >
            <Home className="w-6 h-6" strokeWidth={activeScreen === ScreenName.TIMELINE ? 2.5 : 2} />
            <span className="text-[10px] font-medium">首页</span>
          </button>

          <button
            onClick={() => onNavigate(ScreenName.DISCOVERY)}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${activeScreen === ScreenName.DISCOVERY ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
          >
            <Compass className="w-6 h-6" strokeWidth={activeScreen === ScreenName.DISCOVERY ? 2.5 : 2} />
            <span className="text-[10px] font-medium">发现</span>
          </button>

          {/* Floating Action Button - Center */}
          <div className="relative -top-5">
            <button
              onClick={() => onNavigate(ScreenName.PUBLISH)}
              className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-95 hover:scale-105 ${isGuest
                  ? 'bg-gray-300 text-gray-500 shadow-gray-200/40 cursor-not-allowed'
                  : 'bg-primary text-white shadow-primary/40'
                }`}
            >
              <Plus className="w-8 h-8" strokeWidth={3} />
            </button>
          </div>

          <button
            onClick={() => onNavigate(ScreenName.MAP)}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${activeScreen === ScreenName.MAP ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
          >
            <Map className="w-6 h-6" strokeWidth={activeScreen === ScreenName.MAP ? 2.5 : 2} />
            <span className="text-[10px] font-medium">足迹</span>
          </button>

          <button
            onClick={() => onNavigate(ScreenName.ANNIVERSARY)}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 ${activeScreen === ScreenName.ANNIVERSARY ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
          >
            <CalendarHeart className="w-6 h-6" strokeWidth={activeScreen === ScreenName.ANNIVERSARY ? 2.5 : 2} />
            <span className="text-[10px] font-medium">纪念日</span>
          </button>
        </nav>
      )}
    </div>
  );
};
