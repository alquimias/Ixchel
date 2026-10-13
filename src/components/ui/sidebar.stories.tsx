import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronsUpDown, LayoutDashboard, Shield, Users } from 'lucide-react';
import { expect } from 'storybook/test';
import { bycoLogo } from '../../brand-logo';
import { Avatar, AvatarFallback } from './avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './sidebar';

const meta = {
  component: Sidebar,
  tags: ['autodocs', 'ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

function ShellSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon" className="!top-0 h-full">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="BYTE"
              className="cursor-default hover:bg-transparent active:bg-transparent"
            >
              <img
                src={bycoLogo}
                alt="Logo BYTE"
                className="h-10 w-auto max-w-10 shrink-0 object-contain"
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-display text-[15px] font-bold tracking-tight text-foreground">
                  BYTE
                </span>
                <span className="truncate text-[11px] font-semibold tracking-wide text-brand-soft uppercase">
                  SG-SST
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive icon={LayoutDashboard} tooltip="Dashboard">
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Expandir todos los módulos">
            <ChevronsUpDown />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton icon={Shield} tooltip="SG-SST">
                  SG-SST
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton isActive icon={Users} tooltip="Trabajadores">
                      Trabajadores
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Ana Pérez"
              className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">AP</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Ana Pérez</span>
                <span className="truncate text-xs">ana@example.com</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function AppChrome({ open }: { open: boolean }) {
  return (
    <SidebarProvider open={open} persist={false} className="min-h-80">
      <ShellSidebar />
      <SidebarInset>
        <div className="p-4">
          <SidebarTrigger />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Default: Story = {
  render: () => <AppChrome open />,
};

export const IconCollapsed: Story = {
  render: () => <AppChrome open={false} />,
  play: async ({ canvas, canvasElement }) => {
    const sidebar = canvasElement.querySelector('[data-slot="sidebar"]');
    await expect(sidebar).toHaveAttribute('data-collapsible', 'icon');
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(canvas.queryByText('Dashboard')).toBeNull();
    await expect(canvas.queryByText('Ana Pérez')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Expandir todos los módulos' }),
    ).toBeInTheDocument();
  },
};
