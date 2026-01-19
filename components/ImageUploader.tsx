import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { uploadMultipleImages, compressImage } from '../lib/storage';

interface ImageUploaderProps {
    userId: string;
    folder?: string;
    maxImages?: number;
    onUploadComplete: (urls: string[]) => void;
    children?: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    userId,
    folder = 'general',
    maxImages = 9,
    onUploadComplete,
    children
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: File[] = Array.from(e.target.files || []);

        if (files.length + selectedFiles.length > maxImages) {
            setError(`最多只能选择 ${maxImages} 张图片`);
            return;
        }

        setError('');

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

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('请先选择图片');
            return;
        }

        setUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            // Compress images before upload
            const compressedFiles = await Promise.all(
                selectedFiles.map(file => compressImage(file, 1200, 0.85))
            );

            // Upload to Supabase
            const results = await uploadMultipleImages(compressedFiles, userId, folder);

            // Check for errors
            const errors = results.filter(r => r.error);
            if (errors.length > 0) {
                setError(errors[0].error || '上传失败');
                setUploading(false);
                return;
            }

            // Get URLs
            const urls = results.map(r => r.url);

            setUploadProgress(100);
            onUploadComplete(urls);

            // Clear selection
            setSelectedFiles([]);
            setPreviews([]);

        } catch (err) {
            console.error('Upload error:', err);
            setError('上传失败，请重试');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Trigger Button */}
            {children ? (
                <div onClick={() => fileInputRef.current?.click()}>
                    {children}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                    <Upload size={32} className="text-gray-400" />
                    <p className="text-sm font-medium text-text-sub">点击选择图片</p>
                    <p className="text-xs text-text-sub/60">支持 JPG、PNG、WebP、GIF（最大 5MB）</p>
                </button>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Preview Grid */}
            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                            >
                                <X size={16} className="text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && !uploading && (
                <button
                    onClick={handleUpload}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
                >
                    上传 {selectedFiles.length} 张图片
                </button>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className="flex items-center justify-center gap-3 py-3">
                    <Loader className="animate-spin text-primary" size={20} />
                    <span className="text-sm font-medium text-text-sub">上传中...</span>
                </div>
            )}
        </div>
    );
};
