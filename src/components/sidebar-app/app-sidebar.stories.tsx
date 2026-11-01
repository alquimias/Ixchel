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

function Canvas({
  defaultOpen = true,
  collapsible,
}: {
  defaultOpen?: boolean;
  collapsible?: 'icon' | 'offcanvas';
}) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      persist={false}
      // Storybook's preview iframe is often < 768px; keep the desktop rail
      // so the icon-collapse story is actually visible.
      mobileBreakpoint={1}
      className="min-h-[480px] w-full overflow-hidden rounded-xl border border-border"
    >
      <AppSidebar collapsible={collapsible} />
      <SidebarInset>
        <SidebarInsetTopbar>
          <span className="text-sm">Inbox</span>
        </SidebarInsetTopbar>
        <div className="p-6 text-muted-foreground">Main canvas</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Default: Story = {
  render: () => <Canvas />,
};

export const IconRail: Story = {
  render: () => <Canvas defaultOpen={false} collapsible="icon" />,
};
