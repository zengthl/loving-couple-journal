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

// ==================== useTimelineEvents ====================
export function useTimelineEvents(userId: string | undefined) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        if (!userId) {
            setEvents([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await fetchTimelineEvents();
            setEvents(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch timeline events'));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

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
export function useProvinces(userId: string | undefined) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const baseProvinces = await fetchProvinces();

            if (userId && userId !== GUEST_USER_ID) {
                // Fetch user-specific visits and merge
                const provincesWithVisits = await fetchProvincesWithUserVisits(userId, baseProvinces);
                setProvinces(provincesWithVisits);
            } else if (userId === GUEST_USER_ID) {
                // Guest: fetch all visits from all users
                const provincesWithVisits = await fetchProvincesWithUserVisits('', baseProvinces);
                setProvinces(provincesWithVisits);
            } else {
                setProvinces(baseProvinces);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch provinces'));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

    const markVisited = useCallback(async (
        provinceId: string,
        visitDate: string,
        photos: string[]
    ) => {
        if (!userId || userId === GUEST_USER_ID) return;

        await markProvinceVisited(userId, provinceId, visitDate, photos);
        await load();
    }, [userId, load]);

    return { provinces, loading, error, reload: load, markVisited };
}

// ==================== useDiscoveryItems ====================
export function useDiscoveryItems(userId: string | undefined) {
    const [items, setItems] = useState<DiscoveryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        if (!userId) {
            setItems([]);
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
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

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
export function useAnniversaries(userId: string | undefined) {
    const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        if (!userId) {
            setAnniversaries([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = userId === GUEST_USER_ID
                ? await fetchAllAnniversaries()
                : await fetchAnniversaries(userId);
            setAnniversaries(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch anniversaries'));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

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
