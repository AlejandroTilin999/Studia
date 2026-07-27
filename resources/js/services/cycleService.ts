import { router } from '@inertiajs/react';

export const cycleService = {
    store(data: any, options = {}) {
        router.post(route('admin.cycles.store'), data, options);
    },
    update(id: number, data: any, options = {}) {
        router.put(route('admin.cycles.update', id), data, options);
    },
    close(id: number, options = {}) {
        router.post(route('admin.cycles.close', id), {}, options);
    },
    activate(id: number, options = {}) {
        router.post(route('admin.cycles.activate', id), {}, options);
    }
};
export type CycleService = typeof cycleService;
