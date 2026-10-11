'use client';

import {
  createContext,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  useCallback,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ChangeEvent,
  type FocusEvent,
} from 'react';
import { BorderBeam } from 'border-beam';
import { Field } from '@base-ui/react/field';
import type { IconComponent } from '../../lib/icon-context';
import {
  formFieldErrorClassName,
  formFieldLabelClassName,
  formFieldLabelStyle,
  formFieldStackClassName,
} from '../../lib/form-field-styles';
import { fontWeights } from '../../lib/font-weight';
import { cn } from '../../lib/utils';
import { useShape } from '../../lib/shape-context';
import { useInputErrorShake } from '../../hooks/use-input-error-shake';
import { usePrefersReducedMotion } from '../../lib/dotmatrix-hooks';

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

type InputBeamContextValue = {
  activeId: string | null;
  activate: (id: string) => void;
  deactivate: (id: string) => void;
};

const InputBeamContext = createContext<InputBeamContextValue | null>(null);

const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ children, className, ...props }, ref) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const activate = useCallback((id: string) => {
      setActiveId(id);
    }, []);
    const deactivate = useCallback((id: string) => {
      setActiveId((current) => (current === id ? null : current));
    }, []);
    const beamContext = useMemo(
      () => ({ activeId, activate, deactivate }),
      [activeId, activate, deactivate],
    );

    return (
      <InputBeamContext.Provider value={beamContext}>
        <div
          ref={ref}
          className={cn('relative flex flex-col gap-3 w-full max-w-full', className)}
          {...props}
        >
          {children}
        </div>
      </InputBeamContext.Provider>
    );
  },
);

InputGroup.displayName = 'InputGroup';

function syncInputRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  (ref as React.MutableRefObject<T | null>).current = node;
}

interface InputFieldLabelProps {
  label: string;
  error?: string;
  hideLabel?: boolean;
  htmlFor?: string;
}

function InputFieldLabel({ label, error, hideLabel, htmlFor }: InputFieldLabelProps) {
  return (
    <Field.Label
      htmlFor={htmlFor}
      className={cn(formFieldLabelClassName, hideLabel && 'sr-only', error && 'text-destructive')}
      style={formFieldLabelStyle}
    >
      {label}
    </Field.Label>
  );
}

function useInputFieldStyles({
  disabled,
  error,
  isFocused,
  isHovered,
}: {
  disabled?: boolean;
  error?: string;
  isFocused: boolean;
  isHovered: boolean;
}) {
  let bgClass: string;
  let ringClass: string;

  if (disabled) {
    bgClass = 'bg-transparent';
    ringClass = 'ring-border';
  } else if (error) {
    bgClass = isFocused
      ? 'bg-card'
      : isHovered
        ? 'bg-destructive-light/60'
        : 'bg-destructive-light/30';
    ringClass = isFocused || isHovered ? 'ring-destructive' : 'ring-destructive/50';
  } else if (isFocused) {
    bgClass = 'bg-card';
    ringClass = 'ring-border';
  } else if (isHovered) {
    bgClass = 'bg-muted/50';
    ringClass = 'ring-border';
  } else {
    // Borde visible en reposo, igual que `Select` (bordered) y `Textarea`: antes el
    // campo era invisible hasta el hover/foco y desentonaba junto a ellos.
    bgClass = 'bg-transparent';
    ringClass = 'ring-border';
  }

  return { bgClass, ringClass };
}

function normalizeFieldLabel(label: string): string {
  return label.replace(/\s*\*+\s*$/, '').trim();
}

const PLACEHOLDER_EXAMPLES: Record<string, string> = {
  'número de documento': '1234567890',
  nit: '900123456-7',
  dirección: 'Calle 123 #45-67',
  teléfono: '3001234567',
  'correo corporativo': 'usuario@empresa.com',
  'correo electrónico': 'correo@ejemplo.com',
  'primer nombre': 'Juan',
  'segundo nombre': 'Carlos',
  'primer apellido': 'Pérez',
  'segundo apellido': 'Gómez',
  proceso: 'Producción',
  'área / zona': 'Bodega principal',
  actividad: 'Operación de montacargas',
  'trabajadores expuestos': '5',
  responsable: 'Nombre del responsable',
  tema: 'Trabajo en alturas',
  instructor: 'Juan Pérez',
  lugar: 'Sala de capacitación',
  'ips examinadora': 'IPS Salud Ocupacional',
  referencia: 'REF-001',
  talla: 'M',
  cantidad: '1',
  'duración (horas)': '2',
  nombre: 'Coordinador SST',
  'actividad económica': 'Manufactura de productos metálicos',
  'arl afiliada': 'Sura, Colmena, Positiva…',
};

function defaultPlaceholder(label: string, type = 'text'): string | undefined {
  const normalized = normalizeFieldLabel(label);
  const key = normalized.toLowerCase();

  if (type === 'email' || key.includes('correo')) {
    return 'correo@ejemplo.com';
  }
  if (type === 'date') return 'aaaa-mm-dd';
  if (type === 'datetime-local') return 'aaaa-mm-dd --:--';
  if (type === 'number') {
    return PLACEHOLDER_EXAMPLES[key] ? `Ej. ${PLACEHOLDER_EXAMPLES[key]}` : 'Ej. 1';
  }

  const example = PLACEHOLDER_EXAMPLES[key];
  if (example) return `Ej. ${example}`;

  return `Ingresa ${normalized.toLowerCase()}`;
}

export interface InputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'index' | 'value'
> {
  label: string;
  placeholder?: string;
  icon?: IconComponent;
  index?: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
  description?: ReactNode;
  /** Borde animado (p. ej. campo de correo en login). */
  borderBeam?: boolean;
}

