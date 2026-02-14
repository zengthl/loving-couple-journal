export enum ScreenName {
  DISCOVERY = 'discovery',
  TIMELINE = 'timeline',
  MAP = 'map',
  ANNIVERSARY = 'anniversary',
  PUBLISH = 'publish',
  PROFILE = 'profile',
  UPLOAD = 'upload',
  ALBUM_LIST = 'album_list'
}

export type DiscoveryType = 'food' | 'goods' | 'shop' | 'fun';

export interface DiscoveryItem {
  id: string;
  image: string;
  title: string;
  location: string;
  type: DiscoveryType;
  date: string; // for syncing to timeline
  checked: boolean;
  topBadge?: boolean;
}

export interface Anniversary {
  id: string;
  title: string;
  date: string; // "2023-05-20"
  daysCount?: number; // Calculated
  image?: string;
  location?: string;
}

export interface TimelineEvent {
  id: string;
  date: string; // "24"
  dayOfWeek: string; // "周二"
  month: string; // "10月"
  year: string; // "2023"
  title: string;
  location: string;
  images: string[];
  note?: string;
  isSpecial?: boolean; // Heart icon instead of dot
}

export interface Recipe {
  title: string;
  rating: number;
  time: string;
  difficulty: string;
  calories: string;
  ingredients: { name: string; amount: string }[];
  steps: { id: number; title: string; desc: string }[];
  story: { text: string; date: string; image: string };
}

export interface Province {
  id: string;
  name: string;
  enName: string;
  position: [number, number]; // [Longitude, Latitude] for AMap
  visited: boolean;
  date?: string;
  photos: string[];
  cityPhotos?: Record<string, string[]>; // { cityName: [photo1, photo2, ...] }
}
