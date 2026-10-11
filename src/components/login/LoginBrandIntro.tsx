import bycoLogo from '../../assets/byco-logo.png';
import { cn } from '../../lib/utils';
import { StaggerReveal } from '../shared/StaggerReveal';

const DEFAULT_DESCRIPTION =
  'Centraliza la gestión de Seguridad y Salud en el Trabajo: trabajadores, peligros, accidentes, capacitaciones, EPP e informes con trazabilidad y cumplimiento normativo.';

export type LoginBrand = {
  logoSrc?: string;
  logoAlt?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function LoginBrandIntro({
  className,
  logoSrc = bycoLogo,
  logoAlt = 'Emblema BYTE',
  eyebrow = 'SG-SST',
  title = 'BYTE',
  description = DEFAULT_DESCRIPTION,
}: LoginBrand & { className?: string }) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="relative mb-6 flex size-24 items-center justify-center md:size-28">
        <img
          src={logoSrc}
          alt={logoAlt}
          className="size-full object-contain drop-shadow-[0_12px_20px_rgba(147,149,211,0.35)] dark:drop-shadow-[0_15px_25px_rgba(147,149,211,0.35)]"
        />
      </div>

      <div className="w-full max-w-xl">
        <StaggerReveal>
          <StaggerReveal.Line
            as="span"
            line={1}
            className="mb-2 text-xs font-bold tracking-wider text-brand-soft uppercase"
          >
            {eyebrow}
          </StaggerReveal.Line>
          <StaggerReveal.Line
            as="h1"
            line={2}
            className="mb-3 font-display text-4xl leading-none font-extrabold tracking-tight text-foreground lg:text-5xl dark:text-white"
          >
            {title}
          </StaggerReveal.Line>
          <StaggerReveal.Line
            as="p"
            line={3}
            className="text-xs leading-relaxed font-normal text-muted-foreground lg:text-sm dark:text-brand-lavender"
          >
            {description}
          </StaggerReveal.Line>
        </StaggerReveal>
      </div>
    </div>
  );
}
