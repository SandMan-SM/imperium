'use client';

import type { ImgHTMLAttributes } from 'react';

const DEFAULT_FALLBACK = '/products/placeholder.svg';

/**
 * An image that swaps to the Imperium placeholder when the source is
 * missing or fails to load.
 *
 * Product images come from the database, where a row can point at a file
 * that was never uploaded (or has since been deleted). A plain `<img>` then
 * renders the browser's broken-image glyph in the middle of the grid; this
 * keeps the layout intact instead.
 */
export function SafeImage({
    src,
    alt = '',
    fallback = DEFAULT_FALLBACK,
    ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }) {
    return (
        // A plain <img> is required here: the fallback swap happens at runtime
        // and the source URLs come from the database (not a configured remote
        // domain), so next/image cannot be used.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            onError={(event) => {
                const element = event.currentTarget;
                if (!element.src.endsWith(fallback)) element.src = fallback;
            }}
            {...rest}
        />
    );
}
