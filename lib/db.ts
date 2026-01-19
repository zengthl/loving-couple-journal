import { supabase, DbTimelineEvent, DbProvince, DbDiscoveryItem, DbAnniversary } from './supabase';
import { TimelineEvent, Province, DiscoveryItem, Anniversary } from '../types';

// ==================== Timeline Events ====================

// Convert DB format to App format
function toTimelineEvent(db: DbTimelineEvent): TimelineEvent {
    return {
        id: db.id,
        date: db.date,
        dayOfWeek: db.day_of_week,
        month: db.month,
        year: db.year,
        title: db.title,
        location: db.location,
        images: db.images || [],
        note: db.note || undefined,
        isSpecial: db.is_special
    };
}

// Convert App format to DB format
function toDbTimelineEvent(event: Omit<TimelineEvent, 'id'>): Omit<DbTimelineEvent, 'id' | 'created_at'> {
    return {
        date: event.date,
        day_of_week: event.dayOfWeek,
        month: event.month,
        year: event.year,
        title: event.title,
        location: event.location,
        images: event.images,
        note: event.note || null,
        is_special: event.isSpecial || false
    };
}

export async function fetchTimelineEvents(): Promise<TimelineEvent[]> {
    const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching timeline events:', error);
        return [];
    }

    return (data || []).map(toTimelineEvent);
}

export async function createTimelineEvent(event: Omit<TimelineEvent, 'id'>, userId: string): Promise<TimelineEvent | null> {
    const { data, error } = await supabase
        .from('timeline_events')
        .insert([{ ...toDbTimelineEvent(event), user_id: userId }])
        .select()
        .single();

    if (error) {
        console.error('Error creating timeline event:', error);
        return null;
    }

    return toTimelineEvent(data);
}

// ==================== Provinces ====================

function toProvince(db: DbProvince): Province {
    return {
        id: db.id,
        name: db.name,
        enName: db.en_name,
        position: db.position as [number, number],
        visited: db.visited,
        date: db.visit_date || undefined,
        photos: db.photos || []
    };
}

export async function fetchProvinces(): Promise<Province[]> {
    const { data, error } = await supabase
        .from('provinces')
        .select('*');

    if (error) {
        console.error('Error fetching provinces:', error);
        return [];
    }

    return (data || []).map(toProvince);
}

// Mark province as visited for a specific user
export async function markProvinceVisited(
    userId: string,
    provinceId: string,
    visitDate: string,
    photos: string[]
): Promise<void> {
    // First, check if user already visited this province
    const { data: existing } = await supabase
        .from('user_province_visits')
        .select('*')
        .eq('user_id', userId)
        .eq('province_id', provinceId)
        .single();

    if (existing) {
        // Append new photos to existing ones
        const mergedPhotos = [...(existing.photos || []), ...photos];

        const { error } = await supabase
            .from('user_province_visits')
            .update({
                visit_date: visitDate,
                photos: mergedPhotos
            })
            .eq('user_id', userId)
            .eq('province_id', provinceId);

        if (error) {
            console.error('Error updating province visit:', error);
        }
    } else {
        // Create new visit record
        const { error } = await supabase
            .from('user_province_visits')
            .insert([{
                user_id: userId,
                province_id: provinceId,
                visit_date: visitDate,
                photos: photos
            }]);

        if (error) {
            console.error('Error creating province visit:', error);
        }
    }
}

// Fetch user's province visits and merge with base province data
export async function fetchProvincesWithUserVisits(userId: string, baseProvinces: Province[]): Promise<Province[]> {
    const { data: visits, error } = await supabase
        .from('user_province_visits')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user province visits:', error);
        return baseProvinces;
    }

    // Create a map of visits by province_id
    const visitsMap = new Map(
        (visits || []).map(v => [v.province_id, v])
    );

    // Merge visits with base provinces
    return baseProvinces.map(province => {
        const visit = visitsMap.get(province.id);
        if (visit) {
            return {
                ...province,
                visited: true,
                date: visit.visit_date,
                photos: visit.photos || []
            };
        }
        return province;
    });
}

// ==================== Discovery Items ====================

function toDiscoveryItem(db: DbDiscoveryItem): DiscoveryItem {
    return {
        id: db.id,
        image: db.image,
        title: db.title,
        location: db.location,
        type: db.type,
        date: db.date,
        checked: db.checked,
        topBadge: db.top_badge
    };
}

function toDbDiscoveryItem(item: Omit<DiscoveryItem, 'id'>): Omit<DbDiscoveryItem, 'id' | 'created_at' | 'user_id'> {
    return {
        image: item.image,
        title: item.title,
        location: item.location,
        type: item.type,
        date: item.date,
        checked: item.checked,
        top_badge: item.topBadge || false
    };
}

export async function fetchDiscoveryItems(userId: string): Promise<DiscoveryItem[]> {
    const { data, error } = await supabase
        .from('discovery_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching discovery items:', error);
        return [];
    }

    return (data || []).map(toDiscoveryItem);
}

export async function createDiscoveryItem(item: Omit<DiscoveryItem, 'id'>, userId: string): Promise<DiscoveryItem | null> {
    const { data, error } = await supabase
        .from('discovery_items')
        .insert([{ ...toDbDiscoveryItem(item), user_id: userId }])
        .select()
        .single();

    if (error) {
        console.error('Error creating discovery item:', error);
        return null;
    }

    return toDiscoveryItem(data);
}

// ==================== Anniversaries ====================

function toAnniversary(db: DbAnniversary): Anniversary {
    return {
        id: db.id,
        title: db.title,
        date: db.date,
        image: db.image || undefined,
        location: db.location || undefined
    };
}

