import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, SEARCH_DEBOUNCE_MS } from '../DataTable';

interface FilaServer {
  id: string;
  nombre: string;
  estado: string;
}

interface FilaConUserId {
  userId: string;
  nombre: string;
}

const filasServer: FilaServer[] = [
  { id: 'a1', nombre: 'Ana', estado: 'activo' },
  { id: 'a2', nombre: 'Beto', estado: 'inactivo' },
  { id: 'a3', nombre: 'Carla', estado: 'activo' },
];

function columnasServer(opts?: { sinAcciones?: boolean }): ColumnDef<FilaServer>[] {
  const base: ColumnDef<FilaServer>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'estado', header: 'Estado' },
  ];
  if (opts?.sinAcciones) return base;
  return [
    ...base,
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => <button type="button">Editar {row.original.nombre}</button>,
    },
  ];
}

describe('DataTable', () => {
  it('cicla el orden ascendente -> descendente -> ninguno al hacer click en un encabezado ordenable', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'client' }}
      />,
    );

    const boton = screen.getByRole('button', { name: 'Nombre' });
    const th = boton.closest('th');
    expect(th).not.toBeNull();
    expect(th).toHaveAttribute('aria-sort', 'none');

    fireEvent.click(boton);
    expect(th).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.click(boton);
    expect(th).toHaveAttribute('aria-sort', 'descending');

    fireEvent.click(boton);
    expect(th).toHaveAttribute('aria-sort', 'none');
  });

  it('no expone botón de orden ni ícono clicable en una columna no ordenable', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'client' }}
      />,
    );

    const headerRow = screen.getAllByRole('row')[0];
    const accionesHeader = within(headerRow).getByText('Acciones');
    expect(accionesHeader.closest('th')?.querySelector('button')).toBeNull();
    expect(within(headerRow).queryByRole('button', { name: /Acciones/ })).not.toBeInTheDocument();
  });

  it('mantiene el orden estable entre filas empatadas en la columna ordenada', () => {
    const empatadas: FilaServer[] = [
      { id: 'e1', nombre: 'X', estado: 'activo' },
      { id: 'e2', nombre: 'X', estado: 'activo' },
      { id: 'e3', nombre: 'X', estado: 'activo' },
    ];
    render(
      <DataTable
        columns={[
          { accessorKey: 'nombre', header: 'Nombre' },
          { accessorKey: 'id', header: 'Id' },
        ]}
        data={empatadas}
        loading={false}
        pagination={{ mode: 'client' }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Nombre' }));

    const rows = screen.getAllByRole('row').slice(1);
    const idsRenderizados = rows.map((r) => within(r).getAllByRole('cell')[1].textContent);
    expect(idsRenderizados).toEqual(['e1', 'e2', 'e3']);
  });

  it('filtra las filas por substring case-insensitive con la búsqueda global', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'client' }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar en la tabla' });
    expect(input).toHaveAttribute('placeholder', 'Buscar…');

    fireEvent.change(input, { target: { value: 'ana' } });

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.queryByText('Beto')).not.toBeInTheDocument();
    expect(screen.queryByText('Carla')).not.toBeInTheDocument();
  });

  it('excluye del filtro las columnas con enableGlobalFilter false', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'client' }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar en la tabla' });
    fireEvent.change(input, { target: { value: 'Editar Ana' } });

    expect(screen.getByText('No se encontraron resultados para tu búsqueda.')).toBeInTheDocument();
  });

  it('sobreescribe el placeholder por defecto con searchPlaceholder', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'client' }}
        searchPlaceholder="Buscar peligro…"
      />,
    );

    expect(screen.getByPlaceholderText('Buscar peligro…')).toBeInTheDocument();
  });

  it('muestra una única fila "sin resultados" sin botones de acción cuando el filtro no coincide con nada', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'client' }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar en la tabla' });
    fireEvent.change(input, { target: { value: 'zzz-inexistente' } });

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(1);
    expect(
      within(rows[0]).getByText('No se encontraron resultados para tu búsqueda.'),
    ).toBeInTheDocument();
    expect(within(rows[0]).queryByRole('button')).not.toBeInTheDocument();
  });

  it('renderiza 3 filas de skeleton con columns.length celdas cuando loading es true, sin hardcodear el conteo', () => {
    const columnasAnchas: ColumnDef<FilaServer>[] = [
      { accessorKey: 'nombre', header: 'Nombre' },
      { accessorKey: 'estado', header: 'Estado' },
      { id: 'c3', header: 'C3', cell: () => null },
      { id: 'c4', header: 'C4', cell: () => null },
      { id: 'c5', header: 'C5', cell: () => null },
    ];
    const { container } = render(
      <DataTable
        columns={columnasAnchas}
        data={[]}
        loading={true}
        pagination={{ mode: 'client' }}
      />,
    );

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      const cells = within(row).getAllByRole('cell');
      expect(cells).toHaveLength(5);
    });
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(15);
  });

  it('pie de paginación no se renderiza mientras loading es true (comportamiento fijado, backstop)', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={[]}
        loading={true}
        pagination={{ mode: 'controlled', page: 2, pageCount: 5, onPageChange: vi.fn() }}
      />,
    );

    expect(screen.queryByText(/Página \d+ de \d+/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
  });

  it('paginación controlada invoca onPageChange y muestra el estado de página correcto', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'controlled', page: 2, pageCount: 5, onPageChange }}
      />,
    );

    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('oculta el pie de paginación controlada cuando pageCount es 1', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'controlled', page: 1, pageCount: 1, onPageChange: vi.fn() }}
      />,
    );

    expect(screen.queryByText(/Página \d+ de \d+/)).not.toBeInTheDocument();
  });

  it('pagina client-side mostrando 20 filas en la página 1 y 5 en la página 2 sobre 25 filas', () => {
    const filas25: FilaServer[] = Array.from({ length: 25 }, (_, i) => ({
      id: `id-${i}`,
      nombre: `Fila ${i}`,
      estado: 'activo',
    }));

    render(
      <DataTable
        columns={columnasServer({ sinAcciones: true })}
        data={filas25}
        loading={false}
        pagination={{ mode: 'client' }}
      />,
    );

    expect(screen.getAllByRole('row')).toHaveLength(1 + 20);
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getAllByRole('row')).toHaveLength(1 + 5);
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
  });

  it('conserva el contenido de la fila correcta tras reordenar cuando se usa getRowId', () => {
    const filasUserId: FilaConUserId[] = [
      { userId: 'u3', nombre: 'Charlie' },
      { userId: 'u1', nombre: 'Alice' },
      { userId: 'u2', nombre: 'Bob' },
    ];
    const columnasUserId: ColumnDef<FilaConUserId>[] = [
      { accessorKey: 'nombre', header: 'Nombre' },
      { accessorKey: 'userId', header: 'UserId' },
    ];

    render(
      <DataTable
        columns={columnasUserId}
        data={filasUserId}
        loading={false}
        pagination={{ mode: 'client' }}
        getRowId={(row) => row.userId}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Nombre' }));

    const rows = screen.getAllByRole('row').slice(1);
    const pares = rows.map((r) =>
      within(r)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    );
    expect(pares).toEqual([
      ['Alice', 'u1'],
      ['Bob', 'u2'],
      ['Charlie', 'u3'],
    ]);
  });
});

