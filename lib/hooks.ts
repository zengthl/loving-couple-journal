import { useState, useEffect, useCallback } from 'react';
import { TimelineEvent, Province, DiscoveryItem, Anniversary } from '../types';
import {
    fetchTimelineEvents,
    createTimelineEvent,
    fetchProvinces,
    fetchProvincesWithUserVisits,
    markProvinceVisited,
    fetchDiscoveryItems,
    fetchAllDiscoveryItems,
    createDiscoveryItem,
    fetchAnniversaries,
    fetchAllAnniversaries,
    createAnniversary
} from './db';

const GUEST_USER_ID = 'guest-visitor';
const GUEST_CACHE_TTL_MS = 5 * 60 * 1000;
const guestCacheMemory = new Map<string, { timestamp: number; data: unknown }>();

const readGuestCache = <T,>(key: string): { timestamp: number; data: T } | null => {
    const memoryValue = guestCacheMemory.get(key);
    if (memoryValue && Date.now() - memoryValue.timestamp < GUEST_CACHE_TTL_MS) {
        return memoryValue as { timestamp: number; data: T };
    }

    try {
        const raw = window.sessionStorage.getItem(`guest-cache:${key}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { timestamp: number; data: T };
        if (Date.now() - parsed.timestamp >= GUEST_CACHE_TTL_MS) {
            window.sessionStorage.removeItem(`guest-cache:${key}`);
            return null;
        }
        guestCacheMemory.set(key, parsed);
        return parsed;
    } catch {
        return null;
    }
};

const writeGuestCache = <T,>(key: string, data: T) => {
    const entry = { timestamp: Date.now(), data };
    guestCacheMemory.set(key, entry);
    try {
        window.sessionStorage.setItem(`guest-cache:${key}`, JSON.stringify(entry));
    } catch {
        // Ignore sessionStorage quota or availability failures.
    }
};

interface HookOptions {
    enabled?: boolean;
}

// ==================== useTimelineEvents ====================
export function useTimelineEvents(userId: string | undefined, options: HookOptions = {}) {
    const { enabled = true } = options;
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        const isGuest = userId === GUEST_USER_ID;
        const cached = isGuest ? readGuestCache<TimelineEvent[]>('timeline-events') : null;

        if (cached) {
            setEvents(cached.data);
            setLoading(false);
        } else {
            setLoading(true);
        }

        try {
            const data = await fetchTimelineEvents();
            setEvents(data);
            if (isGuest) {
                writeGuestCache('timeline-events', data);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch timeline events'));
        } finally {
            setLoading(false);
        }
    }, [enabled, userId]);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        void load();
    }, [enabled, load]);

    const addEvent = useCallback(async (event: Omit<TimelineEvent, 'id'>) => {
        if (!userId || userId === GUEST_USER_ID) return null;

        const created = await createTimelineEvent(event, userId);
        if (created) {
            setEvents(prev => [created, ...prev]);
            return created;
        }
        return null;
    }, [userId]);

    return { events, loading, error, reload: load, addEvent };
}

// ==================== useProvinces ====================
export function useProvinces(userId: string | undefined, options: HookOptions = {}) {
    const { enabled = true } = options;
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        const isGuest = userId === GUEST_USER_ID;
        const cached = isGuest ? readGuestCache<Province[]>('guest-provinces') : null;

        if (cached) {
            setProvinces(cached.data);
            setLoading(false);
        } else {
            setLoading(true);
        }

        try {
            const baseProvinces = await fetchProvinces();

            if (userId) {
                // Fetch ALL visits from ALL users (shared journal)
                const provincesWithVisits = await fetchProvincesWithUserVisits('', baseProvinces);
                setProvinces(provincesWithVisits);
                if (isGuest) {
                    writeGuestCache('guest-provinces', provincesWithVisits);
                }
            } else {
                setProvinces(baseProvinces);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch provinces'));
        } finally {
            setLoading(false);
        }
    }, [enabled, userId]);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        void load();
    }, [enabled, load]);

    const markVisited = useCallback(async (
        provinceId: string,
        visitDate: string,
        photos: string[],
        city?: string
    ) => {
        if (!userId || userId === GUEST_USER_ID) return;

        await markProvinceVisited(userId, provinceId, visitDate, photos, city);
        await load();
    }, [userId, load]);

    return { provinces, loading, error, reload: load, markVisited };
}

// ==================== useDiscoveryItems ====================
export function useDiscoveryItems(userId: string | undefined, options: HookOptions = {}) {
    const { enabled = true } = options;
    const [items, setItems] = useState<DiscoveryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        if (!userId) {
            // No userId means not yet initialized, still loading
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = userId === GUEST_USER_ID
                ? await fetchAllDiscoveryItems()
                : await fetchDiscoveryItems(userId);
            setItems(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch discovery items'));
        } finally {
            setLoading(false);
        }
    }, [enabled, userId]);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        void load();
    }, [enabled, load]);

    const addItem = useCallback(async (item: Omit<DiscoveryItem, 'id'>) => {
        if (!userId || userId === GUEST_USER_ID) return null;

        const created = await createDiscoveryItem(item, userId);
        if (created) {
            setItems(prev => [created, ...prev]);
            return created;
        }
        return null;
    }, [userId]);

    return { items, loading, error, reload: load, addItem };
}

// ==================== useAnniversaries ====================
export function useAnniversaries(userId: string | undefined, options: HookOptions = {}) {
    const { enabled = true } = options;
    const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        if (!userId) {
            setLoading(false);
            return;
        }

        const isGuest = userId === GUEST_USER_ID;
        const cached = isGuest ? readGuestCache<Anniversary[]>('guest-anniversaries') : null;

        if (cached) {
            setAnniversaries(cached.data);
            setLoading(false);
        } else {
            setLoading(true);
        }

        try {
            const data = userId === GUEST_USER_ID
                ? await fetchAllAnniversaries()
                : await fetchAnniversaries(userId);
            setAnniversaries(data);
            if (isGuest) {
                writeGuestCache('guest-anniversaries', data);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch anniversaries'));
        } finally {
            setLoading(false);
        }
    }, [enabled, userId]);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        void load();
    }, [enabled, load]);

    const addAnniversary = useCallback(async (ann: Omit<Anniversary, 'id'>) => {
        if (!userId || userId === GUEST_USER_ID) return null;

        const created = await createAnniversary(ann, userId);
        if (created) {
            setAnniversaries(prev => [...prev, created]);
            return created;
        }
        return null;
    }, [userId]);

    return { anniversaries, loading, error, reload: load, addAnniversary };
}
