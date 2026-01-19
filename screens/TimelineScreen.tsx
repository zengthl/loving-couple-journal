import React, { useState, useRef } from 'react';
import { ArrowLeft, Lock, Heart, MapPin, Store, Film, Waves, Plus } from 'lucide-react';
import { TimelineEvent } from '../types';
import { EventDetailModal } from '../components/EventDetailModal';

interface TimelineScreenProps {
  events: TimelineEvent[];
  onAddClick?: () => void;
  onDeleteEvent: (id: string) => Promise<void>;
  onUpdateEvent: (id: string, data: Partial<TimelineEvent>) => Promise<void>;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  events,
  onAddClick,
  onDeleteEvent,
  onUpdateEvent
}) => {
  const [viewingEvent, setViewingEvent] = useState<TimelineEvent | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // Group unique months/years
  const months = Array.from(new Set(events.map(e => `${e.year}-${e.month}`)))
    .map((str: string) => {
      const [year, month] = str.split('-');
      return { year, month };
    });

  const handleLongPressStart = (event: TimelineEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      if (window.confirm(`确定要删除"${event.title}"吗？`)) {
        onDeleteEvent(event.id);
      }
    }, 500); // 500ms long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = (event: TimelineEvent) => {
    // Only open detail if not a long press
    if (!isLongPress.current) {
      setViewingEvent(event);
    }
    isLongPress.current = false;
  };

  return (
    <div className="flex flex-col h-full bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-light/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
        <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 transition-colors text-text-main">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-text-main tracking-tight">恋爱足迹</h1>
        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <Lock size={12} className="text-primary fill-primary" />
          <span className="text-xs font-bold text-text-sub tracking-wide">仅你们可见</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-5 pt-2 pb-20">
        {months.map(({ month, year }) => {
          const monthEvents = events.filter(e => e.month === month && e.year === year);
          if (monthEvents.length === 0) return null;

          return (
            <div key={`${year}-${month}`} className="mb-8">
              {/* Sticky Month Header */}
              <div className="sticky top-[72px] z-40 py-4 bg-background-light">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold text-text-main">{month}</h2>
                  <span className="text-lg font-medium text-text-sub/70">{year}</span>
                </div>
              </div>

              {/* Timeline Line */}
              <div className="relative pl-4 border-l-2 border-primary/20 ml-2 space-y-8">
                {monthEvents.map(event => (
                  <div key={event.id} className="relative pl-6 group">
                    {/* Node Dot */}
                    {event.isSpecial ? (
                      <div className="absolute -left-[11px] top-4 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center z-10 shadow-sm">
                        <Heart size={12} fill="currentColor" />
                      </div>
                    ) : (
                      <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-background-light border-[3px] border-primary z-10 box-content"></div>
                    )}

                    {/* Card with long press */}
                    <div
                      onClick={() => handleClick(event)}
                      onTouchStart={() => handleLongPressStart(event)}
                      onTouchEnd={handleLongPressEnd}
                      onTouchCancel={handleLongPressEnd}
                      onMouseDown={() => handleLongPressStart(event)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      className="bg-white rounded-2xl p-3 shadow-card hover:shadow-soft transition-all duration-300 transform active:scale-[0.98] cursor-pointer select-none"
                    >
                      {/* Image Area */}
                      {event.images.length > 0 && (
                        <div className={`relative w-full overflow-hidden rounded-xl mb-3 bg-gray-100 ${event.images.length > 1 ? 'grid grid-cols-2 gap-1 aspect-[4/3]' : 'aspect-[4/3]'}`}>
                          {event.images.slice(0, 4).map((img, i) => (
                            <img key={i} src={img} alt={event.title} className="h-full w-full object-cover" />
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex justify-between items-start px-1">
                        <div>
                          <h3 className="text-lg font-bold text-text-main mb-1">{event.title}</h3>
                          <div className="flex items-center gap-1 text-text-sub text-sm">
                            {event.title.includes('电影') ? <Film size={14} /> :
                              event.title.includes('咖啡') ? <Store size={14} /> :
                                event.title.includes('海边') ? <Waves size={14} /> : <MapPin size={14} />}
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-bold text-primary font-display">{event.date}</span>
                          <span className="text-xs text-text-sub/60 font-medium">{event.dayOfWeek}</span>
                        </div>
                      </div>

                      {/* Note */}
                      {event.note && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-1">{event.note}</p>
                        </div>
                      )}

                      {/* Long press hint */}
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

      {/* Detail Modal */}
      {viewingEvent && (
        <EventDetailModal
          isOpen={!!viewingEvent}
          item={viewingEvent}
          type="timeline"
          onClose={() => setViewingEvent(null)}
          onDelete={onDeleteEvent}
          onUpdate={onUpdateEvent}
        />
      )}
    </div>
  );
};