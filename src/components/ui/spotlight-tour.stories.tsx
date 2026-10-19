import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from './button';
import { SpotlightTour, SpotlightTarget, type SpotlightStep } from './spotlight-tour';

const STEPS: SpotlightStep[] = [
  {
    id: 'empresa',
    target: 'demo-empresa',
    eyebrow: 'Primero',
    title: 'La empresa activa',
    description: 'Operas una empresa a la vez. El selector cambia el contexto de todo el panel.',
    side: 'bottom',
  },
  {
    id: 'modulos',
    target: 'demo-modulos',
    eyebrow: 'Después',
    title: 'Los módulos',
    description: 'El menú agrupa el trabajo diario: trabajadores, peligros, inspecciones, EPP.',
    side: 'right',
  },
  {
    id: 'cuentanos',
    target: 'demo-cuentanos',
    eyebrow: 'Si hace falta',
    title: 'Cuéntanos',
    description: 'Reporta un fallo o propone una mejora sin salir del panel.',
    side: 'top',
  },
];

const meta = {
  component: SpotlightTour,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SpotlightTour>;

export default meta;
type Story = StoryObj<typeof meta>;

function TourPlayground() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);

  return (
    <div className="relative flex min-h-[100svh] bg-background p-8 text-foreground">
      <aside className="flex w-56 flex-col gap-3 rounded-3xl bg-sidebar p-3 ring-1 ring-foreground/10">
        <SpotlightTarget id="demo-empresa">
          <div className="rounded-xl bg-sidebar-accent px-3 py-2 text-sm font-semibold">
            Empresa demo
          </div>
        </SpotlightTarget>
        <SpotlightTarget id="demo-modulos">
          <nav className="flex flex-col gap-1 rounded-xl p-1 text-sm">
            <span className="px-2 py-1.5 font-medium">Trabajadores</span>
            <span className="px-2 py-1.5 font-medium">Peligros</span>
            <span className="px-2 py-1.5 font-medium">Inspecciones</span>
          </nav>
        </SpotlightTarget>
        <div className="mt-auto">
          <SpotlightTarget id="demo-cuentanos">
            <button type="button" className="rounded-xl px-3 py-2 text-left text-sm">
              Cuéntanos
            </button>
          </SpotlightTarget>
        </div>
      </aside>
      <main className="flex flex-1 flex-col items-start gap-4 p-10">
        <p className="max-w-md text-muted-foreground">
          El velo recorta el control activo. Siguiente, los puntos o las flechas del teclado
          mueven el recorte.
        </p>
        {!open ? (
          <Button type="button" onClick={() => { setStep(0); setOpen(true); }}>
            Repetir guía
          </Button>
        ) : null}
      </main>
      <SpotlightTour
        open={open}
        steps={STEPS}
        step={step}
        onStepChange={setStep}
        onOpenChange={setOpen}
        labels={{ done: 'Empezar' }}
      />
    </div>
  );
}

export const Default: Story = {
  args: { open: true, steps: STEPS },
  render: () => <TourPlayground />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'La empresa activa' });
    await expect(dialog).toBeInTheDocument();
  },
};
