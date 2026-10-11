'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { BorderBeam } from 'border-beam';
import { usePrefersReducedMotion } from '../../lib/dotmatrix-hooks';
import { cn } from '../../lib/utils';

type LoginScreenDividerProps = {
  className?: string;
};

export function LoginScreenDivider({ className }: LoginScreenDividerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackHeight, setTrackHeight] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const syncHeight = () => setTrackHeight(node.clientHeight);
    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-0 bottom-0 left-[44%] z-10 hidden w-px -translate-x-1/2 bg-border/80 dark:bg-white/12 lg:block',
          className,
        )}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-0 bottom-0 left-[44%] z-10 hidden w-1 -translate-x-1/2 lg:block',
        className,
      )}
    >
      <div ref={trackRef} className="relative h-full w-full">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/45 dark:bg-white/10" />

        {trackHeight > 0 ? (
          <div
            className="absolute top-0 left-1/2 h-px"
            style={{
              width: trackHeight,
              transformOrigin: 'top left',
              transform: 'rotate(90deg)',
            }}
          >
            <BorderBeam
              className="block w-full"
              size="line"
              theme="auto"
              colorVariant="ocean"
              strength={0.62}
              duration={7}
              hueRange={14}
              borderRadius={0}
            >
              <div className="h-px w-full bg-transparent" />
            </BorderBeam>
          </div>
        ) : null}
      </div>
    </div>
  );
}
