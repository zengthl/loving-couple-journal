import { supabase } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadResult {
    url: string;
    path: string;
    error?: string;
}

/**
 * Upload a single image to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user's ID (used for folder structure)
 * @param folder - Optional folder name (e.g., 'timeline', 'discovery', 'anniversary')
 * @returns Upload result with URL or error
 */
export async function uploadImage(
    file: File,
    userId: string,
    folder: string = 'general'
): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            url: '',
            path: '',
            error: '只支持 JPG、PNG、WebP 和 GIF 格式的图片'
        };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            url: '',
            path: '',
            error: '图片大小不能超过 5MB'
        };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${folder}/${fileName}`;

    try {
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('user-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            return {
                url: '',
                path: '',
                error: '上传失败，请重试'
            };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('user-images')
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            path: filePath,
        };
    } catch (error) {
        console.error('Upload exception:', error);
        return {
            url: '',
            path: '',
            error: '上传失败，请重试'
        };
    }
}

/**
 * Upload multiple images
 * @param files - Array of files to upload
 * @param userId - The user's ID
 * @param folder - Optional folder name
 * @returns Array of upload results
 */
export async function uploadMultipleImages(
    files: File[],
    userId: string,
    folder: string = 'general'
): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => uploadImage(file, userId, folder));
    return Promise.all(uploadPromises);
}

/**
 * Delete an image from storage
 * @param path - The file path in storage
 */
export async function deleteImage(path: string): Promise<boolean> {
    try {
        const { error } = await supabase.storage
            .from('user-images')
            .remove([path]);

        if (error) {
            console.error('Delete error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Delete exception:', error);
        return false;
    }
}

/**
 * Compress image before upload (optional helper)
 * @param file - Original file
 * @param maxWidth - Maximum width
 * @param quality - Quality (0-1)
 * @returns Compressed file
 */
export function compressImage(
    file: File,
    maxWidth: number = 1200,
    quality: number = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('压缩失败'));
                            return;
                        }
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('图片加载失败'));
        };

        reader.onerror = () => reject(new Error('文件读取失败'));
    });
}
