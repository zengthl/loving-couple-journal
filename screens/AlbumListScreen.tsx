import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, MapPin, Grid, Calendar, Play, Download, CheckCircle, Loader } from 'lucide-react';
import { Province } from '../types';
import { ImageViewer } from '../components/ImageViewer';
import { deleteProvincePhoto } from '../lib/db';

interface AlbumListScreenProps {
  provinces: Province[];
  onBack: () => void;
  userId: string;
  onRefresh: () => void;
  onDeletePhoto?: (photoUrl: string) => Promise<void>;
}

// Helper to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

// Download file function
const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || url.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    window.open(url, '_blank');
  }
};

// Batch download with delay
const batchDownload = async (
  urls: string[],
  onProgress: (current: number, total: number) => void
): Promise<void> => {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const extension = url.split('.').pop()?.split('?')[0] || 'file';
    const filename = `photo_${i + 1}.${extension}`;
    await downloadFile(url, filename);
    onProgress(i + 1, urls.length);
    // Add delay between downloads to avoid browser blocking
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

export const AlbumListScreen: React.FC<AlbumListScreenProps> = ({ provinces, onBack, userId, onRefresh, onDeletePhoto }) => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  const visitedProvinces = provinces.filter(p => p.visited);

  const handleDeletePhoto = async () => {
    if (!viewingPhoto || !selectedProvince) return;

    const success = await deleteProvincePhoto(userId, selectedProvince.id, viewingPhoto);
    if (success) {
      const photoToDelete = viewingPhoto;
      setViewingPhoto(null);
      if (onDeletePhoto) {
        await onDeletePhoto(photoToDelete);
      }
      onRefresh();
      setSelectedProvince(prev => prev ? ({
        ...prev,
        photos: prev.photos.filter(p => p !== photoToDelete)
      }) : null);
    } else {
      alert('删除失败，请重试');
    }
  };

  const togglePhotoSelection = (photo: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photo)) {
      newSelected.delete(photo);
    } else {
      newSelected.add(photo);
    }
    setSelectedPhotos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProvince) {
      if (selectedPhotos.size === selectedProvince.photos.length) {
        setSelectedPhotos(new Set());
      } else {
        setSelectedPhotos(new Set(selectedProvince.photos));
      }
    }
  };

  const handleBatchDownload = async () => {
    if (selectedPhotos.size === 0) return;

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: selectedPhotos.size });

    try {
      await batchDownload(
        Array.from(selectedPhotos),
        (current, total) => setDownloadProgress({ current, total })
      );
    } finally {
      setIsDownloading(false);
      setIsSelectMode(false);
      setSelectedPhotos(new Set());
    }
  };

  const handleDownloadAll = async () => {
    if (!selectedProvince || selectedProvince.photos.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: selectedProvince.photos.length });

    try {
      await batchDownload(
        selectedProvince.photos,
        (current, total) => setDownloadProgress({ current, total })
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (selectedProvince) {
    // Detail View (Apple Photos Style)
    return (
      <div className="flex flex-col h-full bg-white">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <button onClick={() => { setSelectedProvince(null); setIsSelectMode(false); setSelectedPhotos(new Set()); }} className="flex items-center gap-1 text-primary font-medium hover:opacity-80">
            <ArrowLeft size={20} />
            返回
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-base font-bold text-text-main">{selectedProvince.name}</h1>
            <span className="text-[10px] text-gray-400">{selectedProvince.date}</span>
          </div>
          <div className="flex items-center gap-2">
            {isSelectMode ? (
              <button
                onClick={() => { setIsSelectMode(false); setSelectedPhotos(new Set()); }}
                className="text-primary text-sm font-medium"
              >
                取消
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="text-primary text-sm font-medium"
                >
                  选择
                </button>
                <button
                  onClick={handleDownloadAll}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  title="下载全部"
                >
                  <Download size={20} className="text-text-main" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Selection Mode Toolbar */}
        {isSelectMode && (
          <div className="sticky top-[57px] z-10 bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100">
            <button onClick={handleSelectAll} className="text-sm text-primary font-medium">
              {selectedPhotos.size === selectedProvince.photos.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-gray-500">已选择 {selectedPhotos.size} 项</span>
            <button
              onClick={handleBatchDownload}
              disabled={selectedPhotos.size === 0 || isDownloading}
              className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${selectedPhotos.size > 0 && !isDownloading
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-400'
                }`}
            >
              <Download size={14} />
              下载
            </button>
          </div>
        )}

        {/* Download Progress */}
        {isDownloading && (
          <div className="sticky top-[57px] z-10 bg-primary/10 px-4 py-3 flex items-center justify-center gap-3">
            <Loader className="animate-spin text-primary" size={18} />
            <span className="text-sm font-medium text-primary">
              正在下载 {downloadProgress.current}/{downloadProgress.total}...
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-1">
          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-0.5 mb-0.5">
            {selectedProvince.photos.map((photo, idx) => {
              const isVideo = isVideoUrl(photo);
              const isSelected = selectedPhotos.has(photo);

              return (
                <div
                  key={idx}
                  onClick={() => isSelectMode ? togglePhotoSelection(photo) : setViewingPhoto(photo)}
                  className={`relative ${idx === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'} bg-gray-100 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity aspect-square`}
                >
                  {isVideo ? (
                    <video src={photo} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  )}

                  {/* Video Play Icon */}
                  {isVideo && !isSelectMode && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                        <Play size={20} className="text-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelectMode && (
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'bg-white/80 border-gray-300'
                      }`}>
                      {isSelected && <CheckCircle size={16} className="text-white" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4">
            <h3 className="text-lg font-bold text-text-main mb-2">回忆</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <MapPin size={14} />
              <span>{selectedProvince.name}</span>
              <span className="mx-1">•</span>
              <Calendar size={14} />
              <span>{selectedProvince.date}</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              美好的回忆都在这里。记录了我们在{selectedProvince.name}的点点滴滴。
            </p>
          </div>
        </div>

        {/* Full Screen Viewer */}
        <ImageViewer
          isOpen={!!viewingPhoto}
          imageUrl={viewingPhoto || ''}
          onClose={() => setViewingPhoto(null)}
          onDelete={handleDeletePhoto}
        />
      </div>
    );
  }

  // List View
  return (
    <div className="flex flex-col h-full bg-background-light">
      <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-text-main" />
        </button>
        <h1 className="text-xl font-bold text-text-main">足迹相册</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {visitedProvinces.map(province => {
            const firstPhoto = province.photos[0];
            const isFirstPhotoVideo = firstPhoto && isVideoUrl(firstPhoto);

            return (
              <div
                key={province.id}
                onClick={() => setSelectedProvince(province)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2 shadow-sm group-hover:shadow-md transition-all">
                  {province.photos.length > 0 ? (
                    isFirstPhotoVideo ? (
                      <video src={firstPhoto} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" muted playsInline />
                    ) : (
                      <img src={firstPhoto} alt={province.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>

                  {/* Video indicator on cover */}
                  {isFirstPhotoVideo && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                      <Play size={12} className="text-white ml-0.5" />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg font-bold leading-none">{province.name}</h3>
                    <span className="text-[10px] opacity-80">{province.photos.length} 张照片</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State / Add Placeholder */}
          <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <ImageIcon size={24} />
            </div>
            <span className="text-xs font-bold">更多足迹等你点亮</span>
          </div>
        </div>
      </div>
    </div>
  );
};
