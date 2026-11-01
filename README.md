# Ixchel

Librería de componentes React independiente: primitivos, tokens y shells.
Licencia MIT.

```bash
pnpm add @alquimias/ixchel
```

```tsx
import { Button, FormShell } from '@alquimias/ixchel';
```

```css
@import 'tailwindcss';
@import '@alquimias/ixchel/styles.css';
```

React 19 es `peerDependency`. Si Tailwind no ve las clases, agregá `@source` apuntando a `node_modules/@alquimias/ixchel/src`. `Button` y `EmptyState` aceptan `to`; sin `UiLinkProvider` renderizan un `<a>`.

## Colores

La paleta pública son cinco variables CSS. BYTE es el default; el resto del tema (`primary`, `muted`, bordes, charts) se deriva de ellas.

```css
@import 'tailwindcss';
@import '@alquimias/ixchel/styles.css';

:root {
  --color-brand-black: #0f172a;
  --color-brand-lavender: #94a3b8;
  --color-brand-soft: #2563eb;
  --color-brand-peri: #60a5fa;
  --color-brand-ghost: #f8fafc;
}
```

En runtime, el mismo override con `ColorThemeProvider` (aplica en `document.documentElement` para que Dialog/Select hereden el tema; `scoped` lo limita a un wrapper):

```tsx
import { ColorThemeProvider } from '@alquimias/ixchel';

<ColorThemeProvider
  colors={{
    black: '#0f172a',
    lavender: '#94a3b8',
    soft: '#2563eb',
    peri: '#60a5fa',
    ghost: '#f8fafc',
  }}
>
  <App />
</ColorThemeProvider>
```

El manifiesto de este repo se llama `@erp/ui` para el workspace de [alquimias/erp](https://github.com/alquimias/erp), que la consume como submódulo `packages/ui`. En npmjs y GitHub Packages se publica como **`@alquimias/ixchel`**.

También se puede instalar desde git:

```bash
pnpm add github:alquimias/erp-ui
```

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

Dentro del monorepo del ERP:

```bash
git clone --recurse-submodules git@github.com:alquimias/erp.git
cd erp
pnpm install
pnpm --filter @erp/ui storybook
```

## Pipelines

Los workflows viven en este repositorio.

| Workflow | Cuándo corre | Qué produce |
| --- | --- | --- |
| CI | push y pull request a `main` | lint, pruebas unitarias y typecheck |
| Package | push a `main`, tag `v*` o ejecución manual | tarball; publicación pública en npmjs.org (`NPM_TOKEN`) y GitHub Packages |

Un push a `main` publica `0.0.1-sha<12>`. Un tag `v*` publica esa versión, deja el tarball como artefacto y abre un GitHub Release. `pnpm test:storybook` sigue siendo local: necesita Playwright.
