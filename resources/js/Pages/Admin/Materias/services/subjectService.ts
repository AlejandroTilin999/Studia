import { router } from '@inertiajs/react';

export const subjectService = {
    store(data: any, options = {}) {
        router.post(route('materias.store'), data, options);
    },
    update(id: number, data: any, options = {}) {
        router.put(route('materias.update', id), data, options);
    },
    destroy(id: number, options = {}) {
        router.delete(route('materias.destroy', id), options);
    }
};
