import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Image as ImageIcon, MapPin, Play, Download, CheckCircle, Loader, Plus, X } from 'lucide-react';
import { Province, ProvinceVisit, CitySummary, AlbumViewMode } from '../types';
import { ImageViewer } from '../components/ImageViewer';
import { ImageUploader } from '../components/ImageUploader';
import { fetchProvinceVisits, groupVisitsByCity, addPhotosToVisit, deletePhotoFromVisit, createVisit, deleteCityAlbum, normalizeCityName } from '../lib/db';
import { CitySelectScreen } from './CitySelectScreen';
import { CityTimelineScreen } from './CityTimelineScreen';
import { OptimizedImage } from '../components/OptimizedImage';
import { isVideoUrl } from '../lib/media';

interface AlbumListScreenProps {
  provinces: Province[];
  onBack: () => void;
  userId: string;
  onRefresh: () => void;
  onDeletePhoto?: (photoUrl: string) => Promise<void>;
  isGuest?: boolean;
}

const LIVE_PHOTO_MAX_SECONDS = 4.5;
const LIVE_PHOTO_PRESS_DELAY_MS = 200;

// Download file function
const downloadFile = async (url: string, filename?: string): Promise<void> => {
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
    window.open(url, '_blank');
  }
};

// Batch download with delay
const batchDownload = async (
  urls: string[],
  onProgress: (current: number, total: number) => void
): Promise<void> => {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const extension = url.split('.').pop()?.split('?')[0] || 'file';
    const filename = `photo_${i + 1}.${extension}`;
    await downloadFile(url, filename);
    onProgress(i + 1, urls.length);
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

export const AlbumListScreen: React.FC<AlbumListScreenProps> = ({
  provinces,
  onBack,
  userId,
  onRefresh,
  onDeletePhoto,
  isGuest
}) => {
  // Navigation state
  const [viewMode, setViewMode] = useState<AlbumViewMode>(AlbumViewMode.PROVINCE_LIST);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityVisits, setCityVisits] = useState<ProvinceVisit[]>([]);
  const [citySummaries, setCitySummaries] = useState<CitySummary[]>([]);

  // Photo viewer state
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const [viewingVisitId, setViewingVisitId] = useState<string | null>(null);

  // Selection mode state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetVisitId, setUploadTargetVisitId] = useState<string | null>(null);

  // Live photo detection
  const [livePhotoMap, setLivePhotoMap] = useState<Record<string, boolean>>({});

  const visitedProvinces = provinces.filter(p => p.visited);

  const refreshProvinceVisits = useCallback(async (provinceId: string) => {
    const visits = await fetchProvinceVisits('', provinceId);
    const summaries = groupVisitsByCity(visits);
    setCityVisits(visits);
    setCitySummaries(summaries);
    return { visits, summaries };
  }, []);

  // Handle province click - check if multiple cities exist
  const handleProvinceClick = useCallback(async (province: Province) => {
    setSelectedProvince(province);

    // Fetch visits for this province (shared journal - all users)
    const visits = await fetchProvinceVisits('', province.id);

    if (visits.length === 0) {
      // No visits, show empty state
      setCityVisits([]);
      setCitySummaries([]);
      setViewMode(AlbumViewMode.PHOTO_GRID);
      return;
    }

    // Group visits by city
    const summaries = groupVisitsByCity(visits);
    setCitySummaries(summaries);
    setCityVisits(visits);

    if (summaries.length === 1) {
      // Only one city - check if multiple visits
      const city = summaries[0];
      if (city.visits.length === 1) {
        // Single visit - show photo grid directly
        setSelectedCity(city.cityName);
        setViewMode(AlbumViewMode.PHOTO_GRID);
      } else {
        // Multiple visits to same city - show timeline
        setSelectedCity(city.cityName);
        setViewMode(AlbumViewMode.CITY_TIMELINE);
      }
    } else {
      // Multiple cities - show city selection
      setViewMode(AlbumViewMode.CITY_SELECT);
    }
  }, [userId]);

  // Handle city click from city selection screen
  const handleCityClick = useCallback((cityName: string) => {
    setSelectedCity(cityName);
    const citySummary = citySummaries.find(c => c.cityName === cityName);

    if (citySummary && citySummary.visits.length > 1) {
      // Multiple visits - show timeline
      setViewMode(AlbumViewMode.CITY_TIMELINE);
    } else {
      // Single visit - show photo grid
      setViewMode(AlbumViewMode.PHOTO_GRID);
    }
  }, [citySummaries]);

  const handleDeleteCityAlbum = useCallback(async (city: CitySummary): Promise<boolean> => {
    if (!selectedProvince || isGuest) {
      return false;
    }

    const deletedPhotoUrls = await deleteCityAlbum(
      userId,
      selectedProvince.id,
      city.visits.map((visit) => visit.id)
    );

    if (deletedPhotoUrls === null) {
      return false;
    }

    if (onDeletePhoto) {
      for (const photoUrl of deletedPhotoUrls) {
        await onDeletePhoto(photoUrl);
      }
    }

    const { summaries } = await refreshProvinceVisits(selectedProvince.id);
    onRefresh();

    if (summaries.length === 0) {
      setViewMode(AlbumViewMode.PROVINCE_LIST);
      setSelectedProvince(null);
      setSelectedCity(null);
      return true;
    }

    if (!summaries.some((summary) => summary.cityName === city.cityName)) {
      setSelectedCity(null);
    }

    return true;
  }, [isGuest, onDeletePhoto, onRefresh, refreshProvinceVisits, selectedProvince, userId]);

  // Get photos for current view
  const getCurrentPhotos = useCallback((): string[] => {
    if (!selectedCity) {
      // Return all photos from all cities
      return cityVisits.flatMap(v => v.photos);
    }
    const citySummary = citySummaries.find(c => c.cityName === selectedCity);
    return citySummary ? citySummary.visits.flatMap(v => v.photos) : [];
  }, [selectedCity, citySummaries, cityVisits]);

  // Get visits for current city
  const getCurrentVisits = useCallback((): ProvinceVisit[] => {
    if (!selectedCity) return cityVisits;
    return cityVisits.filter(v => normalizeCityName(v.city) === selectedCity);
  }, [selectedCity, cityVisits]);

  // Handle delete photo from specific visit
  const handleDeletePhoto = async () => {
    if (!viewingPhoto || !selectedProvince) return;

    // Find the visit that contains this photo
    const visit = cityVisits.find(v => v.photos.includes(viewingPhoto));
    if (!visit) return;

    const success = await deletePhotoFromVisit(visit.id, viewingPhoto);
    if (success) {
      const photoToDelete = viewingPhoto;
      setViewingPhoto(null);

      // Sync to timeline if needed
      if (onDeletePhoto) {
        await onDeletePhoto(photoToDelete);
      }

      // Refresh data
      const visits = await fetchProvinceVisits('', selectedProvince.id);
      setCityVisits(visits);
      setCitySummaries(groupVisitsByCity(visits));
      onRefresh();
    } else {
      alert('删除失败，请重试');
    }
  };

  // Handle add photos to visit (photos already uploaded by ImageUploader)
  const handleAddPhotosToVisit = async (uploadedUrls: string[]) => {
    if (!uploadTargetVisitId || !selectedProvince) return;

    setIsUploading(true);
    try {
      const success = await addPhotosToVisit(uploadTargetVisitId, uploadedUrls);
      if (success) {
        const visits = await fetchProvinceVisits('', selectedProvince.id);
        setCityVisits(visits);
        setCitySummaries(groupVisitsByCity(visits));
        onRefresh();
      }
    } catch (err) {
      console.error('Add photos error:', err);
      alert('添加照片失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadTargetVisitId(null);
    }
  };

  // Handle create new visit (photos already uploaded by ImageUploader)
  const handleCreateVisit = async (city: string | null, visitDate: string, uploadedUrls: string[]) => {
    if (!selectedProvince) return;

    setIsUploading(true);
    try {
      const visit = await createVisit(userId, selectedProvince.id, city, visitDate, uploadedUrls);
      if (visit) {
        const visits = await fetchProvinceVisits('', selectedProvince.id);
        setCityVisits(visits);
        setCitySummaries(groupVisitsByCity(visits));
        onRefresh();
      }
    } catch (err) {
      console.error('Create visit error:', err);
      alert('创建到访记录失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle photo selection
  const togglePhotoSelection = (photo: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photo)) {
      newSelected.delete(photo);
    } else {
      newSelected.add(photo);
    }
    setSelectedPhotos(newSelected);
  };

  // Handle batch download
  const handleBatchDownload = async () => {
    if (selectedPhotos.size === 0) return;
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: selectedPhotos.size });
    try {
      await batchDownload(
        Array.from(selectedPhotos),
        (current, total) => setDownloadProgress({ current, total })
      );
    } finally {
      setIsDownloading(false);
      setIsSelectMode(false);
      setSelectedPhotos(new Set());
    }
  };

  // Handle download all
  const handleDownloadAll = async () => {
    const photos = getCurrentPhotos();
    if (photos.length === 0) return;
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: photos.length });
    try {
      await batchDownload(photos, (current, total) => setDownloadProgress({ current, total }));
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    const photos = getCurrentPhotos();
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos));
    }
  };

  // Handle download single photo
  const handleDownloadPhoto = async (photoUrl: string) => {
    await downloadFile(photoUrl);
  };

  // Update live photo status
  const updateLivePhotoStatus = (photoUrl: string, duration: number) => {
    if (!Number.isFinite(duration) || duration <= 0) return;
    const isLive = duration <= LIVE_PHOTO_MAX_SECONDS;
    setLivePhotoMap(prev => {
      if (prev[photoUrl] === isLive) return prev;
      return { ...prev, [photoUrl]: isLive };
    });
  };

  // Render City Selection Screen
  if (viewMode === AlbumViewMode.CITY_SELECT && selectedProvince) {
    return (
      <CitySelectScreen
        provinceName={selectedProvince.name}
        cities={citySummaries}
        onCitySelect={handleCityClick}
        onDeleteCityAlbum={handleDeleteCityAlbum}
        onBack={() => {
          setViewMode(AlbumViewMode.PROVINCE_LIST);
          setSelectedProvince(null);
          setSelectedCity(null);
        }}
        isGuest={isGuest}
      />
    );
  }

  // Render City Timeline Screen
  if (viewMode === AlbumViewMode.CITY_TIMELINE && selectedProvince && selectedCity) {
    const cityVisitList = citySummaries.find((summary) => summary.cityName === selectedCity)?.visits || [];
    return (
      <CityTimelineScreen
        cityName={selectedCity}
        provinceName={selectedProvince.name}
        visits={cityVisitList}
        onBack={() => {
          if (citySummaries.length > 1) {
            setViewMode(AlbumViewMode.CITY_SELECT);
            setSelectedCity(null);
          } else {
            setViewMode(AlbumViewMode.PROVINCE_LIST);
            setSelectedProvince(null);
            setSelectedCity(null);
          }
        }}
        onAddPhotos={(visitId) => {
          if (isGuest) return;
          setUploadTargetVisitId(visitId);
        }}
        onDeletePhoto={async (visitId, photoUrl) => {
          if (isGuest) return;
          await deletePhotoFromVisit(visitId, photoUrl);
          const visits = await fetchProvinceVisits('', selectedProvince.id);
          setCityVisits(visits);
          setCitySummaries(groupVisitsByCity(visits));
          onRefresh();
        }}
        onDownloadPhoto={handleDownloadPhoto}
        isGuest={isGuest}
      />
    );
  }

  // Render Photo Grid for selected province/city
  if (viewMode === AlbumViewMode.PHOTO_GRID && selectedProvince) {
    const photos = getCurrentPhotos();
    const visits = getCurrentVisits();

    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={() => {
              if (citySummaries.length > 1) {
                setViewMode(AlbumViewMode.CITY_SELECT);
                setSelectedCity(null);
              } else {
                setViewMode(AlbumViewMode.PROVINCE_LIST);
                setSelectedProvince(null);
                setSelectedCity(null);
              }
              setIsSelectMode(false);
              setSelectedPhotos(new Set());
            }}
            className="flex items-center gap-1 text-primary font-medium hover:opacity-80"
          >
            <ArrowLeft size={20} />
            返回
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-base font-bold text-text-main">
              {selectedCity || selectedProvince.name}
            </h1>
            <span className="text-[10px] text-gray-400">{photos.length} 张照片</span>
          </div>
          <div className="flex items-center gap-2">
            {isSelectMode ? (
              <button
                onClick={() => { setIsSelectMode(false); setSelectedPhotos(new Set()); }}
                className="text-primary text-sm font-medium"
              >
                取消
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="text-primary text-sm font-medium"
                >
                  选择
                </button>
                <button
                  onClick={handleDownloadAll}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  title="下载全部"
                >
                  <Download size={20} className="text-text-main" />
                </button>
                {!isGuest && (
                  <button
                    onClick={() => {
                      // Create new visit with today's date
                      const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');
                      setUploadTargetVisitId('new');
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    title="添加照片"
                  >
                    <Plus size={20} className="text-text-main" />
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {/* Selection Mode Toolbar */}
        {isSelectMode && (
          <div className="sticky top-[57px] z-10 bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100">
            <button onClick={handleSelectAll} className="text-sm text-primary font-medium">
              {selectedPhotos.size === photos.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-gray-500">已选择 {selectedPhotos.size} 项</span>
            <button
              onClick={handleBatchDownload}
              disabled={selectedPhotos.size === 0 || isDownloading}
              className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${
                selectedPhotos.size > 0 && !isDownloading ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Download size={14} />
              下载
            </button>
          </div>
        )}

        {/* Download Progress */}
        {isDownloading && (
          <div className="sticky top-[57px] z-10 bg-primary/10 px-4 py-3 flex items-center justify-center gap-3">
            <Loader className="animate-spin text-primary" size={18} />
            <span className="text-sm font-medium text-primary">
              正在下载 {downloadProgress.current}/{downloadProgress.total}...
            </span>
          </div>
        )}

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-1">
          {visits.length > 0 ? (
            visits.map(visit => {
              const cityName = normalizeCityName(visit.city);
              return (
                <div key={visit.id} className="mb-6">
                  {/* Visit Header */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      <h3 className="text-base font-bold text-text-main">
                        {citySummaries.length > 1 ? cityName : visit.visitDate}
                      </h3>
                      <span className="text-xs text-gray-400 ml-1">
                        {visit.photos.length} 张
                      </span>
                    </div>
                    {!isGuest && (
                      <button
                        onClick={() => setUploadTargetVisitId(visit.id)}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                  {/* Photos Grid */}
                  <div className="grid grid-cols-3 gap-0.5 mb-0.5">
                    {visit.photos.map((photo, idx) => {
                      const isVideo = isVideoUrl(photo);
                      const isSelected = selectedPhotos.has(photo);
                      const isLivePhoto = isVideo && livePhotoMap[photo] === true;

                      return (
                        <div
                          key={`${visit.id}-${idx}`}
                          className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => {
                            if (isSelectMode) {
                              togglePhotoSelection(photo);
                            } else {
                              setViewingPhoto(photo);
                              setViewingVisitId(visit.id);
                            }
                          }}
                        >
                          {isVideo ? (
                            <video
                              src={photo}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                              onLoadedMetadata={(e) => updateLivePhotoStatus(photo, e.currentTarget.duration)}
                            />
                          ) : (
                            <OptimizedImage src={photo} alt="" variant="thumb" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          )}

                          {isLivePhoto && (
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold tracking-widest">
                              LIVE
                            </div>
                          )}

                          {!isLivePhoto && isVideo && !isSelectMode && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                                <Play size={20} className="text-white ml-0.5" />
                              </div>
                            </div>
                          )}

                          {isSelectMode && (
                            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-primary border-primary' : 'bg-white/80 border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle size={16} className="text-white" />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-text-sub">
              <ImageIcon size={48} className="mb-4 opacity-30" />
              <p>暂无照片</p>
              {!isGuest && (
                <button
                  onClick={() => setUploadTargetVisitId('new')}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-full text-sm font-medium"
                >
                  添加照片
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {uploadTargetVisitId && !isGuest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
            <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-main">
                  {uploadTargetVisitId === 'new' ? '新建到访记录' : '添加照片'}
                </h3>
                <button
                  onClick={() => setUploadTargetVisitId(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {uploadTargetVisitId === 'new' ? (
                <NewVisitForm
                  cityName={selectedCity}
                  userId={userId}
                  onSubmit={(date, uploadedUrls) => {
                    handleCreateVisit(selectedCity, date, uploadedUrls);
                    setUploadTargetVisitId(null);
                  }}
                  onCancel={() => setUploadTargetVisitId(null)}
                />
              ) : (
                <AddPhotosForm
                  userId={userId}
                  onSubmit={(uploadedUrls) => {
                    handleAddPhotosToVisit(uploadedUrls);
                    setUploadTargetVisitId(null);
                  }}
                  onCancel={() => setUploadTargetVisitId(null)}
                />
              )}
            </div>
          </div>
        )}

        {/* Full Screen Viewer */}
        <ImageViewer
          isOpen={!!viewingPhoto}
          imageUrl={viewingPhoto || ''}
          onClose={() => setViewingPhoto(null)}
          onDelete={handleDeletePhoto}
        />
      </div>
    );
  }

  // Province List View (default)
  return (
    <div className="flex flex-col h-full bg-background-light">
      <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-text-main" />
        </button>
        <h1 className="text-xl font-bold text-text-main">足迹相册</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {visitedProvinces.map(province => {
            const firstPhoto = province.photos[0];
            const isFirstPhotoVideo = firstPhoto && isVideoUrl(firstPhoto);

            return (
              <div
                key={province.id}
                onClick={() => handleProvinceClick(province)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2 shadow-sm group-hover:shadow-md transition-all">
                  {province.photos.length > 0 ? (
                    isFirstPhotoVideo ? (
                      <video src={firstPhoto} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" muted playsInline />
                    ) : (
                      <OptimizedImage src={firstPhoto} alt={province.name} variant="card" loading="lazy" decoding="async" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>

                  {isFirstPhotoVideo && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                      <Play size={12} className="text-white ml-0.5" />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg font-bold leading-none">{province.name}</h3>
                    <span className="text-[10px] opacity-80">{province.photos.length} 张照片</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <ImageIcon size={24} />
            </div>
            <span className="text-xs font-bold">更多足迹等你点亮</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// New Visit Form Component
interface NewVisitFormProps {
  cityName: string | null;
  userId: string;
  onSubmit: (date: string, uploadedUrls: string[]) => void;
  onCancel: () => void;
}

const NewVisitForm: React.FC<NewVisitFormProps> = ({ cityName, userId, onSubmit, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleUploadComplete = (urls: string[]) => {
    setUploadedUrls(urls);
    setError('');
  };

  const handleSubmit = () => {
    if (uploadedUrls.length === 0) {
      setError('请先上传照片');
      return;
    }
    const formattedDate = date.replace(/-/g, '.');
    onSubmit(formattedDate, uploadedUrls);
  };

  return (
    <div className="space-y-4">
      {cityName && (
        <div>
          <label className="block text-sm font-medium text-text-sub mb-1">城市</label>
          <div className="px-4 py-3 bg-gray-50 rounded-xl text-text-main">{cityName}</div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-text-sub mb-1">到访日期</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 rounded-xl text-text-main"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-sub mb-1">照片</label>
        <ImageUploader
          userId={userId}
          folder="visits"
          maxImages={20}
          onUploadComplete={handleUploadComplete}
        />
      </div>
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
      {uploadedUrls.length > 0 && (
        <div className="text-sm text-green-600">已上传 {uploadedUrls.length} 张照片</div>
      )}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-100 rounded-xl text-text-main font-medium"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={uploadedUrls.length === 0}
          className={`flex-1 py-3 rounded-xl font-medium ${
            uploadedUrls.length > 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
          }`}
        >
          创建
        </button>
      </div>
    </div>
  );
};

// Add Photos Form Component
interface AddPhotosFormProps {
  userId: string;
  onSubmit: (uploadedUrls: string[]) => void;
  onCancel: () => void;
}

const AddPhotosForm: React.FC<AddPhotosFormProps> = ({ userId, onSubmit, onCancel }) => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleUploadComplete = (urls: string[]) => {
    setUploadedUrls(urls);
    setError('');
  };

  const handleSubmit = () => {
    if (uploadedUrls.length === 0) {
      setError('请先上传照片');
      return;
    }
    onSubmit(uploadedUrls);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-sub mb-1">选择照片</label>
        <ImageUploader
          userId={userId}
          folder="visits"
          maxImages={20}
          onUploadComplete={handleUploadComplete}
        />
      </div>
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
      {uploadedUrls.length > 0 && (
        <div className="text-sm text-green-600">已上传 {uploadedUrls.length} 张照片</div>
      )}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-100 rounded-xl text-text-main font-medium"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={uploadedUrls.length === 0}
          className={`flex-1 py-3 rounded-xl font-medium ${
            uploadedUrls.length > 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
          }`}
        >
          添加
        </button>
      </div>
    </div>
  );
};
