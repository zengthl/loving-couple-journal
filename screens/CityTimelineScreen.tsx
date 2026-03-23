import React, { useState } from 'react';
import { ArrowLeft, Calendar, Plus, Trash2, Download } from 'lucide-react';
import { ProvinceVisit } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProgressiveImage } from '../components/ProgressiveImage';

interface CityTimelineScreenProps {
  cityName: string;
  provinceName: string;
  visits: ProvinceVisit[];
  onBack: () => void;
  onAddPhotos: (visitId: string) => void;
  onDeletePhoto: (visitId: string, photoUrl: string) => void;
  onDownloadPhoto: (photoUrl: string) => void;
  isGuest?: boolean;
}

export const CityTimelineScreen: React.FC<CityTimelineScreenProps> = ({
  cityName,
  provinceName,
  visits,
  onBack,
  onAddPhotos,
  onDeletePhoto,
  onDownloadPhoto,
  isGuest
}) => {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const togglePhotoSelection = (photoUrl: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoUrl)) {
      newSelected.delete(photoUrl);
    } else {
      newSelected.add(photoUrl);
    }
    setSelectedPhotos(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (!selectedVisit || selectedPhotos.size === 0) return;
    for (const photo of selectedPhotos) {
      await onDeletePhoto(selectedVisit, photo);
    }
    setSelectedPhotos(new Set());
    setIsSelectMode(false);
  };

  const handleDownloadSelected = async () => {
    for (const photo of selectedPhotos) {
      await onDownloadPhoto(photo);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-background-light to-transparent sticky top-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-sub hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">返回</span>
        </button>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-black tracking-tight text-text-main leading-none">
              {cityName}
            </h1>
            <p className="text-sm text-text-sub mt-1 font-medium">
              {provinceName} · 时间线
            </p>
          </div>
          {visits.length > 0 && !isGuest && (
            <button
              onClick={() => setIsSelectMode(!isSelectMode)}
              className="text-sm text-primary font-medium"
            >
              {isSelectMode ? '取消' : '选择'}
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {visits.map((visit, visitIndex) => (
          <div key={visit.id} className="mb-8">
            {/* Timeline Node */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  visitIndex === 0 ? 'bg-primary' : 'bg-primary/20'
                }`}>
                  <Calendar size={18} className={visitIndex === 0 ? 'text-white' : 'text-primary'} />
                </div>
                {visitIndex < visits.length - 1 && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-primary/20" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-text-main">
                  {visit.visitDate.replace(/\./g, '年').replace(/(\d+)$/, '$1日')}
                </h3>
                <p className="text-xs text-text-sub">
                  {visit.photos.length} 张照片
                </p>
              </div>
              {!isGuest && (
                <button
                  onClick={() => onAddPhotos(visit.id)}
                  className="ml-auto w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {/* Photo Grid for this visit */}
            <div className="ml-5 pl-5 border-l-2 border-primary/10">
              <div className="grid grid-cols-3 gap-0.5">
                {visit.photos.map((photo, idx) => (
                  <div
                    key={`${visit.id}-${idx}`}
                    className="relative aspect-square group"
                    onClick={() => {
                      if (isSelectMode) {
                        togglePhotoSelection(photo);
                      } else {
                        setPreviewPhoto(photo);
                      }
                    }}
                  >
                    <OptimizedImage
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      variant="thumb"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    {/* Selection overlay */}
                    {isSelectMode && (
                      <div className={`absolute inset-0 flex items-center justify-center ${
                        selectedPhotos.has(photo) ? 'bg-primary/30' : 'bg-black/0 group-hover:bg-black/10'
                      }`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPhotos.has(photo)
                            ? 'bg-primary border-primary text-white'
                            : 'border-white/70'
                        }`}>
                          {selectedPhotos.has(photo) && <span className="text-xs">✓</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {visits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-sub">
            <Calendar size={48} className="mb-4 opacity-30" />
            <p>暂无到访记录</p>
          </div>
        )}
      </div>

      {/* Selection Mode Actions */}
      {!isGuest && isSelectMode && selectedPhotos.size > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-lg rounded-full shadow-floating px-6 py-3 flex items-center gap-4">
          <span className="text-sm text-text-sub">
            已选择 {selectedPhotos.size} 张
          </span>
          <button
            onClick={handleDownloadSelected}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"
          >
            <Download size={18} />
          </button>
          <button
            onClick={handleDeleteSelected}
            className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      {/* Photo Preview */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setPreviewPhoto(null)}
        >
          <ProgressiveImage
            src={previewPhoto}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            showLoader={false}
          />
        </div>
      )}
    </div>
  );
};
