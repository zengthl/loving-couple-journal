import React, { useState, useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { Menu, X, Upload, BookOpen, Image as ImageIcon, Calendar, Navigation } from 'lucide-react';
import { Province } from '../types';
import chinaGeoJSON from '../data/china.json';

interface MapScreenProps {
  provinces: Province[];
  onNavigateToUpload: () => void;
  onNavigateToAlbums: () => void;
  isGuest?: boolean;
}

// 省份名称到ID的映射
const provinceNameToId: Record<string, string> = {
  '北京市': 'beijing', '北京': 'beijing',
  '上海市': 'shanghai', '上海': 'shanghai',
  '天津市': 'tianjin', '天津': 'tianjin',
  '重庆市': 'chongqing', '重庆': 'chongqing',
  '四川省': 'sichuan', '四川': 'sichuan',
  '广东省': 'guangdong', '广东': 'guangdong',
  '河北省': 'hebei', '河北': 'hebei',
  '山西省': 'shanxi', '山西': 'shanxi',
  '辽宁省': 'liaoning', '辽宁': 'liaoning',
  '吉林省': 'jilin', '吉林': 'jilin',
  '黑龙江省': 'heilongjiang', '黑龙江': 'heilongjiang',
  '江苏省': 'jiangsu', '江苏': 'jiangsu',
  '浙江省': 'zhejiang', '浙江': 'zhejiang',
  '安徽省': 'anhui', '安徽': 'anhui',
  '福建省': 'fujian', '福建': 'fujian',
  '江西省': 'jiangxi', '江西': 'jiangxi',
  '山东省': 'shandong', '山东': 'shandong',
  '河南省': 'henan', '河南': 'henan',
  '湖北省': 'hubei', '湖北': 'hubei',
  '湖南省': 'hunan', '湖南': 'hunan',
  '海南省': 'hainan', '海南': 'hainan',
  '贵州省': 'guizhou', '贵州': 'guizhou',
  '云南省': 'yunnan', '云南': 'yunnan',
  '陕西省': 'shaanxi', '陕西': 'shaanxi',
  '甘肃省': 'gansu', '甘肃': 'gansu',
  '青海省': 'qinghai', '青海': 'qinghai',
  '台湾省': 'taiwan', '台湾': 'taiwan',
  '内蒙古自治区': 'neimenggu', '内蒙古': 'neimenggu',
  '广西壮族自治区': 'guangxi', '广西': 'guangxi',
  '西藏自治区': 'xizang', '西藏': 'xizang',
  '宁夏回族自治区': 'ningxia', '宁夏': 'ningxia',
  '新疆维吾尔自治区': 'xinjiang', '新疆': 'xinjiang',
  '香港特别行政区': 'hongkong', '香港': 'hongkong',
  '澳门特别行政区': 'macau', '澳门': 'macau',
};

export const MapScreen: React.FC<MapScreenProps> = ({ provinces, onNavigateToUpload, onNavigateToAlbums, isGuest }) => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const totalProvinces = 34;
  const visitedCount = provinces.filter(p => p.visited).length;
  const percentage = Math.round((visitedCount / totalProvinces) * 100);

  const getLevel = (count: number) => {
    if (count >= 34) return 6;
    if (count >= 26) return 5;
    if (count >= 16) return 4;
    if (count >= 9) return 3;
    if (count >= 4) return 2;
    return 1;
  };

  // 创建地图数据
  const getMapData = () => {
    const visitedProvinceIds = new Set(
      provinces.filter(p => p.visited).map(p => p.id)
    );

    // 从GeoJSON获取所有省份名称
    const features = (chinaGeoJSON as any).features || [];
    return features.map((feature: any) => {
      const name = feature.properties?.name || '';
      const provinceId = provinceNameToId[name] || provinceNameToId[name.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '')];
      const isVisited = visitedProvinceIds.has(provinceId);

      return {
        name: name,
        value: isVisited ? 1 : 0,
        provinceId: provinceId,
        itemStyle: {
          areaColor: isVisited ? '#ff6b6b' : '#e0e0e0',
          borderColor: isVisited ? '#ff4757' : '#cccccc',
          borderWidth: isVisited ? 2 : 1,
          shadowBlur: isVisited ? 10 : 0,
          shadowColor: isVisited ? 'rgba(255, 107, 107, 0.5)' : 'transparent',
        },
        emphasis: {
          itemStyle: {
            areaColor: isVisited ? '#ff4757' : '#c0c0c0',
          }
        }
      };
    });
  };


  useEffect(() => {
    if (!chartRef.current) return;

    // 注册地图
    echarts.registerMap('china', chinaGeoJSON as any);

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      backgroundColor: '#fbf8f3',
      series: [{
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [105, 38],
        scaleLimit: {
          min: 0.8,
          max: 5
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            color: '#4a3b3b',
            fontWeight: 'bold',
            fontSize: 12
          }
        },
        data: getMapData()
      }]
    };


    chartInstance.current.setOption(option);

    // 点击事件
    chartInstance.current.on('click', (params: any) => {
      if (params.componentType === 'geo' || params.componentType === 'series') {
        const provinceName = params.name;
        const provinceId = provinceNameToId[provinceName] || provinceNameToId[provinceName?.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '')];
        const province = provinces.find(p => p.id === provinceId);

        if (province?.visited) {
          setSelectedProvince(province);
        }
      }
    });

    // 响应窗口大小变化
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  // 更新地图数据
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption({
        series: [{
          data: getMapData()
        }]
      });
    }
  }, [provinces]);

  return (
    <div className="relative flex flex-col overflow-hidden bg-[#fbf8f3]" style={{ height: '100vh', width: '100%' }}>
      {/* --- Overlay Header --- */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-12 pb-6 px-6 bg-gradient-to-b from-[#fbf8f3] via-[#fbf8f3]/90 to-transparent pointer-events-none">

        <div className="pointer-events-auto flex items-end justify-between mb-4">
          <div>
            <h1 className="text-[28px] font-black tracking-tight text-[#4A3B3B] leading-none">我们的足迹</h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">点亮中国，记录每一份爱。</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-primary transition-colors z-50 relative"
            >
              {showMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[160px] animate-fade-in flex flex-col gap-1 z-40 origin-top-right">
                <button
                  onClick={() => { setShowMenu(false); onNavigateToUpload(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Upload size={18} />
                  </div>
                  <span className="font-bold text-sm text-text-main">上传足迹</span>
                </button>
                <button
                  onClick={() => { setShowMenu(false); onNavigateToAlbums(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                    <BookOpen size={18} />
                  </div>
                  <span className="font-bold text-sm text-text-main">浏览相册</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60 flex items-center gap-4 transition-transform active:scale-95">
          <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className="text-primary drop-shadow-sm" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" strokeWidth="3" />
            </svg>
            <span className="absolute text-[10px] font-bold text-primary">
              {percentage}%
            </span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-gray-700">已点亮 {visitedCount} / {totalProvinces}</span>
              <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">Level {getLevel(visitedCount)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ECharts Map Container --- */}
      <div
        ref={chartRef}
        className="absolute z-10"
        style={{
          top: '180px',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: 'calc(100% - 180px)'
        }}
      />


      {/* --- Album Detail Modal (Slide Up) --- */}
      {selectedProvince && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center sm:justify-center pointer-events-none">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto transition-opacity animate-fade-in"
            onClick={() => setSelectedProvince(null)}
          ></div>

          <div className="pointer-events-auto w-full max-w-md bg-background-light rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden h-[85vh] sm:h-[800px] flex flex-col animate-slide-up transform transition-transform">
            <div className="relative shrink-0">
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
                <button
                  onClick={() => setSelectedProvince(null)}
                  className="h-10 w-10 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/20 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex gap-2">
                  <button className="h-10 w-10 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/20">
                    <Navigation size={20} />
                  </button>
                </div>
              </div>

              <div className="h-64 w-full relative">
                <img
                  src={selectedProvince.photos[0]}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-black/20"></div>

                <div className="absolute bottom-0 left-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">Visited</div>
                    <span className="text-white/80 text-xs font-medium bg-black/20 backdrop-blur px-2 py-0.5 rounded flex items-center gap-1">
                      <Calendar size={10} /> {selectedProvince.date}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-text-main flex items-baseline gap-2">
                    {selectedProvince.name}
                    <span className="text-lg font-normal text-text-sub/80 font-sans">{selectedProvince.enName}</span>
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2 no-scrollbar">
              <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-text-main font-display">{selectedProvince.photos.length}</span>
                  <span className="text-xs text-text-sub">照片</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-text-main font-display">1</span>
                  <span className="text-xs text-text-sub">城市</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-primary" />
                旅行相册
              </h3>
              <div className="columns-2 gap-3 space-y-3">
                {selectedProvince.photos.map((photo, idx) => (
                  <div key={idx} className="break-inside-avoid rounded-xl overflow-hidden group relative">
                    <img
                      src={photo}
                      alt={`Trip ${idx}`}
                      className="w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                ))}
              </div>
              <div className="h-20"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