function toDbAnniversary(ann: Omit<Anniversary, 'id'>): Omit<DbAnniversary, 'id' | 'created_at' | 'user_id'> {
    return {
        title: ann.title,
        date: ann.date,
        image: ann.image || null,
        location: ann.location || null
    };
}

export async function fetchAnniversaries(userId: string): Promise<Anniversary[]> {
    const { data, error } = await supabase
        .from('anniversaries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching anniversaries:', error);
        return [];
    }

    return (data || []).map(toAnniversary);
}

export async function createAnniversary(ann: Omit<Anniversary, 'id'>, userId: string): Promise<Anniversary | null> {
    const { data, error } = await supabase
        .from('anniversaries')
        .insert([{ ...toDbAnniversary(ann), user_id: userId }])
        .select()
        .single();

    if (error) {
        console.error('Error creating anniversary:', error);
        return null;
    }

    return toAnniversary(data);
}

// ==================== Timeline Event Updates ====================

export async function deleteTimelineEvent(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting timeline event:', error);
        return false;
    }
    return true;
}

export async function updateTimelineEvent(id: string, updates: Partial<Omit<TimelineEvent, 'id'>>): Promise<TimelineEvent | null> {
    const dbUpdates: any = {};
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.dayOfWeek) dbUpdates.day_of_week = updates.dayOfWeek;
    if (updates.month) dbUpdates.month = updates.month;
    if (updates.year) dbUpdates.year = updates.year;
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.images) dbUpdates.images = updates.images;
    if (updates.note) dbUpdates.note = updates.note;
    if (updates.isSpecial !== undefined) dbUpdates.is_special = updates.isSpecial;

    const { data, error } = await supabase
        .from('timeline_events')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating timeline event:', error);
        return null;
    }

    return toTimelineEvent(data);
}

// ==================== Discovery Item Updates ====================

export async function deleteDiscoveryItem(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('discovery_items')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting discovery item:', error);
        return false;
    }
    return true;
}

export async function updateDiscoveryItem(id: string, updates: Partial<Omit<DiscoveryItem, 'id'>>): Promise<DiscoveryItem | null> {
    const dbUpdates: any = {};
    if (updates.image) dbUpdates.image = updates.image;
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.checked !== undefined) dbUpdates.checked = updates.checked;
    if (updates.topBadge !== undefined) dbUpdates.top_badge = updates.topBadge;

    const { data, error } = await supabase
        .from('discovery_items')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating discovery item:', error);
        return null;
    }

    return toDiscoveryItem(data);
}

// ==================== Province Photo Updates ====================

export async function deleteProvincePhoto(userId: string, provinceId: string, photoUrl: string): Promise<boolean> {
    // 1. Get current photos
    const { data: currentVisit, error: fetchError } = await supabase
        .from('user_province_visits')
        .select('photos')
        .eq('user_id', userId)
        .eq('province_id', provinceId)
        .single();

    if (fetchError || !currentVisit) {
        console.error('Error fetching province visit:', fetchError);
        return false;
    }

    // 2. Filter out the photo
    const newPhotos = (currentVisit.photos || []).filter((p: string) => p !== photoUrl);

    // 3. If no photos left, delete the entire visit record (unvisit the province)
    if (newPhotos.length === 0) {
        const { error: deleteError } = await supabase
            .from('user_province_visits')
            .delete()
            .eq('user_id', userId)
            .eq('province_id', provinceId);

        if (deleteError) {
            console.error('Error deleting province visit:', deleteError);
            return false;
        }
    } else {
        // 4. Otherwise just update the photos array
        const { error: updateError } = await supabase
            .from('user_province_visits')
            .update({ photos: newPhotos })
            .eq('user_id', userId)
            .eq('province_id', provinceId);

        if (updateError) {
            console.error('Error updating province photos:', updateError);
            return false;
        }
    }

    return true;
}

export async function removePhotoFromUserProvinces(userId: string, photoUrl: string): Promise<boolean> {
    const { data: visits, error } = await supabase
        .from('user_province_visits')
        .select('province_id, photos')
        .eq('user_id', userId)
        .contains('photos', [photoUrl]);

    if (error) {
        console.error('Error fetching province visits for photo cleanup:', error);
        return false;
    }

    if (!visits || visits.length === 0) {
        return true;
    }

    for (const visit of visits) {
        const nextPhotos = (visit.photos || []).filter((p: string) => p !== photoUrl);
        if (nextPhotos.length === 0) {
            const { error: deleteError } = await supabase
                .from('user_province_visits')
                .delete()
                .eq('user_id', userId)
                .eq('province_id', visit.province_id);

            if (deleteError) {
                console.error('Error deleting empty province visit:', deleteError);
                return false;
            }
        } else {
            const { error: updateError } = await supabase
                .from('user_province_visits')
                .update({ photos: nextPhotos })
                .eq('user_id', userId)
                .eq('province_id', visit.province_id);

            if (updateError) {
                console.error('Error updating province photos:', updateError);
                return false;
            }
        }
    }

    return true;
}

export async function removeImageFromTimelineEvents(userId: string, imageUrl: string): Promise<boolean> {
    const { data: events, error } = await supabase
        .from('timeline_events')
        .select('id, images')
        .eq('user_id', userId)
        .contains('images', [imageUrl]);

    if (error) {
        console.error('Error fetching timeline events for image cleanup:', error);
        return false;
    }

    if (!events || events.length === 0) {
        return true;
    }

    for (const event of events) {
        const nextImages = (event.images || []).filter((img: string) => img !== imageUrl);
        const { error: updateError } = await supabase
            .from('timeline_events')
            .update({ images: nextImages })
            .eq('id', event.id)
            .eq('user_id', userId);

        if (updateError) {
            console.error('Error updating timeline event images:', updateError);
            return false;
        }
    }

    return true;
}

