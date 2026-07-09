import { useState, useCallback, useRef, useEffect } from 'react';

export function useToast(defaultDuration = 3000) {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const triggerToast = useCallback((msg: string, duration = defaultDuration) => {
        // Clear any existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        
        setToastMessage(msg);
        
        timerRef.current = setTimeout(() => {
            setToastMessage(null);
        }, duration);
    }, [defaultDuration]);

    // Clean up timer on unmount to prevent leaks
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return {
        toastMessage,
        setToastMessage,
        triggerToast,
    };
}
