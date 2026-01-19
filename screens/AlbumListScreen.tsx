import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, MapPin, Grid, Calendar } from 'lucide-react';
import { Province } from '../types';
import { ImageViewer } from '../components/ImageViewer';
import { deleteProvincePhoto } from '../lib/db';

interface AlbumListScreenProps {
  provinces: Province[];
  onBack: () => void;
  userId: string;
  onRefresh: () => void;
}

export const AlbumListScreen: React.FC<AlbumListScreenProps> = ({ provinces, onBack, userId, onRefresh }) => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const visitedProvinces = provinces.filter(p => p.visited);

  const handleDeletePhoto = async () => {
    if (!viewingPhoto || !selectedProvince) return;

    const success = await deleteProvincePhoto(userId, selectedProvince.id, viewingPhoto);
    if (success) {
      // Close viewer
      setViewingPhoto(null);
      // Refresh data
      onRefresh();
      // Update local state (optimistic-like) to avoid jarring jump
      // Actually, since we trigger Refresh, App will re-render us. 
      // But selectedProvince is local state, so we might need to update it or sync it.
      // If we don't update local selectedProvince, the photo will still be there until we re-select?
      // No, `provinces` prop updates, but `selectedProvince` is state initialized once? 
      // No, it's just state. We need to update `selectedProvince` manually or find it from new props.
      // For simplicity, let's close the detail view or manually remove from local state.
      setSelectedProvince(prev => prev ? ({
        ...prev,
        photos: prev.photos.filter(p => p !== viewingPhoto)
      }) : null);
    } else {
      alert('删除失败，请重试');
    }
  };

  if (selectedProvince) {
    // Detail View (Apple Photos Style)
    return (
      <div className="flex flex-col h-full bg-white">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <button onClick={() => setSelectedProvince(null)} className="flex items-center gap-1 text-primary font-medium hover:opacity-80">
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-base font-bold text-text-main">{selectedProvince.name}</h1>
            <span className="text-[10px] text-gray-400">{selectedProvince.date}</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <Grid size={20} className="text-text-main" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-1">
          {/* Hero Grid */}
          <div className="grid grid-cols-3 gap-0.5 mb-0.5">
            {selectedProvince.photos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setViewingPhoto(photo)}
                className={`relative ${idx === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'} bg-gray-100 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="p-4">
            <h3 className="text-lg font-bold text-text-main mb-2">Memories</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <MapPin size={14} />
              <span>{selectedProvince.name}, China</span>
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
          {visitedProvinces.map(province => (
            <div
              key={province.id}
              onClick={() => setSelectedProvince(province)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2 shadow-sm group-hover:shadow-md transition-all">
                {province.photos.length > 0 ? (
                  <img src={province.photos[0]} alt={province.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-lg font-bold leading-none">{province.name}</h3>
                  <span className="text-[10px] opacity-80">{province.photos.length} photos</span>
                </div>
              </div>
            </div>
          ))}

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
