import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, X } from 'lucide-react';
import { Province } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface UploadScreenProps {
  provinces: Province[];
  onBack: () => void;
  onUpload: (data: { provinceId: string; city: string; date: string; note: string; photos: string[] }) => void;
  userId: string;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ provinces, onBack, onUpload, userId }) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!selectedProvinceId || !city) return;
    onUpload({
      provinceId: selectedProvinceId,
      city,
      date,
      note,
      photos
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex-none flex items-center justify-between p-4 sticky top-0 bg-white/90 backdrop-blur z-20 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} className="text-text-main" />
        </button>
        <h1 className="text-lg font-bold text-text-main">发布足迹</h1>
        <button
          onClick={handleSubmit}
          disabled={!selectedProvinceId || !city}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${selectedProvinceId && city ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
        >
          发布
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
        {/* Photo Selector */}
        <div className="mb-8">
          <ImageUploader
            userId={userId}
            folder="timeline"
            onUploadComplete={(urls) => setPhotos([...photos, ...urls])}
          />
          {/* Display uploaded photos */}
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                  <img src={photo} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Note */}
          <div className="bg-gray-50 p-4 rounded-2xl">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="写下这一刻的心情..."
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-text-main placeholder:text-gray-400 text-base min-h-[100px] resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 block mb-0.5">选择省份</label>
                <select
                  value={selectedProvinceId}
                  onChange={(e) => setSelectedProvinceId(e.target.value)}
                  className="w-full bg-white border-none p-0 text-text-main font-bold focus:ring-0 text-sm"
                  style={{ backgroundColor: '#ffffff', color: '#1a1a2e' }}
                >
                  <option value="" disabled style={{ backgroundColor: '#ffffff', color: '#1a1a2e' }}>点击选择省份</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id} style={{ backgroundColor: '#ffffff', color: '#1a1a2e' }}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 block mb-0.5">城市/地点</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="例如：成都市"
                  className="w-full bg-transparent border-none p-0 text-text-main font-bold focus:ring-0 text-sm placeholder:font-normal"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
              <Calendar size={18} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-400 block mb-0.5">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-text-main font-bold focus:ring-0 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
