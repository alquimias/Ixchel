import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  SIDEBAR_WIDTH_ICON,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  type SidebarCollapsible,
} from '../sidebar';

beforeAll(() => {
  if (typeof Element !== 'undefined') {
    if (typeof Element.prototype.setPointerCapture !== 'function') {
      Element.prototype.setPointerCapture = () => undefined;
    }
    if (typeof Element.prototype.releasePointerCapture !== 'function') {
      Element.prototype.releasePointerCapture = () => undefined;
    }
  }
});

const ICON_COLLAPSIBLE: SidebarCollapsible = 'icon';

function railFixture(opts: {
  open: boolean;
  collapsible?: SidebarCollapsible;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <SidebarProvider open={opts.open} onOpenChange={opts.onOpenChange} persist={false}>
      <Sidebar collapsible={opts.collapsible ?? ICON_COLLAPSIBLE} variant="inset">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Grupo</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Acción de grupo">+</SidebarGroupAction>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Ir al inicio">Dashboard</SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>Hoja</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

function getSidebarNode() {
  return document.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
}

function getWrapperNode() {
  return document.querySelector('[data-slot="sidebar-wrapper"]') as HTMLElement | null;
}

describe('sidebar collapsible=icon', () => {
  it('exporta SIDEBAR_WIDTH_ICON como 3rem y acepta collapsible icon', () => {
    expect(SIDEBAR_WIDTH_ICON).toBe('3rem');
    expect(ICON_COLLAPSIBLE).toBe('icon');
  });

  it('SidebarProvider define --sidebar-width-icon en el wrapper', () => {
    render(railFixture({ open: true }));
    const wrapper = getWrapperNode();
    expect(wrapper).not.toBeNull();
    expect(wrapper!.style.getPropertyValue('--sidebar-width-icon')).toBe(SIDEBAR_WIDTH_ICON);
  });

  it('colapsado con icon: data-state=collapsed, data-collapsible=icon y ancho distinto de 0', () => {
    render(railFixture({ open: false, collapsible: 'icon' }));
    const sidebar = getSidebarNode();
    expect(sidebar).not.toBeNull();
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    expect(sidebar).toHaveAttribute('data-collapsible', 'icon');
    expect(sidebar!.style.width).not.toBe('0rem');
    expect(sidebar!.style.width).not.toBe('0px');
    expect(sidebar!.style.width).toBe(SIDEBAR_WIDTH_ICON);
  });

  it('colapsado con offcanvas (default) sigue yendo a ancho 0', () => {
    render(railFixture({ open: false, collapsible: 'offcanvas' }));
    const sidebar = getSidebarNode();
    expect(sidebar).not.toBeNull();
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    expect(sidebar).toHaveAttribute('data-collapsible', 'offcanvas');
    expect(sidebar!.style.width).toBe('0rem');
  });

  it('muestra la etiqueta en expanded y la oculta del layout en icon collapsed', () => {
    const { rerender } = render(railFixture({ open: true }));
    expect(document.querySelector('[data-sidebar="group-label"]')).toBeVisible();
    expect(document.querySelector('[data-sidebar="group-action"]')).toBeVisible();
    expect(document.querySelector('[data-sidebar="menu-sub"]')).toBeVisible();
    expect(
      screen.getAllByText('Dashboard').some((el) => el.getAttribute('aria-hidden') !== 'true'),
    ).toBe(true);

    rerender(railFixture({ open: false }));
    expect(document.querySelector('[data-sidebar="group-label"]')).not.toBeVisible();
    expect(document.querySelector('[data-sidebar="group-action"]')).not.toBeVisible();
    expect(document.querySelector('[data-slot="sidebar-menu-sub-wrapper"]')).not.toBeVisible();
    expect(screen.queryAllByText('Dashboard')).toHaveLength(0);
  });

  it('tooltip del menú solo aparece en collapsed desktop', async () => {
    const { rerender } = render(railFixture({ open: true }));
    const expandedButton = document.querySelector('[data-sidebar="menu-button"]') as HTMLElement;
    fireEvent.pointerEnter(expandedButton);
    fireEvent.focus(expandedButton);
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(screen.queryByText('Ir al inicio')).toBeNull();

    rerender(railFixture({ open: false }));
    const collapsedButton = document.querySelector('[data-sidebar="menu-button"]') as HTMLElement;
    fireEvent.pointerEnter(collapsedButton);
    fireEvent.focus(collapsedButton);
    await waitFor(() => {
      expect(screen.getByText('Ir al inicio')).toBeInTheDocument();
    });
  });

  it('SidebarRail con open=false no llama setWidth en pointermove; el click sigue toggling', () => {
    const onOpenChange = vi.fn();
    render(railFixture({ open: false, onOpenChange }));
    const wrapper = getWrapperNode()!;
    const widthBefore = wrapper.style.getPropertyValue('--sidebar-width');

    const rail = screen.getByRole('button', {
      name: 'Resize or collapse sidebar',
    });
    fireEvent.pointerDown(rail, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(rail, { clientX: 280, pointerId: 1 });
    fireEvent.pointerUp(rail, { pointerId: 1 });

    expect(wrapper.style.getPropertyValue('--sidebar-width')).toBe(widthBefore);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('el contenido scrollea recortando el gutter para no desalinear el rail', () => {
    render(railFixture({ open: false, collapsible: 'icon' }));
    const clip = document.querySelector('[data-slot="sidebar-content-clip"]') as HTMLElement | null;
    const content = document.querySelector('[data-sidebar="content"]') as HTMLElement | null;
    expect(clip).not.toBeNull();
    expect(clip!.className).toMatch(/overflow-hidden/);
    expect(content).not.toBeNull();
    expect(content!.className).toMatch(/overflow-y-auto/);
    expect(content!.className).toMatch(/-mr-5/);
    expect(content!.className).toMatch(/pr-5/);
    expect(document.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeNull();
    expect(document.querySelector('[data-slot="scroll-area"]')).toBeNull();
  });

  it('inset colapsado en icon no añade ml-2 (alinea con la columna del status bar)', () => {
    render(
      <SidebarProvider open={false} persist={false}>
        <Sidebar collapsible="icon" variant="inset" />
        <SidebarInset>contenido</SidebarInset>
      </SidebarProvider>,
    );
    const inset = document.querySelector('[data-slot="sidebar-inset"]') as HTMLElement | null;
    expect(inset).not.toBeNull();
    expect(inset!.className).toContain(
      'peer-data-[collapsible=offcanvas]:peer-data-[state=collapsed]:peer-data-[side=left]:ml-2',
    );
    expect(inset!.className).not.toContain(
      'peer-data-[variant=inset]:peer-data-[state=collapsed]:peer-data-[side=left]:ml-2',
    );
  });
});
