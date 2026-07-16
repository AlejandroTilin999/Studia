import { router } from '@inertiajs/react';

export const groupService = {
    store(data: any, options = {}) {
        router.post(route('groups.store'), data, options);
    },
    update(id: number, data: any, options = {}) {
        router.put(route('groups.update', id), data, options);
    },
    destroy(id: number, options = {}) {
        router.delete(route('groups.destroy', id), options);
    }
};
