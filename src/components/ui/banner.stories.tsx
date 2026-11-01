import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner, BannerDescription, BannerTitle } from './banner';

const meta = {
  component: Banner,
  tags: ['autodocs'],
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <BannerTitle>Registry updated</BannerTitle>
        <BannerDescription>Pull the latest Fluid Functionalism components.</BannerDescription>
      </>
    ),
  },
};

export const HighContrast: Story = {
  args: {
    status: 'success',
    contrast: 'high',
    children: (
      <>
        <BannerTitle>Saved</BannerTitle>
        <BannerDescription>Changes are live.</BannerDescription>
      </>
    ),
  },
};
