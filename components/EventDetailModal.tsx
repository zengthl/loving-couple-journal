import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, MapPin, Calendar, Image as ImageIcon, Save, Loader2, ChevronLeft, ChevronRight, Download, Play } from 'lucide-react';
import { TimelineEvent, DiscoveryItem } from '../types';

type DetailItem = TimelineEvent | DiscoveryItem;

interface EventDetailModalProps {
    isOpen: boolean;
    item: DetailItem;
    type: 'timeline' | 'discovery';
    onClose: () => void;
    onDelete: (id: string) => Promise<void>;
    onUpdate: (id: string, data: Partial<DetailItem>) => Promise<void>;
    onDeleteImage?: (imageUrl: string) => Promise<void>;
}

// Helper to check if URL is a video
const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
};

// Download file function
const downloadFile = async (url: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const extension = url.split('.').pop()?.split('?')[0] || 'file';
        const filename = `download_${Date.now()}.${extension}`;

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        window.open(url, '_blank');
    }
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
    isOpen,
    item,
    type,
    onClose,
    onDelete,
    onUpdate,
    onDeleteImage
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);

    // Local edit state
    const [editTitle, setEditTitle] = useState(item.title);
    const [editLocation, setEditLocation] = useState(item.location);
    const [editDate, setEditDate] = useState('date' in item ? item.date : item.date.split('T')[0]);
    const [editNote, setEditNote] = useState('note' in item ? item.note || '' : '');

    // Reset state when item opens
    useEffect(() => {
        if (isOpen) {
            setEditTitle(item.title);
            setEditLocation(item.location);
            setEditDate('date' in item ? item.date : item.date.split('T')[0]);
            setEditNote('note' in item ? item.note || '' : '');
            setIsEditing(false);
            setIsSaving(false);
            setViewingImageIndex(null);

            // Disable body scroll when modal is open
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${window.scrollY}px`;
        }

        return () => {
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        };
    }, [isOpen, item]);

    if (!isOpen) return null;

    const images = 'images' in item ? item.images : [item.image];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(item.id, {
                title: editTitle,
                location: editLocation,
                date: editDate,
                ...(type === 'timeline' ? { note: editNote } : {})
            } as any);
            setIsEditing(false);
        } catch (error) {
            console.error("Update failed", error);
            alert("更新失败，请重试");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('确定要删除这条记录吗？')) {
            setIsSaving(true);
            try {
                await onDelete(item.id);
                onClose();
            } catch (error) {
                console.error("Delete failed", error);
                alert("删除失败");
            } finally {
                setIsSaving(false);
            }
        }
    };

    // Album-style grid layout for multiple images
    const renderImageGrid = () => {
        if (images.length === 0) {
            return (
                <div className="w-full h-48 flex items-center justify-center text-gray-300 bg-gray-100 rounded-2xl">
                    <ImageIcon size={48} />
                </div>
            );
        }

        if (images.length === 1) {
            const img = images[0];
            const isVideo = isVideoUrl(img);
            return (
                <div
                    className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group"
                    onClick={() => setViewingImageIndex(0)}
                >
                    {isVideo ? (
                        <>
                            <video src={img} className="w-full h-full object-cover" muted playsInline />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                                    <Play size={28} className="text-white ml-1" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
                {images.map((img, idx) => {
                    const isVideo = isVideoUrl(img);
                    const isPrimary = idx === 0;
                    return (
                        <div
                            key={idx}
                            className={`relative ${isPrimary ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'} bg-gray-100 overflow-hidden cursor-pointer group aspect-square`}
                            onClick={() => setViewingImageIndex(idx)}
                        >
                            {isVideo ? (
                                <video src={img} className="w-full h-full object-cover" muted playsInline />
                            ) : (
                                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            )}

                            {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                                        <Play size={20} className="text-white ml-0.5" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Full screen image viewer
    const renderFullViewer = () => {
        if (viewingImageIndex === null) return null;

        const currentImage = images[viewingImageIndex];
        const isVideo = isVideoUrl(currentImage);

        return (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent safe-area-top">
                    <button
                        onClick={() => setViewingImageIndex(null)}
                        className="text-white p-2 rounded-full hover:bg-white/10"
                    >
                        <X size={24} />
                    </button>
                    <span className="text-white text-sm font-medium">
                        {viewingImageIndex + 1} / {images.length}
                    </span>
                    <div className="w-10"></div>
                </div>

                {/* Image/Video */}
                <div className="flex-1 flex items-center justify-center p-4">
                    {isVideo ? (
                        <video
                            src={currentImage}
                            className="max-w-full max-h-full object-contain"
                            controls
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <img
                            src={currentImage}
                            alt=""
                            className="max-w-full max-h-full object-contain"
                            style={{ touchAction: 'pinch-zoom' }}
                        />
                    )}
                </div>

                {/* Navigation */}
                {images.length > 1 && (
                    <>
                        {viewingImageIndex > 0 && (
                            <button
                                onClick={() => setViewingImageIndex(viewingImageIndex - 1)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        {viewingImageIndex < images.length - 1 && (
                            <button
                                onClick={() => setViewingImageIndex(viewingImageIndex + 1)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </>
                )}

                {/* Thumbnails + Actions */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-black/70 to-transparent">
                    {images.length > 1 && (
                        <div className="flex justify-center gap-2 mb-4">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setViewingImageIndex(idx)}
                                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === viewingImageIndex ? 'border-white scale-110' : 'border-transparent opacity-60'
                                        }`}
                                >
                                    {isVideoUrl(img) ? (
                                        <video src={img} className="w-full h-full object-cover" muted playsInline />
                                    ) : (
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={() => downloadFile(currentImage)}
                            className="bg-white/15 hover:bg-white/25 text-white px-5 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Download size={18} />
                            <span className="text-sm font-bold">下载原图</span>
                        </button>
                        {onDeleteImage && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('确定要删除这张图片吗？')) {
                                        await onDeleteImage(currentImage);
                                        if (images.length <= 1) {
                                            setViewingImageIndex(null);
                                        } else if (viewingImageIndex >= images.length - 1) {
                                            setViewingImageIndex(images.length - 2);
                                        }
                                    }
                                }}
                                className="bg-red-500/80 hover:bg-red-500 text-white px-5 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Trash2 size={18} />
                                <span className="text-sm font-bold">删除</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div
                className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] p-0 sm:p-4 animate-fade-in"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                {/* Modal Content - reduced height, safe area aware */}
                <div
                    className="bg-white w-full max-w-md max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
                    style={{ touchAction: 'pan-y' }}
                >
                    {/* Close button in header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-lg font-bold text-text-main truncate max-w-[200px]">{item.title}</h2>
                        <div className="w-6"></div>
                    </div>

                    {/* Content */}
                    <div
                        className="flex-1 min-h-0 overflow-y-auto p-4 bg-white"
                        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
                    >
                        {/* Image Gallery */}
                        <div className="mb-4">
                            {renderImageGrid()}
                            {images.length > 0 && (
                                <p className="text-center text-xs text-gray-400 mt-2">点击图片查看大图</p>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-1">标题</label>
                                    <input
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-text-main font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-400 block mb-1">日期</label>
                                        <input
                                            type="date"
                                            value={editDate}
                                            onChange={e => setEditDate(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-text-main font-medium outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-400 block mb-1">地点</label>
                                        <input
                                            value={editLocation}
                                            onChange={e => setEditLocation(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-text-main font-medium outline-none"
                                        />
                                    </div>
                                </div>
                                {type === 'timeline' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1">备注</label>
                                        <textarea
                                            value={editNote}
                                            onChange={e => setEditNote(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-text-main font-medium min-h-[100px] resize-none outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-text-sub text-sm">
                                        <Calendar size={16} />
                                        <span>{editDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-text-sub text-sm">
                                        <MapPin size={16} />
                                        <span>{item.location}</span>
                                    </div>
                                </div>

                                {'note' in item && item.note && (
                                    <div className="bg-gray-50 p-4 rounded-xl text-gray-600 leading-relaxed text-sm">
                                        {item.note}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-gray-100 bg-white flex gap-3 flex-shrink-0">
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/30"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                保存修改
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-blue-100"
                                >
                                    <Edit2 size={16} />
                                    编辑
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-red-100"
                                >
                                    <Trash2 size={16} />
                                    删除
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Full screen image viewer */}
            {renderFullViewer()}
        </>
    );
};

