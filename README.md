# Sistema de diseño

Paquete `@erp/ui` del ERP Alquimias: primitivos, tokens y shells compartidos.

Este repositorio es el submódulo `packages/ui` de [alquimias/erp](https://github.com/alquimias/erp). Se instala y se empaqueta solo, sin el workspace del monorepo.

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
| Package | push a `main`, tag `v*` o ejecución manual | tarball `.tgz` de `@erp/ui` |

En `main` el tarball queda como artefacto del workflow. Un tag `v*` abre además un GitHub Release con ese archivo. El paquete sigue `private` y no se publica en un registry npm. `pnpm test:storybook` sigue siendo local: necesita Playwright.
