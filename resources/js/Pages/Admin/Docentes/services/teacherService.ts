import { router } from '@inertiajs/react';

export const teacherService = {
    store(data: any, options = {}) {
        router.post(route('admin.docentes.store'), data, options);
    },
    update(id: number, data: any, options = {}) {
        router.put(route('admin.docentes.update', id), data, options);
    },
    destroy(id: number, options = {}) {
        router.delete(route('admin.docentes.destroy', id), options);
    }
};
