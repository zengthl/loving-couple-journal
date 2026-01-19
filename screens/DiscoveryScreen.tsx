import React, { useState } from 'react';
import { Search, MapPin, Check } from 'lucide-react';
import { DiscoveryItem, DiscoveryType } from '../types';

interface DiscoveryScreenProps {
  items: DiscoveryItem[];
}

const TABS: { label: string; type: DiscoveryType }[] = [
  { label: '美食', type: 'food' },
  { label: '好物', type: 'goods' },
  { label: '好店', type: 'shop' },
  { label: '好玩', type: 'fun' }
];

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({ items }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DiscoveryType>('food');

  // Filter items based on search query and active tab
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.includes(searchQuery) || item.location.includes(searchQuery);
    const matchesTab = item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col h-full bg-background-light">
      {/* Header */}
      <header className="flex-none px-4 pt-6 pb-2 bg-background-light/95 backdrop-blur-sm z-10 sticky top-0">
        <div className="mb-4">
          <label className="flex flex-col h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-2xl h-full shadow-sm bg-white overflow-hidden border border-transparent focus-within:border-primary/30 transition-all duration-300">
              <div className="text-primary/70 flex border-none items-center justify-center pl-4 bg-white">
                <Search size={22} />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden border-none bg-white focus:ring-0 text-text-main placeholder:text-text-sub/60 px-3 text-sm font-medium leading-normal h-full outline-none"
                placeholder="搜索浪漫好去处 (例如: 咖啡、看展)"
              />
            </div>
          </label>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-2 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex flex-col items-center justify-center gap-1 group transition-all ${activeTab === tab.type ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
              <span className={`text-text-main font-bold leading-normal tracking-wide relative ${activeTab === tab.type ? 'text-lg after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-1 after:bg-primary after:rounded-full' : 'text-base'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Masonry Content */}
      <main className="flex-1 px-4 pt-2 pb-24 overflow-y-auto no-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p>这里还空空如也，快去点击"+"发布吧~</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 space-y-4">
            {filteredItems.map((card) => (
              <div key={card.id} className="break-inside-avoid mb-4 group/card">
                <div className="relative flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-soft hover:shadow-floating transition-all duration-300">
                  <div className="relative w-full overflow-hidden rounded-xl">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                    />
                    {card.topBadge && (
                      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-text-main tracking-wide">TOP 1</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 px-1">
                    <h3 className="text-text-main text-[15px] font-bold leading-tight line-clamp-1">
                      {card.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-text-sub overflow-hidden">
                        <MapPin size={12} className="text-primary/80" />
                        <p className="text-xs font-medium truncate">{card.location}</p>
                      </div>

                      {card.checked && (
                        <div className="h-6 w-6 rounded-full border-2 border-primary bg-primary text-white flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

