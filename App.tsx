import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { DiscoveryScreen } from './screens/DiscoveryScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { AnniversaryScreen } from './screens/AnniversaryScreen';
import { MapScreen } from './screens/MapScreen';
import { PublishScreen } from './screens/PublishScreen';
import { UploadScreen } from './screens/UploadScreen';
import { AlbumListScreen } from './screens/AlbumListScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { ScreenName, TimelineEvent, Province, DiscoveryItem, Anniversary } from './types';
import { deleteTimelineEvent, removeImageFromTimelineEvents, removePhotoFromUserProvinces, updateTimelineEvent } from './lib/db';
import { useTimelineEvents, useProvinces, useDiscoveryItems, useAnniversaries } from './lib/hooks';
import { useAuth } from './lib/useAuth';
import { signOut } from './lib/auth';

// --- Fallback Initial Data (used when Supabase is empty or unavailable) ---
const FALLBACK_PROVINCES: Province[] = [
  // Municipalities
  { id: 'beijing', name: '北京', enName: 'Beijing', position: [116.4074, 39.9042], visited: false, photos: [] },
  { id: 'shanghai', name: '上海', enName: 'Shanghai', position: [121.4737, 31.2304], visited: false, photos: [] },
  { id: 'tianjin', name: '天津', enName: 'Tianjin', position: [117.2009, 39.0842], visited: false, photos: [] },
  { id: 'chongqing', name: '重庆', enName: 'Chongqing', position: [106.5516, 29.5630], visited: false, photos: [] },
  // Provinces
  { id: 'sichuan', name: '四川', enName: 'Sichuan', position: [104.0668, 30.5728], visited: false, photos: [] },
  { id: 'guangdong', name: '广东', enName: 'Guangdong', position: [113.2644, 23.1291], visited: false, photos: [] },
  { id: 'hebei', name: '河北', enName: 'Hebei', position: [114.5149, 38.0428], visited: false, photos: [] },
  { id: 'shanxi', name: '山西', enName: 'Shanxi', position: [112.5627, 37.8735], visited: false, photos: [] },
  { id: 'liaoning', name: '辽宁', enName: 'Liaoning', position: [123.4315, 41.8057], visited: false, photos: [] },
  { id: 'jilin', name: '吉林', enName: 'Jilin', position: [125.3235, 43.8170], visited: false, photos: [] },
  { id: 'heilongjiang', name: '黑龙江', enName: 'Heilongjiang', position: [126.6616, 45.7421], visited: false, photos: [] },
  { id: 'jiangsu', name: '江苏', enName: 'Jiangsu', position: [118.7628, 32.0603], visited: false, photos: [] },
  { id: 'zhejiang', name: '浙江', enName: 'Zhejiang', position: [120.1551, 30.2741], visited: false, photos: [] },
  { id: 'anhui', name: '安徽', enName: 'Anhui', position: [117.2906, 31.8669], visited: false, photos: [] },
  { id: 'fujian', name: '福建', enName: 'Fujian', position: [119.2951, 26.0713], visited: false, photos: [] },
  { id: 'jiangxi', name: '江西', enName: 'Jiangxi', position: [115.8579, 28.6829], visited: false, photos: [] },
  { id: 'shandong', name: '山东', enName: 'Shandong', position: [117.1205, 36.6510], visited: false, photos: [] },
  { id: 'henan', name: '河南', enName: 'Henan', position: [113.6253, 34.7466], visited: false, photos: [] },
  { id: 'hubei', name: '湖北', enName: 'Hubei', position: [114.3054, 30.5928], visited: false, photos: [] },
  { id: 'hunan', name: '湖南', enName: 'Hunan', position: [112.9388, 28.2282], visited: false, photos: [] },
  { id: 'hainan', name: '海南', enName: 'Hainan', position: [110.1983, 20.0440], visited: false, photos: [] },
  { id: 'guizhou', name: '贵州', enName: 'Guizhou', position: [106.6302, 26.6477], visited: false, photos: [] },
  { id: 'yunnan', name: '云南', enName: 'Yunnan', position: [102.7100, 25.0453], visited: false, photos: [] },
  { id: 'shaanxi', name: '陕西', enName: 'Shaanxi', position: [108.9398, 34.3416], visited: false, photos: [] },
  { id: 'gansu', name: '甘肃', enName: 'Gansu', position: [103.8264, 36.0594], visited: false, photos: [] },
  { id: 'qinghai', name: '青海', enName: 'Qinghai', position: [101.7782, 36.6171], visited: false, photos: [] },
  { id: 'taiwan', name: '台湾', enName: 'Taiwan', position: [121.5091, 25.0443], visited: false, photos: [] },
  // Autonomous Regions
  { id: 'neimenggu', name: '内蒙古', enName: 'Inner Mongolia', position: [111.7656, 40.8175], visited: false, photos: [] },
  { id: 'guangxi', name: '广西', enName: 'Guangxi', position: [108.3661, 22.8172], visited: false, photos: [] },
  { id: 'xizang', name: '西藏', enName: 'Tibet', position: [91.1172, 29.6469], visited: false, photos: [] },
  { id: 'ningxia', name: '宁夏', enName: 'Ningxia', position: [106.2309, 38.4872], visited: false, photos: [] },
  { id: 'xinjiang', name: '新疆', enName: 'Xinjiang', position: [87.6168, 43.8256], visited: false, photos: [] },
  // SARs
  { id: 'hongkong', name: '香港', enName: 'Hong Kong', position: [114.1694, 22.3193], visited: false, photos: [] },
  { id: 'macau', name: '澳门', enName: 'Macau', position: [113.5439, 22.1987], visited: false, photos: [] }
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>(ScreenName.TIMELINE);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isGuest, setIsGuest] = useState(false);
  const [guestToast, setGuestToast] = useState(false);

  // Auth state
  const { user: authUser, loading: authLoading, isAuthenticated: isRealAuth } = useAuth();

  // For guest mode: use a special constant ID to read the owner's data
  const GUEST_USER_ID = 'guest-visitor';
  const effectiveUserId = isGuest ? GUEST_USER_ID : authUser?.id;
  const isAuthenticated = isRealAuth || isGuest;
  const user = isGuest ? { id: GUEST_USER_ID, email: '访客模式' } : authUser;

  // Show guest toast
  const showGuestToast = () => {
    setGuestToast(true);
    setTimeout(() => setGuestToast(false), 2000);
  };

  // Block write actions for guest
  const guestGuard = (action: () => any) => {
    if (isGuest) {
      showGuestToast();
      return;
    }
    action();
  };

  // Supabase hooks - guest mode fetches ALL data (no user filter), normal mode filters by user
  const { events: timelineEvents, loading: timelineLoading, addEvent, reload: reloadTimeline } = useTimelineEvents(effectiveUserId);
  const { provinces: dbProvinces, loading: provincesLoading, reload: reloadProvinces, markVisited } = useProvinces(effectiveUserId);
  const { items: discoveryItems, loading: discoveryLoading, addItem } = useDiscoveryItems(effectiveUserId);
  const { anniversaries, loading: anniversariesLoading, addAnniversary } = useAnniversaries(effectiveUserId);

  // Handle delete/update timeline event
  const handleDeleteTimelineEvent = async (id: string) => {
    await deleteTimelineEvent(id);
    await reloadTimeline();
  };

  const handleUpdateTimelineEvent = async (id: string, data: Partial<TimelineEvent>) => {
    await updateTimelineEvent(id, data);
    await reloadTimeline();
  };

  const handleSyncDeleteFromTimeline = async (imageUrl: string) => {
    if (!user?.id) return;
    await removePhotoFromUserProvinces(user.id, imageUrl);
    await reloadProvinces();
  };

  const handleSyncDeleteFromAlbum = async (imageUrl: string) => {
    if (!user?.id) return;
    await removeImageFromTimelineEvents(user.id, imageUrl);
    await reloadTimeline();
  };


  // Use fallback provinces if DB is empty
  const provinces = dbProvinces.length > 0 ? dbProvinces : FALLBACK_PROVINCES;

  // Loading state
  const isLoading = authLoading || timelineLoading || provincesLoading || discoveryLoading || anniversariesLoading;

  // Handle logout
  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
      return;
    }
    await signOut();
    window.location.reload();
  };

  // Handle guest login
  const handleGuestLogin = () => {
    setIsGuest(true);
    setActiveScreen(ScreenName.TIMELINE);
  };

  // Handle publishing new item (Food, Goods, Shop, Fun)
  const handlePublish = async (data: Omit<DiscoveryItem, 'id' | 'checked'>) => {
    // 1. Add to Discovery
    const newItem: Omit<DiscoveryItem, 'id'> = {
      ...data,
      checked: false
    };
    await addItem(newItem);

    // 2. Add to Timeline (Sync)
    const dateObj = new Date(data.date);
    const newEvent: Omit<TimelineEvent, 'id'> = {
      date: dateObj.getDate().toString(),
      dayOfWeek: '周' + ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()],
      month: (dateObj.getMonth() + 1) + '月',
      year: dateObj.getFullYear().toString(),
      title: data.title,
      location: data.location,
      images: [data.image],
      note: `[发布${{ food: '美食', goods: '好物', shop: '好店', fun: '好玩' }[data.type]}] ${data.title}`,
      isSpecial: false
    };
    await addEvent(newEvent);

    // 3. Navigate back to Discovery
    setActiveScreen(ScreenName.DISCOVERY);
  };

  // Handle uploading a new footprint (Map)
  const handleUpload = async (data: { provinceId: string; city: string; date: string; note: string; photos: string[] }) => {
    // 1. Update Timeline
    const dateObj = new Date(data.date);
    const newEvent: Omit<TimelineEvent, 'id'> = {
      date: dateObj.getDate().toString(),
      dayOfWeek: '周' + ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()],
      month: (dateObj.getMonth() + 1) + '月',
      year: dateObj.getFullYear().toString(),
      title: data.city + '之旅',
      location: data.city,
      images: data.photos.length > 0 ? data.photos : ['https://source.unsplash.com/random/400x300/?travel'],
      note: data.note,
      isSpecial: true
    };
    await addEvent(newEvent);

    // 2. Update Map (Light up province)
    await markVisited(data.provinceId, data.date.replace(/-/g, '.'), data.photos, data.city);

    // 3. Navigate back to Home (Timeline)
    setActiveScreen(ScreenName.TIMELINE);
  };

  // Handle adding new anniversary
  const handleAddAnniversary = async (title: string, date: string, image?: string, location?: string) => {
    // 1. Add to Anniversary List
    await addAnniversary({ title, date, image, location });

    // 2. Add to Timeline (Sync)
    const dateObj = new Date(date);
    const newEvent: Omit<TimelineEvent, 'id'> = {
      date: dateObj.getDate().toString(),
      dayOfWeek: '周' + ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()],
      month: (dateObj.getMonth() + 1) + '月',
      year: dateObj.getFullYear().toString(),
      title: title,
      location: location || '我们的小世界',
      images: image ? [image] : ['https://source.unsplash.com/random/400x300/?love'],
      note: `纪念日：${title} ❤️`,
      isSpecial: true
    };
    await addEvent(newEvent);
  };

  const renderScreen = () => {
    // Show loading screen
    if (isLoading) {
      return (
        <div className="flex flex-col h-full items-center justify-center bg-background-light">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-text-sub text-sm">加载中...</p>
        </div>
      );
    }

    // Show auth screens if not authenticated
    if (!isAuthenticated) {
      if (authView === 'register') {
        return <RegisterScreen onRegisterSuccess={() => setAuthView('login')} onSwitchToLogin={() => setAuthView('login')} />;
      }
      return <LoginScreen onLoginSuccess={() => { }} onSwitchToRegister={() => setAuthView('register')} onGuestLogin={handleGuestLogin} />;
    }

    switch (activeScreen) {
      case ScreenName.DISCOVERY:
        return <DiscoveryScreen items={discoveryItems} />;
      case ScreenName.TIMELINE:
        return (
          <TimelineScreen
            events={timelineEvents}
            onAddClick={() => guestGuard(() => setActiveScreen(ScreenName.UPLOAD))}
            onDeleteEvent={async (id) => { if (isGuest) { showGuestToast(); return; } await handleDeleteTimelineEvent(id); }}
            onUpdateEvent={async (id, data) => { if (isGuest) { showGuestToast(); return; } await handleUpdateTimelineEvent(id, data); }}
            onDeleteImageSync={handleSyncDeleteFromTimeline}
            isGuest={isGuest}
          />
        );
      case ScreenName.ANNIVERSARY:
        return (
          <AnniversaryScreen
            onBack={() => setActiveScreen(ScreenName.TIMELINE)}
            anniversaries={anniversaries}
            onAddAnniversary={handleAddAnniversary}
            onNavigateToMap={() => setActiveScreen(ScreenName.MAP)}
            userId={user!.id}
          />
        );
      case ScreenName.MAP:
        return (
          <MapScreen
            provinces={provinces}
            onNavigateToUpload={() => guestGuard(() => setActiveScreen(ScreenName.UPLOAD))}
            onNavigateToAlbums={() => setActiveScreen(ScreenName.ALBUM_LIST)}
            isGuest={isGuest}
          />
        );
      case ScreenName.PUBLISH:
        return (
          <PublishScreen
            onBack={() => setActiveScreen(ScreenName.TIMELINE)}
            onPublish={handlePublish}
            userId={user!.id}
          />
        );
      case ScreenName.UPLOAD:
        return (
          <UploadScreen
            provinces={provinces}
            onBack={() => setActiveScreen(ScreenName.MAP)}
            onUpload={handleUpload}
            userId={user!.id}
          />
        );
      case ScreenName.ALBUM_LIST:
        return (
          <AlbumListScreen
            provinces={provinces}
            onBack={() => setActiveScreen(ScreenName.MAP)}
            userId={user!.id}
            onRefresh={reloadProvinces}
            onDeletePhoto={isGuest ? async () => { showGuestToast(); } : handleSyncDeleteFromAlbum}
            isGuest={isGuest}
          />
        );
      default:
        return (
          <TimelineScreen
            events={timelineEvents}
            onAddClick={() => guestGuard(() => setActiveScreen(ScreenName.UPLOAD))}
            onDeleteEvent={async (id) => { if (isGuest) { showGuestToast(); return; } await handleDeleteTimelineEvent(id); }}
            onUpdateEvent={async (id, data) => { if (isGuest) { showGuestToast(); return; } await handleUpdateTimelineEvent(id, data); }}
            onDeleteImageSync={handleSyncDeleteFromTimeline}
            isGuest={isGuest}
          />
        );
    }
  };

  return (
    <>
      <Layout
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          // Block navigation to write-only screens for guests
          if (isGuest && (screen === ScreenName.PUBLISH || screen === ScreenName.UPLOAD)) {
            showGuestToast();
            return;
          }
          setActiveScreen(screen);
        }}
        user={user}
        onLogout={handleLogout}
        isGuest={isGuest}
      >
        {renderScreen()}
      </Layout>

      {/* Guest Toast */}
      {guestToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] bg-black/80 text-white text-sm px-5 py-2.5 rounded-full shadow-lg animate-fade-in backdrop-blur-sm">
          🔒 访客模式下无法操作
        </div>
      )}
    </>
  );
}
