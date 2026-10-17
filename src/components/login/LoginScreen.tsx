import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { AuthLoadingState } from '../shared/PageTransitionLoader';
import { EmptyState } from '../shared/EmptyState';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { InputField, InputGroup } from '../ui/input-group';
import { LoginBrandIntro, type LoginBrand } from './LoginBrandIntro';
import { LoginChangelogTimeline, type LoginChangelogUpdate } from './LoginChangelogTimeline';
import { LoginScreenDivider } from './LoginScreenDivider';

export type LoginScreenAuthenticated = {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
};

export type LoginScreenProps = {
  brand?: LoginBrand;
  showPassword?: boolean;
  submitAriaLabel?: string;
  onSubmit: (values: { email: string; password: string }) => void | Promise<void>;
  pending?: { title: string; description: string } | null;
  authenticated?: LoginScreenAuthenticated | null;
  updates?: LoginChangelogUpdate[];
  toolbar?: ReactNode;
  footer?: ReactNode;
  /** Slot under the submit button (e.g. a password-reset link from the app). */
  formFooter?: ReactNode;
  style?: CSSProperties;
};

function validateLoginEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Ingresa tu correo electrónico';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Ingresa un correo electrónico válido';
  }
  return undefined;
}

export function LoginScreen({
  brand,
  showPassword = false,
  submitAriaLabel,
  onSubmit,
  pending = null,
  authenticated = null,
  updates = [],
  toolbar,
  footer,
  formFooter,
  style,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const busy =
    pending ??
    (submitting
      ? {
          title: 'Conectando...',
          description: showPassword
            ? 'Comprobando tus credenciales'
            : 'Redirigiendo al proveedor de identidad',
        }
      : null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextEmailError = validateLoginEmail(email);
    if (nextEmailError) {
      setEmailError(nextEmailError);
      return;
    }
    if (showPassword && !password) {
      setPasswordError('Ingresa tu contraseña');
      return;
    }
    setEmailError(undefined);
    setPasswordError(undefined);
    setSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), password });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo iniciar sesión. Intenta de nuevo.';
      if (showPassword) setPasswordError(message);
      else setEmailError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormContent = () => {
    if (busy) {
      return <AuthLoadingState title={busy.title} description={busy.description} />;
    }

    if (authenticated) {
      return (
        <EmptyState
          title={authenticated.title}
          description={authenticated.description}
          action={{ label: authenticated.actionLabel, to: authenticated.actionTo }}
        />
      );
    }

    return (
      <div className="mx-auto w-full max-w-lg">
        <LoginBrandIntro {...brand} />

        <form onSubmit={(event) => void handleSubmit(event)} className="login-form space-y-4">
          <InputGroup className="gap-4">
            <InputField
              id="login-username"
              label="Correo electrónico"
              icon={Mail}
              type="email"
              borderless
              value={email}
              onChange={(value) => {
                setEmail(value);
                if (emailError) setEmailError(undefined);
              }}
              error={emailError}
              placeholder="usuario@empresa.com"
              autoComplete="username"
            />
            {showPassword ? (
              <InputField
                id="login-password"
                label="Contraseña"
                icon={Lock}
                type="password"
                borderless
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  if (passwordError) setPasswordError(undefined);
                }}
                error={passwordError}
                autoComplete="current-password"
              />
            ) : null}
          </InputGroup>

          <Checkbox
            id="remember"
            defaultChecked
            label="Recordarme"
            labelClassName="text-xs font-semibold"
            fieldClassName="py-1"
          />

          <Button
            type="submit"
            variant="primary"
            size="default"
            trailingIcon={ArrowRight}
            aria-label={submitAriaLabel}
            className="w-full"
          >
            Iniciar sesión
          </Button>
          {formFooter ? <div className="pt-1">{formFooter}</div> : null}
        </form>
      </div>
    );
  };

  return (
    <div
      className="flex h-[calc(100svh-var(--app-status-bar-height,0px))] max-h-[calc(100svh-var(--app-status-bar-height,0px))] w-full flex-col overflow-hidden bg-[#F3F3F5] dark:bg-background"
      style={{
        ...style,
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto lg:flex-row lg:overflow-hidden">
        {toolbar ? (
          <div className="absolute top-4 right-4 z-20 md:top-6 md:right-6">{toolbar}</div>
        ) : null}

        <LoginScreenDivider />

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 md:p-8 lg:w-[44%] lg:shrink-0 lg:flex-none">
          <div className="w-full max-w-lg px-4 py-6 md:px-8">{renderFormContent()}</div>
        </div>

        <div className="hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex lg:w-[56%]">
          <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden border border-border bg-gradient-to-br from-white via-brand-ghost to-[#F0F1FA] p-6 text-foreground shadow-xl md:p-8 lg:border-l-0 lg:p-10 dark:border-transparent dark:bg-[#0C0D0F] dark:from-[#0C0D0F] dark:via-[#0C0D0F] dark:to-[#0C0D0F] dark:text-white dark:shadow-2xl">
            <div className="pointer-events-none absolute -top-10 -right-10 size-[500px] bg-gradient-to-br from-brand-soft/35 via-brand-peri/15 to-transparent opacity-70 dark:hidden" />
            <div
              className="pointer-events-none absolute -top-10 -right-10 hidden size-[500px] opacity-30 dark:block"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(147,149,211,0.2) 20%, transparent 60%)',
              }}
            />
            <div className="pointer-events-none absolute top-0 right-0 size-80 rounded-full bg-brand-soft/15 blur-3xl dark:bg-white/[0.04]" />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <LoginChangelogTimeline updates={updates} className="h-full min-h-0" />
            </div>
          </div>
        </div>
      </div>

      {footer}
    </div>
  );
}
