import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthLoadingState, PageTransitionLoader } from './PageTransitionLoader';

const meta = {
  component: PageTransitionLoader,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof PageTransitionLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loader: Story = {
  render: () => <PageTransitionLoader className="h-40" />,
};

export const Auth: Story = {
  render: () => <AuthLoadingState title="Entrando" description="Verificando la sesión" />,
};
