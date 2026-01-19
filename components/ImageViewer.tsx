import React from 'react';
import { X, Trash2 } from 'lucide-react';

interface ImageViewerProps {
    isOpen: boolean;
    imageUrl: string;
    onClose: () => void;
    onDelete?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
    isOpen,
    imageUrl,
    onClose,
    onDelete
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 p-2 rounded-full backdrop-blur-sm z-10 transition-colors"
            >
                <X size={24} />
            </button>

            {/* Image */}
            <div className="w-full h-full flex items-center justify-center p-4">
                <img
                    src={imageUrl}
                    alt="Full screen view"
                    className="max-h-full max-w-full object-contain shadow-2xl"
                />
            </div>

            {/* Delete Button (Optional) */}
            {onDelete && (
                <button
                    onClick={() => {
                        if (window.confirm('确定要删除这张照片吗？')) {
                            onDelete();
                        }
                    }}
                    className="absolute bottom-8 bg-red-500/80 hover:bg-red-500 text-white px-6 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
                >
                    <Trash2 size={18} />
                    <span className="text-sm font-bold">删除照片</span>
                </button>
            )}
        </div>
    );
};
