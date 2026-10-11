'use client';

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import {
  InputField,
  InputFileField,
  type InputFieldProps,
  type InputFileFieldProps,
} from './input-group';

type FormInputFieldProps<T extends FieldValues> = Omit<
  InputFieldProps,
  'value' | 'onChange' | 'error' | 'onBlur' | 'name'
> & {
  control: Control<T>;
  name: FieldPath<T>;
};

export function FormInputField<T extends FieldValues>({
  control,
  name,
  ...props
}: FormInputFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <InputField
          {...props}
          name={field.name}
          value={field.value == null ? '' : String(field.value)}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

type FormInputFileFieldProps<T extends FieldValues> = Omit<
  InputFileFieldProps,
  'onChange' | 'error' | 'name' | 'onBlur'
> & {
  control: Control<T>;
  name: FieldPath<T>;
  onFileChange: NonNullable<InputFileFieldProps['onChange']>;
};

export function FormInputFileField<T extends FieldValues>({
  control,
  name,
  onFileChange,
  ...props
}: FormInputFileFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <InputFileField
          {...props}
          name={field.name}
          onBlur={field.onBlur}
          onChange={onFileChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
