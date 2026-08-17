import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { getAuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { showConsoleSafetyWarning } from '@/utils/consoleSafetyWarning';

const appName = import.meta.env.VITE_APP_NAME || 'Prepahid';

showConsoleSafetyWarning();

createInertiaApp({
    title: (title) => title || appName,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ).then((module: any) => {
            const page = module.default;
            // Las pantallas administrativas ya incluyen AuthenticatedLayout.
            // Envolverlas aquí una segunda vez duplicaba el sidebar completo.
            if (page && page.layout === undefined && !name.startsWith('Auth/') && !name.startsWith('Admin/') && name !== 'Welcome') {
                page.layout = getAuthenticatedLayout;
            }
            return module;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#0266E0',
        showSpinner: false,
    },
});

// Registro del Service Worker para PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // No exponemos detalles del entorno en la consola del usuario.
        });
    });
}