describe('DataTable — modo server-driven (CR-01, Fase 39)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounce (D-15): teclear 3 caracteres no llama a onSearchChange hasta pasar SEARCH_DEBOUNCE_MS, con el término completo', () => {
    const onSearchChange = vi.fn();
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange,
        }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar en la tabla' });
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'an' } });
    fireEvent.change(input, { target: { value: 'ana' } });

    expect(onSearchChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS + 10);

    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith('ana');
  });

  it('el timer de debounce se cancela al desmontar antes de vencer (cleanup del efecto)', () => {
    const onSearchChange = vi.fn();
    const { unmount } = render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange,
        }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar en la tabla' });
    fireEvent.change(input, { target: { value: 'ana' } });

    unmount();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS + 10);

    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('valor inmediato en el input — backstop resuelto (término parcial/incompleto): el texto tecleado se muestra antes de que venza el debounce, sin tratamiento intermedio adicional', () => {
    const onSearchChange = vi.fn();
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange,
        }}
      />,
    );

    const input = screen.getByRole('searchbox', {
      name: 'Buscar en la tabla',
    }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ana' } });

    expect(input.value).toBe('ana');
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('guarda de montaje: montar con search ya poblado desde la prop no dispara onSearchChange tras el debounce (deep link ?q=...&page=3)', () => {
    const onSearchChange = vi.fn();
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 3,
          pageCount: 5,
          onPageChange: vi.fn(),
          search: 'perez',
          onSearchChange,
        }}
      />,
    );

    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS + 10);

    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('sin refiltrado en cliente: con manualFiltering activo, un término que no matchea ninguna fila en cliente sigue mostrando las filas del servidor', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange: vi.fn(),
        }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar en la tabla' });
    fireEvent.change(input, { target: { value: 'zzz-no-matchea-nada' } });

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Beto')).toBeInTheDocument();
    expect(screen.getByText('Carla')).toBeInTheDocument();
  });

  it('sin reordenamiento en cliente: un click de encabezado no cambia el orden de filas renderizadas, pero sí el aria-sort de inmediato (icono optimista)', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange: vi.fn(),
          sorting: null,
          onSortingChange: vi.fn(),
        }}
      />,
    );

    const boton = screen.getByRole('button', { name: 'Nombre' });
    const th = boton.closest('th');
    const nombresAntes = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell')[0].textContent);

    fireEvent.click(boton);

    expect(th).toHaveAttribute('aria-sort', 'ascending');
    const nombresDespues = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(nombresDespues).toEqual(nombresAntes);
  });

  it('callback de orden: cada click llama a onSortingChange de inmediato (sin avanzar temporizadores) — asc, luego desc, luego null', () => {
    const onSortingChange = vi.fn();
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange: vi.fn(),
          sorting: null,
          onSortingChange,
        }}
      />,
    );

    const boton = screen.getByRole('button', { name: 'Nombre' });

    fireEvent.click(boton);
    expect(onSortingChange).toHaveBeenNthCalledWith(1, { id: 'nombre', desc: false });

    fireEvent.click(boton);
    expect(onSortingChange).toHaveBeenNthCalledWith(2, { id: 'nombre', desc: true });

    fireEvent.click(boton);
    expect(onSortingChange).toHaveBeenNthCalledWith(3, null);

    expect(onSortingChange).toHaveBeenCalledTimes(3);
  });

  it('sincronización desde props: re-renderizar con sorting distinta actualiza aria-sort sin necesidad de click', () => {
    const basePagination = {
      mode: 'controlled' as const,
      page: 1,
      pageCount: 1,
      onPageChange: vi.fn(),
      search: '',
      onSearchChange: vi.fn(),
      onSortingChange: vi.fn(),
    };

    const { rerender } = render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ ...basePagination, sorting: null }}
      />,
    );

    const boton = screen.getByRole('button', { name: 'Nombre' });
    const th = boton.closest('th');
    expect(th).toHaveAttribute('aria-sort', 'none');

    rerender(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ ...basePagination, sorting: { id: 'nombre', desc: false } }}
      />,
    );

    expect(th).toHaveAttribute('aria-sort', 'ascending');
  });

  it('sin-resultados en modo server-driven: con search no vacío y data vacía se renderiza la fila "sin resultados"; con search vacío no aparece', () => {
    const { rerender } = render(
      <DataTable
        columns={columnasServer()}
        data={[]}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: 'zzz',
          onSearchChange: vi.fn(),
        }}
      />,
    );
    expect(screen.getByText('No se encontraron resultados para tu búsqueda.')).toBeInTheDocument();

    rerender(
      <DataTable
        columns={columnasServer()}
        data={[]}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange: vi.fn(),
        }}
      />,
    );
    expect(
      screen.queryByText('No se encontraron resultados para tu búsqueda.'),
    ).not.toBeInTheDocument();
  });

  it('searchPlaceholder sigue sobrescribiendo el default en modo server-driven', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange: vi.fn(),
        }}
        searchPlaceholder="Buscar trabajador…"
      />,
    );
    expect(screen.getByPlaceholderText('Buscar trabajador…')).toBeInTheDocument();
  });

  it('retrocompatibilidad (Success Criterion 4): una tabla controlled SIN onSearchChange conserva el filtrado y orden client-side de hoy', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={filasServer}
        loading={false}
        pagination={{ mode: 'controlled', page: 1, pageCount: 1, onPageChange: vi.fn() }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar en la tabla' });
    fireEvent.change(input, { target: { value: 'ana' } });
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.queryByText('Beto')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Nombre' }));
    const nombres = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(nombres).toEqual(['Ana', 'Beto', 'Carla']);
  });

  it('input durante loading: con loading=true en modo server-driven, el input sigue habilitado y conserva su valor; el cuerpo muestra skeleton; el pie no se renderiza', () => {
    const { container } = render(
      <DataTable
        columns={columnasServer()}
        data={[]}
        loading={true}
        pagination={{
          mode: 'controlled',
          page: 2,
          pageCount: 5,
          onPageChange: vi.fn(),
          search: 'ana',
          onSearchChange: vi.fn(),
        }}
      />,
    );

    const input = screen.getByRole('searchbox', {
      name: 'Buscar en la tabla',
    }) as HTMLInputElement;
    expect(input).not.toBeDisabled();
    expect(input.value).toBe('ana');
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Página \d+ de \d+/)).not.toBeInTheDocument();
  });

  it('encabezados durante loading: con loading=true en modo server-driven, el botón de orden del encabezado sigue presente y habilitado', () => {
    render(
      <DataTable
        columns={columnasServer()}
        data={[]}
        loading={true}
        pagination={{
          mode: 'controlled',
          page: 1,
          pageCount: 1,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange: vi.fn(),
        }}
      />,
    );

    const boton = screen.getByRole('button', { name: 'Nombre' });
    expect(boton).toBeInTheDocument();
    expect(boton).not.toBeDisabled();
  });

  it('backstop resuelto — pie de paginación durante error de petición: con loading=false, data=[] y pageCount heredado (>1) de la última respuesta exitosa, el pie SÍ se renderiza', () => {
    // DataTable no tiene noción de "error": showFooter = !loading &&
    // totalPages > 1 consume loading/data/pageCount tal como el llamante los
    // pasa. React Query retiene el pageCount exitoso anterior mientras una
    // nueva petición falla, así que el pie queda visible con ese pageCount
    // heredado — comportamiento real fijado aquí, documentado en el SUMMARY.
    render(
      <DataTable
        columns={columnasServer()}
        data={[]}
        loading={false}
        pagination={{
          mode: 'controlled',
          page: 2,
          pageCount: 5,
          onPageChange: vi.fn(),
          search: '',
          onSearchChange: vi.fn(),
        }}
      />,
    );

    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument();
  });
});
