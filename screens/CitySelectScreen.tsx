import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { CitySummary } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';

interface CitySelectScreenProps {
  provinceName: string;
  cities: CitySummary[];
  onCitySelect: (cityName: string) => void;
  onBack: () => void;
}

export const CitySelectScreen: React.FC<CitySelectScreenProps> = ({
  provinceName,
  cities,
  onCitySelect,
  onBack
}) => {
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
              onClick={() => onCitySelect(city.cityName)}
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
    </div>
  );
};
