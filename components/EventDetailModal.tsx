import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, MapPin, Calendar, Image as ImageIcon, Save, Check, Loader2 } from 'lucide-react';
import { TimelineEvent, DiscoveryItem } from '../types';

type DetailItem = TimelineEvent | DiscoveryItem;

interface EventDetailModalProps {
    isOpen: boolean;
    item: DetailItem;
    type: 'timeline' | 'discovery'; // To distinguish fields if needed
    onClose: () => void;
    onDelete: (id: string) => Promise<void>;
    onUpdate: (id: string, data: Partial<DetailItem>) => Promise<void>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
    isOpen,
    item,
    type,
    onClose,
    onDelete,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

            // Disable body scroll when modal is open
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${window.scrollY}px`;
        }

        return () => {
            // Re-enable body scroll when modal closes
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] p-0 sm:p-4 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal Content */}
            <div
                className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
                style={{ touchAction: 'pan-y' }}
            >

                {/* Header Image Slide */}
                <div className="relative h-64 bg-gray-100 flex-shrink-0">
                    {images.length > 0 ? (
                        <img
                            src={images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={48} />
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">
                            1 / {images.length}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div
                    className="flex-1 overflow-y-auto p-6 bg-white"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
                >
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
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-text-main leading-tight">{item.title}</h2>
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
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
                <div className="p-4 border-t border-gray-100 bg-white flex gap-3 flex-shrink-0">
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
    );
};
