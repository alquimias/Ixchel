# Ixchel

Librería de componentes React basada en [Fluid Functionalism](https://www.fluidfunctionalism.com) (sabor Base UI).
Licencia MIT.

```bash
pnpm add @alquimias/ixchel
```

```tsx
import { Button, FluidProvider } from '@alquimias/ixchel';
```

```css
@import 'tailwindcss';
@import '@alquimias/ixchel/styles.css';
```

React 19 es `peerDependency`. Envuelve la app en `FluidProvider` para reduced motion del SO, radio (rounded/pill), tamaño (default/compact) e iconos.

```tsx
import { FluidProvider } from '@alquimias/ixchel';

<FluidProvider shape="rounded" size="default">
  <App />
</FluidProvider>
```

Carga Inter con el eje `opsz` si querés que el peso de las etiquetas no mueva el layout.

El manifiesto de este repo se llama `@erp/ui` para el workspace de [alquimias/erp](https://github.com/alquimias/erp). En npmjs y GitHub Packages se publica como **`@alquimias/ixchel`**.

## Catálogo

Primitivos y sistemas de Fluid Functionalism: accordion, badge, banner, button, calendar, card, carousel-dots, chat-message, checkbox-group, color-picker, combobox, command-menu, date-picker, dialog, dropdown, file-thumbnail, input-copy, input-group, input-message, mobile-drawer, radio-group, scroll-area, select, sidebar, slider, switch, table, tabs, thinking-indicator, thinking-steps, tooltip, y los bloques `AppSidebar`, `SettingsDialog` y `QueuedStack`.

También se reexportan `FluidProvider`, `spring`, `useFluidHover`, `ShapeProvider`, `SizeProvider` e `IconProvider`.

## Desarrollo

```bash
git clone https://github.com/alquimias/erp-ui.git
cd erp-ui
pnpm install
pnpm storybook
pnpm test
pnpm build
```

Storybook escucha en el puerto 6006.

Para volver a vendor el registry de Fluid Functionalism (Base UI):

```bash
pnpm sync:fluid
```

Eso reescribe `src/components`, `src/lib`, `src/hooks` y `src/styles/theme.css` desde `https://www.fluidfunctionalism.com/r`. Los imports `@/` quedan en rutas relativas para que el paquete se consuma en fuente.

## Pipelines

| Workflow | Cuándo corre | Qué produce |
| --- | --- | --- |
| CI | push a `main` o `feat/v1-fluid`, y pull request a `main` | lint, pruebas unitarias y typecheck |
| Package | push a `main`, tag `v*` o ejecución manual | tarball; publicación pública en npmjs.org (`NPM_TOKEN`) y GitHub Packages |

Un push a `main` publica `0.0.1-sha<12>`. Un tag `v*` publica esa versión. `pnpm test:storybook` sigue siendo local: necesita Playwright.
