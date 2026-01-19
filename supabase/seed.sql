-- ============================================
-- Seed Data for Couple Journal
-- (Optional) Run this to populate initial data
-- ============================================

-- ==================== Provinces Data (All 34 regions) ====================
INSERT INTO provinces (id, name, en_name, position, visited, visit_date, photos) VALUES
  -- Municipalities
  ('beijing', '北京', 'Beijing', ARRAY[116.4074, 39.9042], FALSE, NULL, ARRAY[]::TEXT[]),
  ('shanghai', '上海', 'Shanghai', ARRAY[121.4737, 31.2304], FALSE, NULL, ARRAY[]::TEXT[]),
  ('tianjin', '天津', 'Tianjin', ARRAY[117.2009, 39.0842], FALSE, NULL, ARRAY[]::TEXT[]),
  ('chongqing', '重庆', 'Chongqing', ARRAY[106.5516, 29.5630], FALSE, NULL, ARRAY[]::TEXT[]),
  
  -- Provinces
  ('sichuan', '四川', 'Sichuan', ARRAY[104.0668, 30.5728], FALSE, NULL, ARRAY[]::TEXT[]),
  ('guangdong', '广东', 'Guangdong', ARRAY[113.2644, 23.1291], FALSE, NULL, ARRAY[]::TEXT[]),
  ('hebei', '河北', 'Hebei', ARRAY[114.5149, 38.0428], FALSE, NULL, ARRAY[]::TEXT[]),
  ('shanxi', '山西', 'Shanxi', ARRAY[112.5627, 37.8735], FALSE, NULL, ARRAY[]::TEXT[]),
  ('liaoning', '辽宁', 'Liaoning', ARRAY[123.4315, 41.8057], FALSE, NULL, ARRAY[]::TEXT[]),
  ('jilin', '吉林', 'Jilin', ARRAY[125.3235, 43.8170], FALSE, NULL, ARRAY[]::TEXT[]),
  ('heilongjiang', '黑龙江', 'Heilongjiang', ARRAY[126.6616, 45.7421], FALSE, NULL, ARRAY[]::TEXT[]),
  ('jiangsu', '江苏', 'Jiangsu', ARRAY[118.7628, 32.0603], FALSE, NULL, ARRAY[]::TEXT[]),
  ('zhejiang', '浙江', 'Zhejiang', ARRAY[120.1551, 30.2741], FALSE, NULL, ARRAY[]::TEXT[]),
  ('anhui', '安徽', 'Anhui', ARRAY[117.2906, 31.8669], FALSE, NULL, ARRAY[]::TEXT[]),
  ('fujian', '福建', 'Fujian', ARRAY[119.2951, 26.0713], FALSE, NULL, ARRAY[]::TEXT[]),
  ('jiangxi', '江西', 'Jiangxi', ARRAY[115.8579, 28.6829], FALSE, NULL, ARRAY[]::TEXT[]),
  ('shandong', '山东', 'Shandong', ARRAY[117.1205, 36.6510], FALSE, NULL, ARRAY[]::TEXT[]),
  ('henan', '河南', 'Henan', ARRAY[113.6253, 34.7466], FALSE, NULL, ARRAY[]::TEXT[]),
  ('hubei', '湖北', 'Hubei', ARRAY[114.3054, 30.5928], FALSE, NULL, ARRAY[]::TEXT[]),
  ('hunan', '湖南', 'Hunan', ARRAY[112.9388, 28.2282], FALSE, NULL, ARRAY[]::TEXT[]),
  ('hainan', '海南', 'Hainan', ARRAY[110.1983, 20.0440], FALSE, NULL, ARRAY[]::TEXT[]),
  ('guizhou', '贵州', 'Guizhou', ARRAY[106.6302, 26.6477], FALSE, NULL, ARRAY[]::TEXT[]),
  ('yunnan', '云南', 'Yunnan', ARRAY[102.7100, 25.0453], FALSE, NULL, ARRAY[]::TEXT[]),
  ('shaanxi', '陕西', 'Shaanxi', ARRAY[108.9398, 34.3416], FALSE, NULL, ARRAY[]::TEXT[]),
  ('gansu', '甘肃', 'Gansu', ARRAY[103.8264, 36.0594], FALSE, NULL, ARRAY[]::TEXT[]),
  ('qinghai', '青海', 'Qinghai', ARRAY[101.7782, 36.6171], FALSE, NULL, ARRAY[]::TEXT[]),
  ('taiwan', '台湾', 'Taiwan', ARRAY[121.5091, 25.0443], FALSE, NULL, ARRAY[]::TEXT[]),
  
  -- Autonomous Regions
  ('neimenggu', '内蒙古', 'Inner Mongolia', ARRAY[111.7656, 40.8175], FALSE, NULL, ARRAY[]::TEXT[]),
  ('guangxi', '广西', 'Guangxi', ARRAY[108.3661, 22.8172], FALSE, NULL, ARRAY[]::TEXT[]),
  ('xizang', '西藏', 'Tibet', ARRAY[91.1172, 29.6469], FALSE, NULL, ARRAY[]::TEXT[]),
  ('ningxia', '宁夏', 'Ningxia', ARRAY[106.2309, 38.4872], FALSE, NULL, ARRAY[]::TEXT[]),
  ('xinjiang', '新疆', 'Xinjiang', ARRAY[87.6168, 43.8256], FALSE, NULL, ARRAY[]::TEXT[]),
  
  -- SARs
  ('hongkong', '香港', 'Hong Kong', ARRAY[114.1694, 22.3193], FALSE, NULL, ARRAY[]::TEXT[]),
  ('macau', '澳门', 'Macau', ARRAY[113.5439, 22.1987], FALSE, NULL, ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- ==================== Sample Anniversary ====================
INSERT INTO anniversaries (title, date, image, location) VALUES
  ('我们在一起', '2023-05-20', NULL, NULL)
ON CONFLICT DO NOTHING;
