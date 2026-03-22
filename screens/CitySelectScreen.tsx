import React, { useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Trash2, X } from 'lucide-react';
import { CitySummary } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';

interface CitySelectScreenProps {
  provinceName: string;
  cities: CitySummary[];
  onCitySelect: (cityName: string) => void;
  onDeleteCityAlbum?: (city: CitySummary) => Promise<boolean>;
  onBack: () => void;
  isGuest?: boolean;
}

export const CitySelectScreen: React.FC<CitySelectScreenProps> = ({
  provinceName,
  cities,
  onCitySelect,
  onDeleteCityAlbum,
  onBack,
  isGuest
}) => {
  const [activeCity, setActiveCity] = useState<CitySummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDeleteAlbum = useMemo(
    () => !isGuest && typeof onDeleteCityAlbum === 'function',
    [isGuest, onDeleteCityAlbum]
  );

  const handleCityCardClick = (city: CitySummary) => {
    if (canDeleteAlbum) {
      setActiveCity(city);
      return;
    }

    onCitySelect(city.cityName);
  };

  const handleDeleteAlbum = async () => {
    if (!activeCity || !onDeleteCityAlbum) return;

    const confirmed = window.confirm(
      `确定删除“${activeCity.cityName}”相册吗？这会删除该城市下的 ${activeCity.totalPhotos} 张照片。`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await onDeleteCityAlbum(activeCity);
      if (success) {
        setActiveCity(null);
      } else {
        alert('删除失败，请稍后再试');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-background-light to-transparent">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-sub hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">返回</span>
        </button>
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-text-main leading-none">
            {provinceName}
          </h1>
          <p className="text-sm text-text-sub mt-1 font-medium">
            选择城市查看相册
          </p>
        </div>
      </div>

      {/* City Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {cities.map((city) => (
            <button
              key={city.cityName}
              onClick={() => handleCityCardClick(city)}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-card hover:shadow-floating transition-all duration-300"
            >
              {/* Cover Photo */}
              {city.coverPhoto ? (
                <OptimizedImage
                  src={city.coverPhoto}
                  alt={city.cityName}
                  variant="card"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <MapPin size={32} className="text-primary/40" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* City Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg leading-tight">
                  {city.cityName}
                </h3>
                <p className="text-white/70 text-xs mt-1">
                  {city.totalPhotos} 张照片
                  {city.visits.length > 1 && ` · ${city.visits.length} 次到访`}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
            </button>
          ))}
        </div>
      </div>

      {activeCity && (
        <div className="fixed inset-0 z-40 bg-black/35 flex items-end" onClick={() => !isDeleting && setActiveCity(null)}>
          <div
            className="w-full bg-white rounded-t-[28px] px-6 pt-5 pb-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-primary/60">相册操作</p>
                <h3 className="mt-2 text-2xl font-black text-text-main">{activeCity.cityName}</h3>
                <p className="mt-2 text-sm text-text-sub">
                  {activeCity.totalPhotos} 张照片
                  {activeCity.visits.length > 1 ? ` · ${activeCity.visits.length} 次到访` : ''}
                </p>
              </div>
              <button
                onClick={() => setActiveCity(null)}
                disabled={isDeleting}
                className="w-10 h-10 rounded-full bg-gray-100 text-text-main flex items-center justify-center disabled:opacity-50"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                onClick={() => {
                  onCitySelect(activeCity.cityName);
                  setActiveCity(null);
                }}
                disabled={isDeleting}
                className="w-full rounded-2xl bg-primary text-white py-4 text-base font-bold shadow-sm disabled:opacity-60"
              >
                查看相册
              </button>

              {canDeleteAlbum && (
                <button
                  onClick={handleDeleteAlbum}
                  disabled={isDeleting}
                  className="w-full rounded-2xl border border-red-200 bg-red-50 text-red-600 py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Trash2 size={18} />
                  {isDeleting ? '删除中...' : '删除这个相册'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
