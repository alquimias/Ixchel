import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta = {
  component: Accordion,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

function AccordionExample() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="alcance">
        <AccordionTrigger>Alcance</AccordionTrigger>
        <AccordionContent>Cubre las sedes activas del periodo.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="responsables">
        <AccordionTrigger>Responsables</AccordionTrigger>
        <AccordionContent>El COPASST revisa los hallazgos.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export const Default: Story = {
  args: { type: 'single', collapsible: true, children: null },
  render: () => <AccordionExample />,
};

export const OpenItem: Story = {
  args: { type: 'single', collapsible: true, children: null },
  render: () => <AccordionExample />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Alcance' }));
    await expect(canvas.getByText('Cubre las sedes activas del periodo.')).toBeVisible();
  },
};
