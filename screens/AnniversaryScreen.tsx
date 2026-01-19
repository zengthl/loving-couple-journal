import React, { useState } from 'react';
import { ArrowLeft, Plus, Heart, Bookmark, MapPin, Clock, Map as MapIcon, Calendar, X, Camera } from 'lucide-react';
import { Anniversary } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface AnniversaryScreenProps {
  onBack: () => void;
  anniversaries: Anniversary[];
  onAddAnniversary: (title: string, date: string, image?: string, location?: string) => void;
  onNavigateToMap: () => void;
  userId: string;
}

export const AnniversaryScreen: React.FC<AnniversaryScreenProps> = ({
  onBack,
  anniversaries,
  onAddAnniversary,
  onNavigateToMap,
  userId
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newImage, setNewImage] = useState('');

  // Default main anniversary (first one)
  const mainAnniversary = anniversaries[0] || { title: '我们在一起', date: '2023-05-20' };

  // Calculate days together for main anniversary
  const calculateDays = (dateStr: string) => {
    const start = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const daysTogether = calculateDays(mainAnniversary.date);

  const handleSubmit = () => {
    if (newTitle && newDate) {
      onAddAnniversary(newTitle, newDate, newImage, newLocation);
      setShowAddModal(false);
      setNewTitle('');
      setNewDate('');
      setNewLocation('');
      setNewImage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light relative">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between p-4 bg-background-light/80 backdrop-blur-md">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-text-main transition hover:scale-105 active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-text-main transition hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Add Modal Overlay */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-main">添加纪念日</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div className="flex justify-center mb-2">
                {newImage ? (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden group">
                    <img src={newImage} alt="New Anniversary" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setNewImage('')}
                      className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <ImageUploader
                    userId={userId}
                    folder="anniversary"
                    maxImages={1}
                    onUploadComplete={(urls) => urls.length > 0 && setNewImage(urls[0])}
                  >
                    <div className="w-full h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
                      <Camera size={24} />
                      <span className="text-xs font-medium">添加照片</span>
                    </div>
                  </ImageUploader>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">名称</label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-transparent focus-within:border-primary/50 focus-within:bg-white transition-all">
                  <Heart size={18} className="text-primary" />
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例如: 第一次约会"
                    className="flex-1 bg-transparent border-none p-0 text-text-main placeholder:text-gray-400 focus:ring-0 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">城市</label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-transparent focus-within:border-primary/50 focus-within:bg-white transition-all">
                  <MapPin size={18} className="text-primary" />
                  <input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="例如: 上海"
                    className="flex-1 bg-transparent border-none p-0 text-text-main placeholder:text-gray-400 focus:ring-0 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">日期</label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-transparent focus-within:border-primary/50 focus-within:bg-white transition-all">
                  <Calendar size={18} className="text-primary" />
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 bg-transparent border-none p-0 text-text-main focus:ring-0 text-sm font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!newTitle || !newDate}
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-primary/30 mt-4 transition-all active:scale-[0.98] ${newTitle && newDate ? 'bg-primary' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-20 space-y-8 animate-fade-in overflow-y-auto no-scrollbar">

        {/* Hero Date Section */}
        <div className="flex flex-col items-center gap-2 text-center w-full animate-slide-up">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
            <Heart size={12} fill="currentColor" />
            {daysTogether} Days Together
          </div>
          <h1 className="text-[#4A3434] text-[32px] md:text-[36px] font-extrabold leading-tight tracking-tight mt-2">
            {mainAnniversary.date.replace(/-/g, '年').replace(/-/, '月') + '日'}
          </h1>
          <div className="w-12 h-1 bg-primary rounded-full my-2"></div>
          <p className="text-text-sub text-base font-normal leading-relaxed italic">
            "{mainAnniversary.title}"
          </p>
        </div>

        {/* Other Anniversaries List */}
        {anniversaries.length > 1 && (
          <div className="w-full space-y-3">
            {anniversaries.slice(1).map(ann => (
              <div key={ann.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-stone-50 group hover:shadow-md transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  {ann.image ? (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img src={ann.image} alt={ann.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="font-bold text-text-main text-sm truncate">{ann.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-text-sub">
                      <span>{ann.date}</span>
                      {ann.location && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="truncate max-w-[80px]">{ann.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-primary font-bold text-lg">{calculateDays(ann.date)}</span>
                  <span className="text-xs text-text-sub ml-1">天</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Grid (Film Style) */}
        <div className="w-full relative group cursor-pointer mt-4">
          {/* Decorative blurs */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-blue-200/10 blur-2xl"></div>

          <div className="relative flex flex-col gap-6 md:gap-8">
            {/* Photo 1: Tilted Left */}
            <div className="relative transform -rotate-1 hover:rotate-0 transition-transform duration-500 ease-out z-10">
              <div className="bg-white p-3 pb-8 rounded-lg shadow-card border border-stone-100">
                <div className="w-full aspect-[4/3] bg-stone-200 rounded overflow-hidden relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwcOy2_u8jVSn76j0AnPYqba-6TPgpd_Q0mLl53i1qYIt515t9lVd-iIJh2NBcONTZIHFe7fS4jadYemuiCLeU0gDg_FaDe7QFM4XDBaC1FSksvVvoGOFUwLxZGYu5Vb_mlSxtsUy5ALvLoKc0_94ZtmpG8afuvaCio5dm5ShUtfm7z8m_f6_fvTvRfCD1SLzx8NZq5IyTEWmyl7EWyPFWShePHdk-Ll_NvFkAjVS26H8TXzUB8VHvBILQDeLBwRwJKzLYs4fVnU4"
                    alt="Couple holding hands"
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"></div>
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                  <span className="text-xs font-handwriting text-text-sub/70">#SunsetWalks</span>
                  <Heart size={16} className="text-primary/60" />
                </div>
              </div>
            </div>

            {/* Photo 2: Tilted Right */}
            <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-500 ease-out z-20 -mt-12">
              <div className="bg-white p-3 pb-8 rounded-lg shadow-card border border-stone-100">
                <div className="w-full aspect-[4/3] bg-stone-200 rounded overflow-hidden relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQv0ACv_fwdnVJnhjCNRoDnBLXC2QcWlcs_iKim3f8wp4Fasap1L2ZJDocnTe65hA6wDrmsYLTdqXfR10S1tiQiE4A-oRsPz3_2r3dw7TWsHmhf0X7mx89yRKZTXgPdW0-Y4QSpN7XSDANm83npx6NdNwOPqG5rVTi0wrILoPNNXi5xZNAPyKMoY_82l8qRH1EIZKmkqPQ9YOp5yZwMifuGYYpwbqSsiqJ1QPsHcX1G2aNWPecZHRhWC30ReJU-sTshJ0GFMOdGH8"
                    alt="Coffee moment"
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                  <span className="text-xs font-handwriting text-text-sub/70">#CoffeeDate</span>
                  <Bookmark size={16} className="text-primary/60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="w-full mt-4">
          <div className="relative flex flex-col gap-0 rounded-2xl bg-white p-0 shadow-soft overflow-hidden border border-stone-50">
            {/* Map Header */}
            <div className="h-32 w-full relative bg-gray-100 overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEDZzI2HsQq-UXhBvuGEDWbrZj9-7LuzZJ70pJeHTnQ1W6of729Fxx2MVUg-dm0mOTDaqrGiqwaXqHz8D5pi2u7L_857qhkSZRzm94rXTIKcTwaxFO_e1YXhEvNcIS73RvAXY9KQFfiAo6BPUjTFQ_IlUPoI8IDZPsdTxRxaICJTbQDuCDezJDNFqfBbrMaU01oFALLGOnen8XsHHUJShTTxEnZg51TxSBj-dECpkEi2OjcbIdxR703rG27JS2F5Z0imODXzSTtdk"
                alt="Abstract Map"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
              <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white drop-shadow-md">
                <MapPin size={16} className="text-primary fill-primary" />
                <span className="text-sm font-bold tracking-wide">SHANGHAI</span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-text-main text-lg font-bold leading-tight">迪士尼乐园</h3>
                  <div className="flex items-center gap-1.5 text-text-sub text-sm">
                    <Clock size={14} />
                    <span>打卡时间：14:00</span>
                  </div>
                </div>
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                  <MapPin size={20} />
                </div>
              </div>

              <button
                onClick={onNavigateToMap}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white h-12 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                <MapIcon size={18} />
                查看足迹地图
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
