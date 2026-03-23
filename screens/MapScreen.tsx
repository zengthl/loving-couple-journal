import React, { lazy, Suspense, useState } from 'react';
import { Menu, X, Upload, BookOpen, Image as ImageIcon, Calendar, Navigation, Play } from 'lucide-react';
import { Province } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';
import { isVideoUrl } from '../lib/media';

interface MapScreenProps {
  provinces: Province[];
  onNavigateToUpload: () => void;
  onNavigateToAlbums: () => void;
  isGuest?: boolean;
}

const MapChart = lazy(() => import('./MapChart').then((module) => ({ default: module.MapChart })));

const ChartFallback = () => (
  <div
    className="absolute z-10 flex items-center justify-center bg-[#fbf8f3]"
    style={{
      top: '180px',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: 'calc(100% - 180px)',
    }}
  >
    <div className="flex flex-col items-center gap-3 text-text-sub">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="text-sm">加载地图中...</span>
    </div>
  </div>
);

export const MapScreen: React.FC<MapScreenProps> = ({ provinces, onNavigateToUpload, onNavigateToAlbums, isGuest }) => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const totalProvinces = 34;
  const visitedCount = provinces.filter((province) => province.visited).length;
  const percentage = Math.round((visitedCount / totalProvinces) * 100);

  const getLevel = (count: number) => {
    if (count >= 34) return 6;
    if (count >= 26) return 5;
    if (count >= 16) return 4;
    if (count >= 9) return 3;
    if (count >= 4) return 2;
    return 1;
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-[#fbf8f3]" style={{ height: '100vh', width: '100%' }}>
      <div className="absolute top-0 left-0 right-0 z-30 pt-12 pb-6 px-6 bg-gradient-to-b from-[#fbf8f3] via-[#fbf8f3]/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex items-end justify-between mb-4">
          <div>
            <h1 className="text-[28px] font-black tracking-tight text-[#4A3B3B] leading-none">我们的足迹</h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">点亮中国，记录每一份爱与旅行</p>
          </div>

          <div className="relative">
            {isGuest && (
              <button
                onClick={onNavigateToAlbums}
                className="absolute right-0 top-0 z-50 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-text-main shadow-sm transition-colors hover:text-primary"
              >
                <BookOpen size={16} />
                相册
              </button>
            )}
            <button
              onClick={() => setShowMenu((current) => !current)}
              className={`${isGuest ? 'invisible pointer-events-none' : ''} relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-colors hover:text-primary`}
            >
              {showMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            {!isGuest && showMenu && (
              <div className="absolute right-0 top-12 z-40 flex min-w-[160px] flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl origin-top-right animate-fade-in">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onNavigateToUpload();
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Upload size={18} />
                  </div>
                  <span className="text-sm font-bold text-text-main">上传足迹</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onNavigateToAlbums();
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                    <BookOpen size={18} />
                  </div>
                  <span className="text-sm font-bold text-text-main">浏览相册</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md transition-transform active:scale-95">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className="text-primary drop-shadow-sm" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" strokeWidth="3" />
            </svg>
            <span className="absolute text-[10px] font-bold text-primary">{percentage}%</span>
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">已点亮 {visitedCount} / {totalProvinces}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">Level {getLevel(visitedCount)}</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-primary transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartFallback />}>
        <MapChart
          provinces={provinces}
          onSelectProvince={(provinceId) => {
            const province = provinces.find((item) => item.id === provinceId);
            if (province?.visited) {
              setSelectedProvince(province);
            }
          }}
        />
      </Suspense>

      {selectedProvince && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div
            className="pointer-events-auto absolute inset-0 animate-fade-in bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={() => setSelectedProvince(null)}
          ></div>

          <div className="pointer-events-auto flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-background-light shadow-2xl animate-slide-up transition-transform sm:h-[800px] sm:rounded-[32px]">
            <div className="relative shrink-0">
              <div className="absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-4">
                <button
                  onClick={() => setSelectedProvince(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-white backdrop-blur-md transition-colors hover:bg-black/20"
                >
                  <X size={20} />
                </button>
                <div className="flex gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-white backdrop-blur-md transition-colors hover:bg-black/20">
                    <Navigation size={20} />
                  </button>
                </div>
              </div>

              <div className="relative h-64 w-full">
                {selectedProvince.photos[0] ? (
                  isVideoUrl(selectedProvince.photos[0]) ? (
                    <video src={selectedProvince.photos[0]} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <OptimizedImage
                      src={selectedProvince.photos[0]}
                      alt="封面"
                      variant="card"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-300">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-black/20"></div>

                <div className="absolute bottom-0 left-0 p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Visited</div>
                    <span className="flex items-center gap-1 rounded bg-black/20 px-2 py-0.5 text-xs font-medium text-white/80 backdrop-blur">
                      <Calendar size={10} /> {selectedProvince.date}
                    </span>
                  </div>
                  <h2 className="flex items-baseline gap-2 text-3xl font-black text-text-main">
                    {selectedProvince.name}
                    <span className="font-sans text-lg font-normal text-text-sub/80">{selectedProvince.enName}</span>
                  </h2>
                </div>
              </div>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto p-6 pt-2">
              <div className="mb-8 flex items-center gap-6 border-b border-gray-100 pb-6">
                <div className="flex flex-col gap-1">
                  <span className="font-display text-2xl font-bold text-text-main">{selectedProvince.photos.length}</span>
                  <span className="text-xs text-text-sub">照片</span>
                </div>
                <div className="h-8 w-px bg-gray-100"></div>
                <div className="flex flex-col gap-1">
                  <span className="font-display text-2xl font-bold text-text-main">1</span>
                  <span className="text-xs text-text-sub">城市</span>
                </div>
              </div>

              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-text-main">
                <ImageIcon size={18} className="text-primary" />
                旅行相册
              </h3>
              <div className="columns-2 gap-3 space-y-3">
                {selectedProvince.photos.map((photo, idx) => (
                  <div key={idx} className="group relative overflow-hidden rounded-xl break-inside-avoid">
                    {isVideoUrl(photo) ? (
                      <div className="relative">
                        <video src={photo} className="w-full object-cover" muted playsInline preload="metadata" />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
                            <Play size={20} className="ml-0.5 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <OptimizedImage src={photo} alt={`旅行照片 ${idx + 1}`} variant="thumb" loading="lazy" decoding="async" className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10"></div>
                  </div>
                ))}
              </div>
              <div className="h-20"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
