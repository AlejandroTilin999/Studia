import { router } from '@inertiajs/react';

export const loadService = {
    store(data: any, options = {}) {
        router.post(route('admin.loads.store'), data, options);
    },
    update(id: number, data: any, options = {}) {
        router.put(route('admin.loads.update', id), data, options);
    },
    destroy(id: number, options = {}) {
        router.delete(route('admin.loads.destroy', id), options);
    }
};
