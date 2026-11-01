import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AccordionContent,
  AccordionGroup,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

const meta = {
  component: AccordionGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof AccordionGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 'one',
    children: (
      <>
        <AccordionItem value="one">
          <AccordionTrigger>What is Fluid Functionalism?</AccordionTrigger>
          <AccordionContent>Motion that makes state changes legible.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Why springs?</AccordionTrigger>
          <AccordionContent>They reverse from where they are when interrupted.</AccordionContent>
        </AccordionItem>
      </>
    ),
  },
};
