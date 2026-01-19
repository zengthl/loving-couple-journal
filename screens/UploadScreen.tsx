import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, X, ChevronRight, Check } from 'lucide-react';
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
  const [showProvincePicker, setShowProvincePicker] = useState(false);

  const selectedProvince = provinces.find(p => p.id === selectedProvinceId);

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
            {/* Province Picker Button */}
            <button
              onClick={() => setShowProvincePicker(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 block mb-0.5">选择省份</label>
                <span className={`text-sm font-bold ${selectedProvince ? 'text-text-main' : 'text-gray-400'}`}>
                  {selectedProvince ? selectedProvince.name : '点击选择省份'}
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

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

      {/* Province Picker Modal */}
      {showProvincePicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md max-h-[70vh] rounded-t-3xl shadow-2xl flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <button onClick={() => setShowProvincePicker(false)} className="text-gray-500 font-medium">
                取消
              </button>
              <h3 className="text-lg font-bold text-text-main">选择省份</h3>
              <div className="w-10"></div>
            </div>

            {/* Province List */}
            <div className="flex-1 overflow-y-auto">
              {provinces.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProvinceId(p.id);
                    setShowProvincePicker(false);
                  }}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="text-base text-text-main font-medium">{p.name}</span>
                  {selectedProvinceId === p.id && (
                    <Check size={20} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

