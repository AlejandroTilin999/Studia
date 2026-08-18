import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * Laravel Echo configuration for Reverb
 */
const envHost = import.meta.env.VITE_REVERB_HOST;
const isLocalEnvHost = !envHost || envHost === '127.0.0.1' || envHost === 'localhost';
const isCurrentPageRemote = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const reverbHost = (isCurrentPageRemote && isLocalEnvHost)
    ? window.location.hostname
    : (envHost || (typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'));

const isHttps = typeof window !== 'undefined' 
    ? window.location.protocol === 'https:' 
    : (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: reverbHost,
    wsPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 443,
    forceTLS: isHttps,
    enabledTransports: ['ws', 'wss'],
    unavailable_timeout: 5000,
    activityTimeout: 10000,
});

/**
 * Monitoring connection health
 */
