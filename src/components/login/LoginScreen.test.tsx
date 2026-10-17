import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';

function fieldTrack(label: string) {
  return screen.getByLabelText(label).closest('.t-input-shake-track');
}

function fieldShell(label: string) {
  return screen.getByLabelText(label).closest('.t-input');
}

describe('LoginScreen', () => {
  it('renderiza los inputs del formulario sin borde ni BorderBeam', () => {
    render(<LoginScreen showPassword onSubmit={vi.fn()} />);

    const email = screen.getByLabelText('Correo electrónico');
    const password = screen.getByLabelText('Contraseña');

    expect(email).toHaveAttribute('type', 'email');
    expect(password).toHaveAttribute('type', 'password');
    expect(fieldShell('Correo electrónico')).toHaveClass('ring-0');
    expect(fieldShell('Contraseña')).toHaveClass('ring-0');
    expect(fieldShell('Correo electrónico')).not.toHaveClass('ring-1');
    expect(fieldShell('Contraseña')).not.toHaveClass('ring-1');
    expect(fieldTrack('Correo electrónico')?.querySelector('[data-beam]')).toBeNull();
    expect(fieldTrack('Contraseña')?.querySelector('[data-beam]')).toBeNull();

    fireEvent.focus(email);
    fireEvent.mouseDown(password);
    expect(fieldShell('Correo electrónico')).toHaveClass('ring-0');
    expect(fieldShell('Contraseña')).toHaveClass('ring-0');
    expect(fieldTrack('Correo electrónico')?.querySelector('[data-beam]')).toBeNull();
    expect(fieldTrack('Contraseña')?.querySelector('[data-beam]')).toBeNull();
  });
});
