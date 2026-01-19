import React, { useState, useRef } from 'react';
import { X, Trash2, Download, Play, Pause } from 'lucide-react';

interface ImageViewerProps {
    isOpen: boolean;
    imageUrl: string;
    onClose: () => void;
    onDelete?: () => void;
}

// Helper to check if URL is a video
const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
};

// Download file function
const downloadFile = async (url: string, filename?: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || url.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback: open in new tab
        window.open(url, '_blank');
    }
};

export const ImageViewer: React.FC<ImageViewerProps> = ({
    isOpen,
    imageUrl,
    onClose,
    onDelete
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    if (!isOpen) return null;

    const isVideo = isVideoUrl(imageUrl);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleDownload = () => {
        const extension = imageUrl.split('.').pop()?.split('?')[0] || 'file';
        const filename = `download_${Date.now()}.${extension}`;
        downloadFile(imageUrl, filename);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 p-2 rounded-full backdrop-blur-sm z-10 transition-colors"
            >
                <X size={24} />
            </button>

            {/* Media Content */}
            <div className="w-full h-full flex items-center justify-center p-4 pb-24">
                {isVideo ? (
                    <div className="relative max-h-full max-w-full">
                        <video
                            ref={videoRef}
                            src={imageUrl}
                            className="max-h-full max-w-full object-contain shadow-2xl"
                            playsInline
                            loop
                            onClick={togglePlay}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                        {/* Play/Pause Overlay */}
                        {!isPlaying && (
                            <button
                                onClick={togglePlay}
                                className="absolute inset-0 flex items-center justify-center bg-black/20"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                    <Play size={32} className="text-gray-800 ml-1" />
                                </div>
                            </button>
                        )}
                    </div>
                ) : (
                    <img
                        src={imageUrl}
                        alt="Full screen view"
                        className="max-h-full max-w-full object-contain shadow-2xl"
                    />
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-center gap-6">
                    {/* Video Play/Pause Button */}
                    {isVideo && (
                        <button
                            onClick={togglePlay}
                            className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            <span className="text-sm font-medium">{isPlaying ? '暂停' : '播放'}</span>
                        </button>
                    )}

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        className="bg-primary/80 hover:bg-primary text-white px-5 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Download size={18} />
                        <span className="text-sm font-bold">下载原图</span>
                    </button>

                    {/* Delete Button */}
                    {onDelete && (
                        <button
                            onClick={() => {
                                if (window.confirm('确定要删除这张照片吗？')) {
                                    onDelete();
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

