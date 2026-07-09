import { router } from '@inertiajs/react';

export const studentService = {
    store(data: any, options = {}) {
        router.post(route('admin.alumnos.store'), data, options);
    },
    update(id: number, data: any, options = {}) {
        router.put(route('admin.alumnos.update', id), data, options);
    },
    toggle(id: number, options = {}) {
        router.post(route('admin.alumnos.toggle', id), {}, options);
    }
};
