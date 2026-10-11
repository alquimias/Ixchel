import { useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Search, SearchX } from 'lucide-react';
import {
  type ColumnDef,
  type RowData,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '../ui/button';
import { InputField, InputGroup } from '../ui/input-group';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '../../lib/utils';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- la firma de merge exige estos parámetros
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Alinea header y celda. `right` añade tabular-nums (columnas numéricas). */
    align?: 'right' | 'center';
  }
}

function isActionsColumn(columnId: string) {
  return columnId === 'acciones';
}

/** Estado de orden server-driven expuesto/consumido por la variante `controlled` (D-16, CR-01). */
export type DataTableSortingState = { id: string; desc: boolean } | null;

/** Ventana de debounce del buscador server-driven, dentro del rango 300–400 ms de D-15. */
export const SEARCH_DEBOUNCE_MS = 350;

export type DataTablePagination =
  | {
      mode: 'controlled';
      page: number;
      pageCount: number;
      onPageChange: (page: number) => void;
      /**
       * Campos server-driven, todos opcionales y aditivos (D-16). El
       * interruptor real es `onSearchChange`: una tabla `controlled` que no
       * lo pase conserva byte a byte el filtrado/orden client-side de hoy.
       */
      search?: string;
      onSearchChange?: (value: string) => void;
      sorting?: DataTableSortingState;
      onSortingChange?: (sorting: DataTableSortingState) => void;
    }
  | { mode: 'client' };

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading: boolean;
  pagination: DataTablePagination;
  searchPlaceholder?: string;
  getRowId?: (row: TData) => string;
  /** Filtros adicionales (ej. PeriodoFilter) renderizados junto al buscador, mismo renglón. */
  toolbarExtra?: ReactNode;
}

const PAGE_SIZE = 20;

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ArrowUp className="size-3.5 text-primary" aria-hidden="true" />;
  if (sorted === 'desc') return <ArrowDown className="size-3.5 text-primary" aria-hidden="true" />;
  return <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden="true" />;
}

function ariaSortFor(sorted: false | 'asc' | 'desc'): 'ascending' | 'descending' | 'none' {
  if (sorted === 'asc') return 'ascending';
  if (sorted === 'desc') return 'descending';
  return 'none';
}

