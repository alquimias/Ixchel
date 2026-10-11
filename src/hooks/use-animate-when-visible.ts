import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Dispara `true` una vez cuando el elemento entra al viewport (útil para
 * animaciones de entrada sin animar todo el listado al montar).
 */
export function useAnimateWhenVisible<T extends HTMLElement>(
  threshold = 0.35,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible, threshold]);

  return [ref, isVisible];
}
