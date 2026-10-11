import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FORM_CARD_CLASS, FORM_SHELL_CLASS, FormShell } from './FormShell';

describe('FormShell', () => {
  it('renderiza el div contenedor con FORM_SHELL_CLASS y sin ninguna utilidad de ancho máximo', () => {
    const { container } = render(
      <FormShell>
        <span>contenido</span>
      </FormShell>,
    );

    expect(container.firstChild).toHaveClass(...FORM_SHELL_CLASS.split(' '));
    const containerClassAttr = (container.firstChild as HTMLElement).getAttribute('class');
    expect(containerClassAttr).not.toMatch(/max-w-|mx-auto/);
  });

  it('por defecto aplica FORM_CARD_CLASS al `<form>` interno', () => {
    const { container } = render(
      <FormShell>
        <span>contenido</span>
      </FormShell>,
    );

    const form = container.querySelector('form');
    expect(form).toHaveClass(...FORM_CARD_CLASS.split(' '));
  });

  it('con card={false} el `<form>` no lleva ninguna clase de tarjeta', () => {
    const { container } = render(
      <FormShell card={false}>
        <span>contenido</span>
      </FormShell>,
    );

    const form = container.querySelector('form');
    expect(form).not.toHaveClass(...FORM_CARD_CLASS.split(' '));
  });

  it('reenvía onSubmit y demás props de `<form>` al elemento real, con noValidate por defecto sobreescribible', () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container, rerender } = render(
      <FormShell onSubmit={handleSubmit} data-testid="mi-form">
        <button type="submit">Enviar</button>
      </FormShell>,
    );

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('novalidate');
    expect(form).toHaveAttribute('data-testid', 'mi-form');

    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    rerender(
      <FormShell onSubmit={handleSubmit} noValidate={false}>
        <button type="submit">Enviar</button>
      </FormShell>,
    );
    const overriddenForm = container.querySelector('form');
    expect(overriddenForm).not.toHaveAttribute('novalidate');
  });

  it('aplica className al `<form>` y containerClassName al div contenedor', () => {
    const { container } = render(
      <FormShell className="mi-form-clase" containerClassName="mi-contenedor-clase">
        <span>contenido</span>
      </FormShell>,
    );

    expect(container.firstChild).toHaveClass('mi-contenedor-clase');
    const form = container.querySelector('form');
    expect(form).toHaveClass('mi-form-clase');
  });
});
