import React, { useState } from 'react';
import { ArrowLeft, MapPin, Upload, Camera, Utensils, ShoppingBag, Store, PartyPopper, X } from 'lucide-react';
import { DiscoveryType, DiscoveryItem } from '../types';
import { uploadMultipleImages, compressImage } from '../lib/storage';

interface PublishScreenProps {
    onBack: () => void;
    onPublish: (item: Omit<DiscoveryItem, 'id' | 'checked'>) => void;
    userId: string;
}

const CATEGORIES: { type: DiscoveryType; label: string; icon: React.FC<any>; color: string }[] = [
    { type: 'food', label: '美食', icon: Utensils, color: 'text-orange-500 bg-orange-50' },
    { type: 'goods', label: '好物', icon: ShoppingBag, color: 'text-pink-500 bg-pink-50' },
    { type: 'shop', label: '好店', icon: Store, color: 'text-blue-500 bg-blue-50' },
    { type: 'fun', label: '好玩', icon: PartyPopper, color: 'text-purple-500 bg-purple-50' },
];

export const PublishScreen: React.FC<PublishScreenProps> = ({ onBack, onPublish, userId }) => {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [selectedType, setSelectedType] = useState<DiscoveryType>('food');
    const [images, setImages] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files: File[] = Array.from(e.target.files);

        // Create previews
        const newPreviews: string[] = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === files.length) {
                    setPreviews([...previews, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setSelectedFiles([...selectedFiles, ...files]);
    };

    const removeImage = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title || !location || selectedFiles.length === 0) return;

        setUploading(true);

        try {
            // Compress and upload images
            const compressedFiles = await Promise.all(
                selectedFiles.map(file => compressImage(file, 1200, 0.85))
            );

            const results = await uploadMultipleImages(compressedFiles, userId, 'discovery');
            const urls = results.map(r => r.url);

            onPublish({
                image: urls[0], // Use first image as cover
                title,
                location,
                type: selectedType,
                date: new Date().toISOString(),
                topBadge: false
            });
        } catch (error) {
            console.error('Upload error:', error);
            alert('上传失败,请重试');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-text-main" />
                </button>
                <span className="text-lg font-bold text-text-main">发布记录</span>
                <button
                    onClick={handleSubmit}
                    disabled={!title || !location || selectedFiles.length === 0 || uploading}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${title && location && selectedFiles.length > 0 && !uploading
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {uploading ? '上传中...' : '发布'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {/* Category Selector */}
                <div className="flex justify-between gap-2 mb-8 mt-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.type}
                            onClick={() => setSelectedType(cat.type)}
                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${selectedType === cat.type
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-transparent hover:bg-gray-50'
                                }`}
                        >
                            <div className={`p-2.5 rounded-xl ${cat.color}`}>
                                <cat.icon size={20} />
                            </div>
                            <span className={`text-xs font-bold ${selectedType === cat.type ? 'text-primary' : 'text-gray-500'}`}>
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Inputs */}
                <div className="space-y-6">
                    {/* Image Uploader */}
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        <label className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer group">
                            <Camera size={24} />
                            <span className="text-[10px] font-medium">添加照片</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>

                        {previews.map((preview, idx) => (
                            <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                                <img src={preview} alt="Upload" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="填写标题会有更多人喜欢哦~"
                            className="w-full text-xl font-bold placeholder:text-gray-300 border-none p-0 focus:ring-0 text-text-main"
                        />

                        <textarea
                            placeholder="分享你此刻的想法..."
                            className="w-full h-32 text-base placeholder:text-gray-400 border-none p-0 focus:ring-0 text-text-main resize-none"
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <button className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors py-2 px-3 -ml-3 rounded-xl hover:bg-gray-50 bg-gray-50/50 w-full mb-2">
                            <MapPin size={18} />
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="添加地点"
                                className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium placeholder:text-text-sub w-full"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
