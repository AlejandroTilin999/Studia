import { router } from '@inertiajs/react';

export const specialtyService = {
    store(data: { name: string; code: string }, options?: Parameters<typeof router.post>[2]) {
        router.post('/admin/especialidades', data, options);
    },

    update(id: number, data: { name: string; code: string }, options?: Parameters<typeof router.put>[2]) {
        router.put(`/admin/especialidades/${id}`, data, options);
    },

    destroy(id: number, options?: Parameters<typeof router.delete>[1]) {
        router.delete(`/admin/especialidades/${id}`, options);
    },
};
