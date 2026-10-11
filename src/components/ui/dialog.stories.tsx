import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  component: Dialog,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Nueva sede</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva sede</DialogTitle>
          <DialogDescription>Completa los datos de la sede.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export const Default: Story = {
  render: () => <DialogExample />,
};

export const Open: Story = {
  render: () => <DialogExample />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Nueva sede' }));
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Nueva sede' });
    await expect(dialog).toHaveAttribute('data-state', 'open');
  },
};
