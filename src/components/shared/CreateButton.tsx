import { Plus } from 'lucide-react';
import { Button, type ButtonProps } from '../ui/button';
import { cn } from '../../lib/utils';

export type CreateButtonProps = Omit<ButtonProps, 'variant' | 'leadingIcon' | 'asChild'>;

export function CreateButton({ children, className, ...props }: CreateButtonProps) {
  return (
    <Button variant="primary" leadingIcon={Plus} className={cn(className)} {...props}>
      {children}
    </Button>
  );
}