const InputField = forwardRef<HTMLDivElement, InputFieldProps>(
  (
    {
      className,
      label,
      placeholder,
      icon: Icon,
      value,
      onChange,
      onBlur,
      error,
      disabled,
      hideLabel,
      description,
      borderBeam = false,
      type = 'text',
      id,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const beam = useContext(InputBeamContext);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();
    const shape = useShape();

    const claimBeam = useCallback(() => {
      if (!borderBeam) return;
      beam?.activate(fieldId);
    }, [beam, borderBeam, fieldId]);

    const releaseBeam = useCallback(() => {
      if (!borderBeam) return;
      beam?.deactivate(fieldId);
    }, [beam, borderBeam, fieldId]);

    const showBeam =
      borderBeam &&
      !prefersReducedMotion &&
      !error &&
      (beam ? beam.activeId === fieldId : isFocused);

    const labelActive = isFocused || isHovered;
    const { isError, isShaking } = useInputErrorShake(error);
    const { bgClass, ringClass } = useInputFieldStyles({
      disabled,
      error,
      isFocused,
      isHovered,
    });
    const resolvedPlaceholder =
      placeholder ?? (hideLabel ? 'Buscar…' : defaultPlaceholder(label, type));

    const inputShell = (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(e) => {
          claimBeam();
          if (e.target === inputRef.current) return;
          e.preventDefault();
          inputRef.current?.focus();
        }}
        className={cn(
          't-input flex items-center gap-2 px-3 py-2 transition-all duration-80',
          shape.input,
          isError && 'is-error',
          isShaking && 'is-shaking',
          bgClass,
          borderBeam && !error ? 'ring-0' : cn('ring-1', ringClass),
        )}
      >
        {Icon && (
          <Icon
            size={16}
            strokeWidth={labelActive ? 2 : 1.5}
            className={cn(
              'shrink-0 transition-[color,stroke-width] duration-80',
              labelActive ? 'text-foreground' : 'text-muted-foreground',
            )}
          />
        )}
        <Field.Control
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            claimBeam();
          }}
          onBlur={(e) => {
            setIsFocused(false);
            releaseBeam();
            onBlur?.(e);
          }}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none font-[inherit]"
          style={{ fontVariationSettings: fontWeights.normal }}
          {...props}
        />
      </div>
    );

    const inputControl = showBeam ? (
      <BorderBeam
        className="block w-full"
        size="line"
        theme="auto"
        colorVariant="ocean"
        strength={0.85}
        duration={2.4}
      >
        {inputShell}
      </BorderBeam>
    ) : (
      inputShell
    );

    return (
      <Field.Root
        ref={ref}
        invalid={!!error}
        disabled={disabled}
        className={cn(
          formFieldStackClassName,
          't-input-wrap',
          isError && 'is-error',
          'cursor-text',
          disabled && 'opacity-50 pointer-events-none',
          className,
        )}
      >
        <InputFieldLabel label={label} error={error} hideLabel={hideLabel} htmlFor={id} />

        <div className="t-input-shake-track">{inputControl}</div>

        {description ? (
          <p className="text-[12px] text-muted-foreground pl-3">{description}</p>
        ) : null}

        <Field.Error
          match
          className={cn(formFieldErrorClassName, 't-error-msg')}
          style={{ fontVariationSettings: fontWeights.medium }}
        >
          {error ?? ''}
        </Field.Error>
      </Field.Root>
    );
  },
);

InputField.displayName = 'InputField';

export interface InputFileFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'index' | 'value'
> {
  label: string;
  index?: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
  description?: ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
}

const InputFileField = forwardRef<HTMLDivElement, InputFileFieldProps>(
  (
    {
      className,
      label,
      onChange,
      onBlur,
      error,
      disabled,
      hideLabel,
      description,
      inputRef: fileInputRefProp,
      id,
      ...props
    },
    ref,
  ) => {
    const controlRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const shape = useShape();
    const { isError, isShaking } = useInputErrorShake(error);

    const { bgClass, ringClass } = useInputFieldStyles({
      disabled,
      error,
      isFocused,
      isHovered,
    });

    const assignFileControlRef = useCallback(
      (node: HTMLInputElement | null) => {
        controlRef.current = node;
        syncInputRef(fileInputRefProp, node);
      },
      [fileInputRefProp],
    );

    return (
      <Field.Root
        ref={ref}
        invalid={!!error}
        disabled={disabled}
        className={cn(
          formFieldStackClassName,
          't-input-wrap',
          isError && 'is-error',
          disabled && 'opacity-50 pointer-events-none',
          className,
        )}
      >
        <InputFieldLabel label={label} error={error} hideLabel={hideLabel} htmlFor={id} />

        <div className="t-input-shake-track">
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              't-input flex items-center gap-2 px-3 py-2 ring-1 transition-all duration-80',
              shape.input,
              isError && 'is-error',
              isShaking && 'is-shaking',
              bgClass,
              ringClass,
            )}
          >
            <Field.Control
              ref={assignFileControlRef}
              id={id}
              type="file"
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              disabled={disabled}
              className="w-full bg-transparent text-[13px] text-foreground outline-none file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium"
              style={{ fontVariationSettings: fontWeights.normal }}
              {...props}
            />
          </div>
        </div>

        {description ? (
          <p className="text-[12px] text-muted-foreground pl-3">{description}</p>
        ) : null}

        <Field.Error
          match
          className={cn(formFieldErrorClassName, 't-error-msg')}
          style={{ fontVariationSettings: fontWeights.medium }}
        >
          {error ?? ''}
        </Field.Error>
      </Field.Root>
    );
  },
);

InputFileField.displayName = 'InputFileField';

export { InputGroup, InputField, InputFileField };
export default InputGroup;
