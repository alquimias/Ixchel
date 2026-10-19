import { useEffect, useRef, useState } from 'react';

const SHAKE_DURATION_MS = 80 * 2 + 60 * 2;

export function useInputErrorShake(error: string | undefined, pulse = 0) {
  const [isShaking, setIsShaking] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const prevErrorRef = useRef<string | undefined>(undefined);
  const prevPulseRef = useRef(pulse);

  useEffect(() => {
    const hadError = Boolean(prevErrorRef.current);
    const hasError = Boolean(error);
    const errorChanged = prevErrorRef.current !== error;
    const pulseChanged = prevPulseRef.current !== pulse;
    prevErrorRef.current = error;
    prevPulseRef.current = pulse;

    if (hasError && (!hadError || errorChanged || pulseChanged)) {
      setShakeTrigger((trigger) => trigger + 1);
    }
  }, [error, pulse]);

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
