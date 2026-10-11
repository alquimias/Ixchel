import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppStatusBar } from './AppStatusBar';

const meta = {
  component: AppStatusBar,
  tags: ['autodocs'],
  args: {
    environmentLabel: 'desarrollo',
    version: '1.16.0',
    health: { status: 'ok', timestamp: '2026-06-17T00:00:00.000Z' },
    privacyTo: '/politica-privacidad',
  },
} satisfies Meta<typeof AppStatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  args: {
    variant: 'login',
    productName: 'BYTE',
    moduleLabel: 'SG-SST',
  },
};

export const App: Story = {
  args: {
    variant: 'app',
    routeLabel: 'Trabajadores',
    userLabel: 'admin@byco.test',
    tenantName: 'BYCO Demo',
    sidebarCollapsed: false,
  },
};

export const AppSidebarCollapsed: Story = {
  args: {
    variant: 'app',
    routeLabel: 'Trabajadores',
    userLabel: 'admin@byco.test',
    tenantName: 'BYCO Demo',
    sidebarCollapsed: true,
  },
};
