import { useEffect, useRef, useState } from 'react';

const SHAKE_DURATION_MS = 80 * 2 + 60 * 2;

export function useInputErrorShake(error: string | undefined) {
  const [isShaking, setIsShaking] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const prevErrorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const hadError = Boolean(prevErrorRef.current);
    const hasError = Boolean(error);
    const errorChanged = prevErrorRef.current !== error;
    prevErrorRef.current = error;

    if (hasError && (!hadError || errorChanged)) {
      setShakeTrigger((trigger) => trigger + 1);
    }
  }, [error]);

  useEffect(() => {
    if (shakeTrigger === 0) return;

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      setIsShaking(false);
      innerFrame = requestAnimationFrame(() => {
        setIsShaking(true);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [shakeTrigger]);

  useEffect(() => {
    if (!isShaking) return;

    const timer = window.setTimeout(() => {
      setIsShaking(false);
    }, SHAKE_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [isShaking]);

  return {
    isError: Boolean(error),
    isShaking: isShaking && Boolean(error),
  };
}
