import { DotmSquare5 } from '../ui/dotm-square-5';
import {
  pageTransitionLoaderDefaults,
  pageTransitionLoaderThemeStyle,
} from './pageTransitionLoaderConfig';
import { cn } from '../../lib/utils';

type PageTransitionLoaderProps = {
  className?: string;
};

export function PageTransitionLoader({ className }: PageTransitionLoaderProps) {
  const { previewZoom, colorPreset, color, ...loaderProps } = pageTransitionLoaderDefaults;

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      style={{
        ...pageTransitionLoaderThemeStyle,
        transform: `scale(${previewZoom})`,
        transformOrigin: 'center',
      }}
    >
      <DotmSquare5 {...loaderProps} colorPreset={colorPreset} color={color} aria-hidden />
    </div>
  );
}

type AuthLoadingStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function AuthLoadingState({ title, description, className }: AuthLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={title}
      className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
    >
      <PageTransitionLoader className="mb-6" />
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      {description ? <p className="mt-2 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}
