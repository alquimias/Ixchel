import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('renderiza formFooter debajo del envío', () => {
    render(
      <LoginScreen
        showPassword
        onSubmit={vi.fn()}
        formFooter={<a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>}
      />,
    );

    expect(
      screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' }),
    ).toHaveAttribute('href', '/recuperar-contrasena');
  });

  it('en modo username muestra el campo de usuario y envía el nombre en email', async () => {
    const onSubmit = vi.fn();
    render(<LoginScreen showPassword identifier="username" onSubmit={onSubmit} />);

    const user = screen.getByLabelText('Usuario');
    expect(user).toHaveAttribute('type', 'text');
    expect(screen.queryByLabelText('Correo electrónico')).toBeNull();

    fireEvent.change(user, { target: { value: 'jose' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret' } });
    fireEvent.submit(user.closest('form')!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: 'jose', password: 'secret' });
    });
  });
});
