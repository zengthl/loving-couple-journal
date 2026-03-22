import React, { useEffect, useRef } from 'react';
import { Province } from '../types';

interface MapChartProps {
  provinces: Province[];
  onSelectProvince: (provinceId: string | undefined) => void;
}

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

const normalizeProvinceName = (name: string) =>
  name.replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g, '');

export const MapChart: React.FC<MapChartProps> = ({ provinces, onSelectProvince }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    let disposed = false;
    let resizeHandler: (() => void) | null = null;

    const initChart = async () => {
      const [{ default: geoData }, echarts] = await Promise.all([
        import('../data/china.json'),
        import('echarts'),
      ]);

      if (disposed || !chartRef.current) {
        return;
      }

      const visitedProvinceIds = new Set(provinces.filter((province) => province.visited).map((province) => province.id));
      const mapData = (geoData.features || []).map((feature: any) => {
        const name = feature.properties?.name || '';
        const provinceId = provinceNameToId[name] || provinceNameToId[normalizeProvinceName(name)];
        const isVisited = visitedProvinceIds.has(provinceId);

        return {
          name,
          value: isVisited ? 1 : 0,
          provinceId,
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
            },
          },
        };
      });

      echarts.registerMap('china', geoData as any);
      chartInstanceRef.current = echarts.init(chartRef.current);
      chartInstanceRef.current.setOption({
        backgroundColor: '#fbf8f3',
        series: [{
          type: 'map',
          map: 'china',
          roam: true,
          zoom: 1.2,
          center: [105, 38],
          scaleLimit: {
            min: 0.8,
            max: 5,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              color: '#4a3b3b',
              fontWeight: 'bold',
              fontSize: 12,
            },
          },
          data: mapData,
        }],
      });

      chartInstanceRef.current.on('click', (params: any) => {
        if (params.componentType === 'geo' || params.componentType === 'series') {
          const provinceName = params.name;
          const provinceId = provinceNameToId[provinceName] || provinceNameToId[normalizeProvinceName(provinceName)];
          onSelectProvince(provinceId);
        }
      });

      resizeHandler = () => {
        chartInstanceRef.current?.resize();
      };
      window.addEventListener('resize', resizeHandler);
    };

    void initChart();

    return () => {
      disposed = true;
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, [onSelectProvince, provinces]);

  return (
    <div
      ref={chartRef}
      className="absolute z-10"
      style={{
        top: '180px',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 'calc(100% - 180px)',
      }}
    />
  );
};
