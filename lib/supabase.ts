import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching our tables
export interface DbTimelineEvent {
    id: string;
    date: string;
    day_of_week: string;
    month: string;
    year: string;
    title: string;
    location: string;
    images: string[];
    note: string | null;
    is_special: boolean;
    created_at: string;
}

export interface DbProvince {
    id: string;
    name: string;
    en_name: string;
    position: number[];
    visited: boolean;
    visit_date: string | null;
    photos: string[];
}

export interface DbDiscoveryItem {
    id: string;
    image: string;
    title: string;
    location: string;
    type: 'food' | 'goods' | 'shop' | 'fun';
    date: string;
    checked: boolean;
    top_badge: boolean;
    created_at: string;
}

export interface DbAnniversary {
    id: string;
    title: string;
    date: string;
    image: string | null;
    location: string | null;
    created_at: string;
}
