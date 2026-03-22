import React, { useState } from 'react';
import { ArrowLeft, Plus, Heart, MapPin, Calendar, X, Camera } from 'lucide-react';
import { Anniversary } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { OptimizedImage } from '../components/OptimizedImage';

interface AnniversaryScreenProps {
  onBack: () => void;
  anniversaries: Anniversary[];
  onAddAnniversary: (title: string, date: string, image?: string, location?: string) => void;
  onNavigateToMap: () => void;
  userId: string;
}

const createDate = (value: string) => new Date(`${value}T00:00:00`);

const formatAnniversaryDate = (value: string) => {
  if (!value) {
    return '请选择日期';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(createDate(value));
};

const calculateDays = (value: string) => {
  if (!value) {
    return 0;
  }

  const start = createDate(value);
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = current.getTime() - start.getTime();

  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

export const AnniversaryScreen: React.FC<AnniversaryScreenProps> = ({
  onBack,
  anniversaries,
  onAddAnniversary,
  onNavigateToMap,
  userId,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newImage, setNewImage] = useState('');

  const mainAnniversary = anniversaries[0] || { title: '我们在一起', date: '2025-03-23' };
  const daysTogether = calculateDays(mainAnniversary.date);

  const handleSubmit = () => {
    if (!newTitle || !newDate) {
      return;
    }

    onAddAnniversary(newTitle, newDate, newImage || undefined, newLocation || undefined);
    setShowAddModal(false);
    setNewTitle('');
    setNewDate('');
    setNewLocation('');
    setNewImage('');
  };

  return (
    <div className="relative flex h-full flex-col bg-background-light">
      <div className="sticky top-0 z-40 flex items-center justify-between bg-background-light/80 p-4 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-main shadow-sm transition hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-main shadow-sm transition hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-scale-up">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-text-main">添加纪念日</h3>
              <button onClick={() => setShowAddModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="mb-2 flex justify-center">
                {newImage ? (
                  <div className="group relative h-32 w-full overflow-hidden rounded-2xl">
                    <img src={newImage} alt="New anniversary" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setNewImage('')}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <ImageUploader
                    userId={userId}
                    folder="anniversary"
                    maxImages={1}
                    onUploadComplete={(urls) => {
                      if (urls.length > 0) {
                        setNewImage(urls[0]);
                      }
                    }}
                  >
                    <div className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                      <Camera size={24} />
                      <span className="text-xs font-medium">添加照片</span>
                    </div>
                  </ImageUploader>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">标题</label>
                <div className="flex items-center gap-3 rounded-xl border border-transparent bg-gray-50 p-3 transition-all focus-within:border-primary/50 focus-within:bg-white">
                  <Heart size={18} className="text-primary" />
                  <input
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="例如：第一次约会"
                    className="flex-1 border-none bg-transparent p-0 text-sm font-medium text-text-main placeholder:text-gray-400 focus:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">地点</label>
                <div className="flex items-center gap-3 rounded-xl border border-transparent bg-gray-50 p-3 transition-all focus-within:border-primary/50 focus-within:bg-white">
                  <MapPin size={18} className="text-primary" />
                  <input
                    value={newLocation}
                    onChange={(event) => setNewLocation(event.target.value)}
                    placeholder="例如：上海"
                    className="flex-1 border-none bg-transparent p-0 text-sm font-medium text-text-main placeholder:text-gray-400 focus:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">日期</label>
                <div className="flex items-center gap-3 rounded-xl border border-transparent bg-gray-50 p-3 transition-all focus-within:border-primary/50 focus-within:bg-white">
                  <Calendar size={18} className="text-primary" />
                  <input
                    type="date"
                    value={newDate}
                    onChange={(event) => setNewDate(event.target.value)}
                    className="flex-1 border-none bg-transparent p-0 text-sm font-medium text-text-main focus:ring-0"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!newTitle || !newDate}
                className={`mt-4 w-full rounded-xl py-3.5 font-bold text-white transition-all active:scale-[0.98] ${newTitle && newDate ? 'bg-primary shadow-lg shadow-primary/30' : 'cursor-not-allowed bg-gray-300 shadow-none'}`}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="no-scrollbar flex flex-1 flex-col items-center space-y-8 overflow-y-auto px-6 pb-20 pt-4 animate-fade-in">
        <div className="flex w-full animate-slide-up flex-col items-center gap-2 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Heart size={12} fill="currentColor" />
            在一起 {daysTogether} 天
          </div>
          <h1 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-[#4A3434] md:text-[36px]">
            {formatAnniversaryDate(mainAnniversary.date)}
          </h1>
          <div className="my-2 h-1 w-12 rounded-full bg-primary"></div>
          <p className="text-base italic leading-relaxed text-text-sub">
            "{mainAnniversary.title}"
          </p>
          <button
            onClick={onNavigateToMap}
            className="inline-flex items-center gap-2 rounded-full border border-stone-100 bg-white px-4 py-2 text-sm font-medium text-text-main shadow-sm transition hover:shadow-md"
          >
            <MapPin size={14} className="text-primary" />
            打开旅行地图
          </button>
        </div>

        {anniversaries.length > 1 && (
          <div className="w-full space-y-6">
            {anniversaries.slice(1).map((anniversary, index) => {
              const tiltClass = index % 2 === 0 ? '-rotate-[1.2deg]' : 'rotate-[1.2deg]';

              return (
                <div key={anniversary.id} className={`transform transition-transform duration-500 ease-out hover:rotate-0 ${tiltClass}`}>
                  <div className="rounded-[28px] border border-stone-100 bg-white p-4 pb-6 shadow-card">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-stone-100">
                      {anniversary.image ? (
                        <OptimizedImage
                          src={anniversary.image}
                          alt={anniversary.title}
                          variant="card"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 text-primary/60">
                          <Calendar size={42} />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 via-black/10 to-transparent"></div>
                      <div className="absolute right-4 top-4 rounded-full bg-white/88 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md">
                        {calculateDays(anniversary.date)} 天
                      </div>
                    </div>

                    <div className="mt-4 px-1">
                      <h4 className="text-[22px] font-black leading-tight text-text-main">{anniversary.title}</h4>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-sub">
                        <span>{formatAnniversaryDate(anniversary.date)}</span>
                        {anniversary.location && (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/30"></span>
                            <span>{anniversary.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
