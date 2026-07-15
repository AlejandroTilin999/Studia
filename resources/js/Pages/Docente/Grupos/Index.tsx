import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function DocenteGruposIndex() {
    useEffect(() => {
        router.visit('/docente/dashboard', { replace: true });
    }, []);

    return null;
}
