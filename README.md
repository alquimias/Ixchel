# Sistema de diseño

Paquete `@erp/ui` del ERP Alquimias: primitivos, tokens y shells compartidos.
Licencia MIT. Este repositorio es el submódulo `packages/ui` de [alquimias/erp](https://github.com/alquimias/erp). Se instala y se empaqueta solo, sin el workspace del monorepo.

En npmjs y GitHub Packages se publica como **`@alquimias/erp-ui`** (GitHub Packages exige el scope de la organización). El manifiesto de este repo sigue siendo `@erp/ui` para el workspace del ERP.

## Desarrollo

Dentro del monorepo:

```bash
git clone --recurse-submodules git@github.com:alquimias/erp.git
cd erp
pnpm install
pnpm --filter @erp/ui storybook
```

Storybook escucha en el puerto 6006. `pnpm --filter @erp/ui test` corre las pruebas unitarias.

En un clon de este repositorio:

```bash
git clone git@github.com:alquimias/erp-ui.git
cd erp-ui
pnpm install
pnpm test
pnpm build
```

## Pipelines

Los workflows viven en este repositorio.

| Workflow | Cuándo corre | Qué produce |
| --- | --- | --- |
| CI | push y pull request a `main` | lint, pruebas unitarias y typecheck |
| Package | push a `main`, tag `v*` o ejecución manual | tarball; publicación pública en npmjs.org (`NPM_TOKEN`) y GitHub Packages |

Un push a `main` publica `0.0.1-sha<12>`. Un tag `v*` publica esa versión, deja el tarball como artefacto y abre un GitHub Release. `pnpm test:storybook` sigue siendo local: necesita Playwright.

```bash
pnpm add @alquimias/erp-ui
# o, desde git (el nombre del paquete en el repo es @erp/ui):
pnpm add github:alquimias/erp-ui
```
