import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    optimizeDeps: {
        include: [
            '@inertiajs/react',
            'react',
            'react-dom',
            'lucide-react',
            'axios',
            'sweetalert2',
        ],
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
        fs: {
            strict: false,
        },
    },
    esbuild: mode === 'production' ? {
        drop: ['debugger'],
        pure: [
            'console.log',
            'console.debug',
            'console.info',
            'console.warn',
            'console.error',
        ],
    } : undefined,
}));
