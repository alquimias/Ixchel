import { fontWeights } from './font-weight';

export const formFieldStackClassName = 'flex flex-col gap-1';

export const formFieldLabelClassName =
  'text-[13px] pl-3 text-muted-foreground leading-none select-none';

export const formFieldLabelStyle = {
  fontVariationSettings: fontWeights.normal,
} as const;

export const formFieldErrorClassName = 'text-[12px] text-destructive pl-3';
