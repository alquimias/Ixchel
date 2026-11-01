import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Badge, Button, FluidProvider, Switch, Table, TableBody, TableCell, TableRow } from './index';

function wrap(ui: ReactElement) {
  return render(<FluidProvider>{ui}</FluidProvider>);
}

describe('Ixchel public API', () => {
  it('renders Button', () => {
    wrap(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders Badge', () => {
    wrap(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders Switch in the checked state', () => {
    wrap(<Switch label="Notify" checked onToggle={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders Table rows', () => {
    wrap(
      <Table>
        <TableBody>
          <TableRow index={0}>
            <TableCell>Alice</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
