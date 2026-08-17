import * as React from 'react';
import { cn } from '@/lib/utils';
import StudiaSkeleton from './StudiaSkeleton';

const loadedSources = new Set<string>();

interface ImageWithSkeletonProps {
    src: string;
    alt: string;
    containerClassName?: string;
    className?: string;
    skeletonClassName?: string;
}

/** Imagen que conserva su espacio y usa el esqueleto visual unificado al cargar. */
export default function ImageWithSkeleton({
    src,
    alt,
    containerClassName,
    className,
    skeletonClassName,
}: ImageWithSkeletonProps) {
    const imageRef = React.useRef<HTMLImageElement>(null);
    const [loaded, setLoaded] = React.useState(() => loadedSources.has(src));

    React.useLayoutEffect(() => {
        const image = imageRef.current;
        // React 18 no tipa fetchpriority en <img>, pero el atributo estándar
        // sí es reconocido por los navegadores modernos.
        image?.setAttribute('fetchpriority', 'high');
        const isReady = loadedSources.has(src) || Boolean(image?.complete && image.naturalWidth > 0);

        if (isReady) loadedSources.add(src);
        setLoaded(isReady);
    }, [src]);

    const markAsLoaded = () => {
        loadedSources.add(src);
        setLoaded(true);
    };

    return (
        <span className={cn('relative inline-block shrink-0', containerClassName)}>
            {!loaded && (
                <StudiaSkeleton className={cn('absolute inset-0 rounded-md', skeletonClassName)} />
            )}
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                loading="eager"
                decoding="sync"
                onLoad={markAsLoaded}
                className={cn(
                    'block transition-opacity duration-150',
                    loaded ? 'opacity-100' : 'opacity-0',
                    className,
                )}
            />
        </span>
    );
}
