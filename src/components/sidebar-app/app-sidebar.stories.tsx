import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { SidebarInsetTopbar } from './inset-topbar';

const meta = {
  component: AppSidebar,
  tags: ['autodocs'],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SidebarProvider className="min-h-[480px] w-full overflow-hidden rounded-xl border border-border">
      <AppSidebar />
      <SidebarInset>
        <SidebarInsetTopbar>
          <span className="text-sm">Inbox</span>
        </SidebarInsetTopbar>
        <div className="p-6 text-muted-foreground">Main canvas</div>
      </SidebarInset>
    </SidebarProvider>
  ),
};