export function DataTable<TData>({
  columns,
  data,
  loading,
  pagination,
  searchPlaceholder = 'Buscar…',
  getRowId,
  toolbarExtra,
}: DataTableProps<TData>) {
  const isControlled = pagination.mode === 'controlled';
  const serverSearch = isControlled ? (pagination.search ?? '') : '';
  const serverSorting = isControlled ? (pagination.sorting ?? null) : null;
  // El interruptor server-driven es la presencia de onSearchChange (D-16):
  // una tabla controlled sin él conserva el comportamiento client-side de hoy.
  const serverDriven = isControlled && pagination.onSearchChange !== undefined;

  const [sorting, setSorting] = useState<SortingState>(
    serverSorting ? [{ id: serverSorting.id, desc: serverSorting.desc }] : [],
  );
  const [globalFilter, setGlobalFilter] = useState(serverSearch);

  // Ajuste-de-estado-durante-el-render (precedente Phase 27-06): sincroniza
  // el estado interno con las props search/sorting sin useEffect+setState,
  // porque la regla de lint react-hooks/set-state-in-effect está activa en
  // este repo. Se guarda la última prop sincronizada y, cuando la prop
  // entrante difiere en el render actual, se actualizan ambos estados aquí
  // mismo, en el cuerpo del componente.
  const [syncedSearch, setSyncedSearch] = useState(serverSearch);
  if (serverDriven && serverSearch !== syncedSearch) {
    setSyncedSearch(serverSearch);
    setGlobalFilter(serverSearch);
  }

  const sortingKey = serverSorting ? `${serverSorting.id}:${serverSorting.desc}` : '';
  const [syncedSortingKey, setSyncedSortingKey] = useState(sortingKey);
  if (serverDriven && sortingKey !== syncedSortingKey) {
    setSyncedSortingKey(sortingKey);
    setSorting(serverSorting ? [{ id: serverSorting.id, desc: serverSorting.desc }] : []);
  }

  // Debounce del buscador server-driven (D-15/D-16, Pattern 2 de
  // 39-RESEARCH.md): el input actualiza globalFilter de inmediato (feedback
  // instantáneo, nunca se deshabilita ni pierde foco); tras
  // SEARCH_DEBOUNCE_MS sin pulsaciones se notifica a la página. Guarda de
  // montaje: no dispara si el valor ya coincide con la prop `search`
  // vigente, para no destruir un deep link `?q=...&page=3` (D-14).
  useEffect(() => {
    if (!serverDriven) return undefined;
    const timer = setTimeout(() => {
      if (globalFilter !== serverSearch) {
        pagination.onSearchChange?.(globalFilter);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, serverDriven]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      ...(isControlled
        ? { pagination: { pageIndex: pagination.page - 1, pageSize: PAGE_SIZE } }
        : {}),
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      if (serverDriven) {
        const first = next[0];
        pagination.onSortingChange?.(first ? { id: first.id, desc: first.desc } : null);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    getRowId: getRowId ?? ((row) => (row as unknown as { id: string }).id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(serverDriven ? { manualFiltering: true, manualSorting: true } : {}),
    ...(isControlled
      ? {
          manualPagination: true,
          pageCount: pagination.pageCount,
          onPaginationChange: (updater) => {
            const current = { pageIndex: pagination.page - 1, pageSize: PAGE_SIZE };
            const next = typeof updater === 'function' ? updater(current) : updater;
            pagination.onPageChange(next.pageIndex + 1);
          },
        }
      : {
          initialState: { pagination: { pageSize: PAGE_SIZE } },
        }),
  });

  const rows = table.getRowModel().rows;
  const hasNoResults = !loading && rows.length === 0 && globalFilter !== '';

  const page = isControlled ? pagination.page : table.getState().pagination.pageIndex + 1;
  const totalPages = isControlled ? pagination.pageCount : table.getPageCount();
  const showFooter = !loading && totalPages > 1;

  const goPrevious = () => {
    if (isControlled) {
      pagination.onPageChange(pagination.page - 1);
    } else {
      table.previousPage();
    }
  };

  const goNext = () => {
    if (isControlled) {
      pagination.onPageChange(pagination.page + 1);
    } else {
      table.nextPage();
    }
  };

  const canGoPrevious = isControlled ? pagination.page > 1 : table.getCanPreviousPage();
  const canGoNext = isControlled ? pagination.page < pagination.pageCount : table.getCanNextPage();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <InputGroup className="w-full sm:max-w-xs">
          <InputField
            label="Buscar en la tabla"
            hideLabel
            icon={Search}
            type="search"
            value={globalFilter}
            onChange={(value) => table.setGlobalFilter(value)}
            placeholder={searchPlaceholder}
          />
        </InputGroup>
        {toolbarExtra}
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const align = header.column.columnDef.meta?.align;
                const alignRight = align === 'right';
                const alignCenter = align === 'center';
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={canSort ? ariaSortFor(sorted) : undefined}
                    className={cn(
                      canSort && 'p-0',
                      isActionsColumn(header.column.id) && 'w-0 text-center',
                      alignRight && 'text-right',
                      alignCenter && 'text-center',
                    )}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="compact"
                        className={cn(
                          'h-10 w-full min-w-0 justify-start gap-1.5 rounded-none px-2 font-medium hover:text-foreground',
                          sorted && 'font-semibold text-primary hover:text-primary',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span
                          className={cn(
                            'inline-flex min-w-0 flex-1 items-center gap-1.5',
                            alignRight && 'justify-end',
                            alignCenter && 'justify-center',
                          )}
                        >
                          <span className="truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          <SortIcon sorted={sorted} />
                        </span>
                      </Button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows columns={columns.length} />
          ) : hasNoResults ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-full bg-accent text-brand-soft">
                    <SearchX className="size-5" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No se encontraron resultados para tu búsqueda.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      isActionsColumn(cell.column.id) && 'w-0 text-center',
                      cell.column.columnDef.meta?.align === 'right' && 'text-right tabular-nums',
                      cell.column.columnDef.meta?.align === 'center' && 'text-center',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showFooter ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-between">
          <Button variant="outline" disabled={!canGoPrevious} onClick={goPrevious}>
            Anterior
          </Button>
          <span className="order-first w-full text-center text-sm text-muted-foreground sm:order-none sm:w-auto">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" disabled={!canGoNext} onClick={goNext}>
            Siguiente
          </Button>
        </div>
      ) : null}
    </div>
  );
}
