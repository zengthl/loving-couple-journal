import React, { useRef, useState } from 'react';
import { Lock, Heart, MapPin, Play } from 'lucide-react';
import { TimelineEvent } from '../types';
import { EventDetailModal } from '../components/EventDetailModal';

interface TimelineScreenProps {
  events: TimelineEvent[];
  onAddClick?: () => void;
  onDeleteEvent: (id: string) => Promise<void>;
  onUpdateEvent: (id: string, data: Partial<TimelineEvent>) => Promise<void>;
  onDeleteImageSync?: (imageUrl: string) => Promise<void>;
  isGuest?: boolean;
}

const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  events,
  onDeleteEvent,
  onUpdateEvent,
  onDeleteImageSync,
  isGuest,
}) => {
  const [viewingEvent, setViewingEvent] = useState<TimelineEvent | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const months = Array.from(new Set<string>(events.map(event => `${event.year}-${event.month}`))).map((value) => {
    const [year, month] = value.split('-');
    return { year, month };
  });

  const handleLongPressStart = (event: TimelineEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      if (window.confirm(`确定要删除“${event.title}”吗？`)) {
        void onDeleteEvent(event.id);
      }
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = (event: TimelineEvent) => {
    if (!isLongPress.current) {
      setViewingEvent(event);
    }
    isLongPress.current = false;
  };

  return (
    <div className="flex h-full flex-col bg-background-light">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-light/90 px-4 py-4 backdrop-blur-md">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Heart size={18} fill="currentColor" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-main">恋爱足迹</h1>
        <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
          <Lock size={12} className="fill-primary text-primary" />
          <span className="text-xs font-bold tracking-wide text-text-sub">{isGuest ? '游客浏览' : '仅你们可见'}</span>
        </div>
      </header>

      <div className="flex-1 px-5 pb-20 pt-2">
        {months.map(({ month, year }) => {
          const monthEvents = events.filter(event => event.month === month && event.year === year);
          if (monthEvents.length === 0) {
            return null;
          }

          return (
            <div key={`${year}-${month}`} className="mb-8">
              <div className="sticky top-[72px] z-40 bg-background-light py-4">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold text-text-main">{month}</h2>
                  <span className="text-lg font-medium text-text-sub/70">{year}</span>
                </div>
              </div>

              <div className="relative ml-2 space-y-8 border-l-2 border-primary/20 pl-4">
                {monthEvents.map((event) => (
                  <div key={event.id} className="group relative pl-6">
                    {event.isSpecial ? (
                      <div className="absolute -left-[11px] top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                        <Heart size={12} fill="currentColor" />
                      </div>
                    ) : (
                      <div className="absolute -left-[9px] top-4 box-content h-4 w-4 rounded-full border-[3px] border-primary bg-background-light"></div>
                    )}

                    <div
                      onClick={() => handleClick(event)}
                      onTouchStart={() => handleLongPressStart(event)}
                      onTouchEnd={handleLongPressEnd}
                      onTouchCancel={handleLongPressEnd}
                      onMouseDown={() => handleLongPressStart(event)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      className="cursor-pointer select-none rounded-2xl bg-white p-3 shadow-card transition-all duration-300 hover:shadow-soft active:scale-[0.98]"
                    >
                      {event.images.length > 0 && (
                        <div className={`relative mb-3 w-full overflow-hidden rounded-xl bg-gray-100 ${event.images.length > 1 ? 'grid aspect-[4/3] grid-cols-2 gap-1' : 'aspect-[4/3]'}`}>
                          {event.images.slice(0, 4).map((imageUrl, index) => {
                            const isVideo = isVideoUrl(imageUrl);
                            return (
                              <div key={index} className="relative h-full w-full">
                                {isVideo ? (
                                  <video
                                    src={imageUrl}
                                    className="h-full w-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
                                  />
                                ) : (
                                  <img src={imageUrl} alt={event.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                                )}
                                {isVideo && (
                                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
                                      <Play size={20} className="ml-0.5 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-start justify-between px-1">
                        <div>
                          <h3 className="mb-1 text-lg font-bold text-text-main">{event.title}</h3>
                          <div className="flex items-center gap-1 text-sm text-text-sub">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-display text-2xl font-bold text-primary">{event.date}</span>
                          <span className="text-xs font-medium text-text-sub/60">{event.dayOfWeek}</span>
                        </div>
                      </div>

                      {event.note && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <p className="line-clamp-1 text-sm text-gray-600">{event.note}</p>
                        </div>
                      )}

                      <div className="mt-2 text-center">
                        <span className="text-[10px] text-gray-300">长按可删除</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {viewingEvent && (
        <EventDetailModal
          isOpen={!!viewingEvent}
          item={viewingEvent}
          type="timeline"
          onClose={() => setViewingEvent(null)}
          onDelete={onDeleteEvent}
          onUpdate={onUpdateEvent}
          onDeleteImage={async (imageUrl) => {
            const updatedImages = viewingEvent.images.filter(currentImage => currentImage !== imageUrl);
            await onUpdateEvent(viewingEvent.id, { images: updatedImages });
            if (onDeleteImageSync) {
              await onDeleteImageSync(imageUrl);
            }
            setViewingEvent(prev => (prev ? { ...prev, images: updatedImages } : null));
          }}
        />
      )}
    </div>
  );
};
