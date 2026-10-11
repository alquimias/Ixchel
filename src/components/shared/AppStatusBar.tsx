import type { ReactNode } from 'react';
import { Activity, Building2, LayoutGrid, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UiLink } from '../../link';
import { DigitPopIn } from './DigitPopIn';

export const APP_STATUS_BAR_HEIGHT_PX = 22;

export const appStatusBarHeightStyle = {
  '--app-status-bar-height': `${APP_STATUS_BAR_HEIGHT_PX}px`,
} as Record<'--app-status-bar-height', string>;

export type AppStatusBarHealthState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ok'; timestamp?: string };

export type AppStatusBarProps = {
  className?: string;
  /** `login` muestra producto y módulo. `app` muestra ruta, usuario y empresa. */
  variant?: 'app' | 'login';
  productName?: string;
  moduleLabel?: string;
  routeLabel?: string;
  userLabel?: string | null;
  tenantName?: string | null;
  sidebarCollapsed?: boolean;
  privacyTo?: string;
  privacyLabel?: string;
  environmentLabel: string;
  health?: AppStatusBarHealthState;
  version: string;
};

const statusBarRootClass =
  'flex h-[var(--app-status-bar-height,22px)] shrink-0 items-stretch justify-between overflow-hidden border-t border-brand-lavender/15 bg-sidebar text-[11px] font-medium leading-none text-muted-foreground select-none';

const statusSegmentClass =
  'inline-flex h-full items-center gap-1.5 px-2.5 transition-colors hover:bg-black/5 hover:text-brand-black dark:hover:bg-white/5 dark:hover:text-white';

const statusIconClass = 'size-3 shrink-0 text-brand-soft';

const tenantColumnClass =
  'flex h-full shrink-0 items-center gap-1.5 border-r border-brand-lavender/20 px-2.5 transition-[width] duration-200 ease-linear hover:bg-black/5 dark:hover:bg-white/5';

/** Oculto por debajo de `md`: en pantallas angostas el grupo derecho ya no
 * cabe completo, y este es el segmento menos crítico para un vistazo rápido. */
const healthSegmentResponsiveClass = 'hidden md:inline-flex';

function StatusSegment({
  children,
  title,
  className,
  accent,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
  accent?: boolean;
}) {
  return (
    <span
      title={title}
      className={cn(statusSegmentClass, accent && 'font-bold text-brand-soft', className)}
    >
      {children}
    </span>
  );
}

function TenantStatusColumn({ name, collapsed }: { name: string; collapsed: boolean }) {
  return (
    <div
      title={`Empresa: ${name}`}
      className={cn(
        tenantColumnClass,
        'hidden min-w-0 md:flex',
        collapsed
          ? 'w-(--sidebar-width-icon) justify-center !px-0'
          : 'w-(--sidebar-width) justify-center text-center',
      )}
    >
      <Building2 className={statusIconClass} aria-hidden />
      <span className={cn('min-w-0 truncate', collapsed && 'sr-only')}>{name}</span>
    </div>
  );
}

function HealthSegment({ health }: { health: AppStatusBarHealthState }) {
  if (health.status === 'loading') {
    return (
      <StatusSegment
        title="Verificando estado del sistema"
        className={healthSegmentResponsiveClass}
      >
        <span>Verificando estado del sistema…</span>
      </StatusSegment>
    );
  }

  if (health.status === 'error') {
    return (
      <StatusSegment
        title="No se pudo verificar el estado del sistema"
        className={cn('text-rose-500', healthSegmentResponsiveClass)}
      >
        <span>No se pudo verificar el estado del sistema</span>
      </StatusSegment>
    );
  }

  const label = health.timestamp ? `Sistema operativo · ${health.timestamp}` : 'Sistema operativo';

  return (
    <StatusSegment title={label} className={cn('text-success', healthSegmentResponsiveClass)}>
      <span>{label}</span>
    </StatusSegment>
  );
}

function LoginContext({ productName, moduleLabel }: { productName: string; moduleLabel: string }) {
  return (
    <>
      <StatusSegment title={productName}>
        <Activity className={statusIconClass} aria-hidden />
        <span className="font-extrabold tracking-tight text-foreground">{productName}</span>
      </StatusSegment>
      {moduleLabel ? (
        <StatusSegment title={moduleLabel} accent>
          <span className="text-[10px] uppercase tracking-wider">{moduleLabel}</span>
        </StatusSegment>
      ) : null}
    </>
  );
}

function AppContext({ routeLabel, userLabel }: { routeLabel?: string; userLabel?: string | null }) {
  return (
    <>
      {routeLabel ? (
        <StatusSegment title={`Módulo: ${routeLabel}`} accent>
          <LayoutGrid className={statusIconClass} aria-hidden />
          <span className="max-w-[12rem] truncate">{routeLabel}</span>
        </StatusSegment>
      ) : null}
      {userLabel ? (
        <StatusSegment title={`Usuario: ${userLabel}`}>
          <User className={statusIconClass} aria-hidden />
          <span className="max-w-[10rem] truncate">{userLabel}</span>
        </StatusSegment>
      ) : null}
    </>
  );
}

export function AppStatusBar({
  variant = 'app',
  productName = '',
  moduleLabel = '',
  routeLabel,
  userLabel,
  tenantName,
  sidebarCollapsed = false,
  privacyTo,
  privacyLabel = 'Política de datos',
  environmentLabel,
  health,
  version,
  className,
}: AppStatusBarProps) {
  return (
    <footer
      role="contentinfo"
      aria-label="Barra de estado"
      className={cn(statusBarRootClass, className)}
    >
      {variant === 'app' && tenantName ? (
        <TenantStatusColumn name={tenantName} collapsed={sidebarCollapsed} />
      ) : null}

      <div className="flex min-w-0 flex-1 items-stretch justify-between overflow-hidden">
        <div className="flex min-w-0 items-stretch overflow-hidden">
          {variant === 'login' ? (
            <LoginContext productName={productName} moduleLabel={moduleLabel} />
          ) : (
            <AppContext routeLabel={routeLabel} userLabel={userLabel} />
          )}
        </div>

        <div className="flex shrink-0 items-stretch">
          {privacyTo ? (
            <UiLink
              to={privacyTo}
              title={privacyLabel}
              className={cn(statusSegmentClass, 'hidden sm:inline-flex')}
            >
              <span>{privacyLabel}</span>
            </UiLink>
          ) : null}
          <StatusSegment title={`Entorno: ${environmentLabel}`} accent>
            <span className="text-[10px] uppercase tracking-wider">{environmentLabel}</span>
          </StatusSegment>
          {health ? <HealthSegment health={health} /> : null}
          <StatusSegment title={`Versión ${version}`}>
            <DigitPopIn text={`v${version}`} className="text-brand-lavender" />
          </StatusSegment>
        </div>
      </div>
    </footer>
  );
}
