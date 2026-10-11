import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

type DigitPopInProps = {
  text: string;
  className?: string;
  /** Si es false, renderiza el texto sin animación. */
  animate?: boolean;
};

/** Índice del separador decimal para el stagger (coma o punto). */
function getStaggerAnchorIndex(text: string): number {
  const commaIndex = text.indexOf(',');
  const dotIndex = text.indexOf('.');

  if (commaIndex !== -1 && dotIndex !== -1) {
    return Math.max(commaIndex, dotIndex);
  }
  if (commaIndex !== -1) return commaIndex;
  if (dotIndex !== -1) return dotIndex;
  return -1;
}

/** Nivel de stagger 1-based a partir del separador decimal (patrón transitions.dev). */
export function getDigitStaggerLevel(index: number, text: string): number | undefined {
  const anchor = getStaggerAnchorIndex(text);
  if (anchor === -1 || index < anchor) return undefined;
  return index - anchor + 1;
}

export function DigitPopIn({ text, className, animate = true }: DigitPopInProps) {
  if (!animate) {
    return <span className={className}>{text}</span>;
  }

  return <AnimatedDigitPopIn text={text} className={className} />;
}

function AnimatedDigitPopIn({ text, className }: { text: string; className?: string }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      setIsAnimating(false);
      innerFrame = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [text]);

  return (
    <span className={cn('t-digit-group', isAnimating && 'is-animating', className)}>
      {text.split('').map((char, index) => {
        const stagger = getDigitStaggerLevel(index, text);
        return (
          <span
            key={`${index}-${char}`}
            className="t-digit"
            style={
              stagger !== undefined
                ? { animationDelay: `calc(var(--digit-stagger) * ${stagger})` }
                : undefined
            }
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
