import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import { EllipsisVertical, Loader2 } from 'lucide-react';
import type { IconComponent } from '../../lib/icon-context';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownSeparator } from '../ui/dropdown';
import { MenuItem } from '../ui/menu-item';

export type TableRowActionItem = {
  id: string;
  label: string;
  icon?: IconComponent;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
  hidden?: boolean;
  separatorBefore?: boolean;
};

type TableRowActionsMenuProps = {
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
  items?: TableRowActionItem[];
};

const MenuIndexContext = createContext<(() => number) | null>(null);

type TableRowMenuItemProps = Omit<ComponentProps<typeof MenuItem>, 'index'>;

export function TableRowMenuItem(props: TableRowMenuItemProps) {
  const nextIndex = useContext(MenuIndexContext);
  if (!nextIndex) {
    throw new Error('TableRowMenuItem must be used within TableRowActionsMenu');
  }
  return <MenuItem index={nextIndex()} {...props} />;
}

export function TableRowActionsMenu({
  label = 'Acciones',
  disabled = false,
  loading = false,
  children,
  items,
}: TableRowActionsMenuProps) {
  const visibleItems = items?.filter((item) => !item.hidden) ?? [];

  let itemIndex = 0;
  const nextIndex = () => itemIndex++;

  const content = children ? (
    <MenuIndexContext.Provider value={nextIndex}>{children}</MenuIndexContext.Provider>
  ) : (
    visibleItems.flatMap((item) => {
      const parts: ReactNode[] = [];
      if (item.separatorBefore) {
        parts.push(<DropdownSeparator key={`sep-${item.id}`} />);
      }
      parts.push(
        <MenuItem
          key={item.id}
          index={nextIndex()}
          label={item.label}
          icon={item.icon}
          onSelect={item.onSelect}
          disabled={item.disabled}
          variant={item.destructive ? 'destructive' : 'default'}
        />,
      );
      return parts;
    })
  );

  if (!children && visibleItems.length === 0) return null;

  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={label}
              disabled={disabled || loading}
              className="h-10 w-10 rounded-lg hover:bg-brand-soft/15 hover:text-brand-soft transition-all"
            />
          }
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <EllipsisVertical className="size-4" aria-hidden="true" />
          )}
        </DropdownTrigger>
        <DropdownContent align="end" sideOffset={4} className="min-w-[160px]">
          {content}
        </DropdownContent>
      </DropdownMenu>
    </div>
  );
}
