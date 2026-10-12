# Sistema de diseño

Paquete `@erp/ui` del ERP Alquimias: primitivos, tokens y shells compartidos.

Este repositorio es el submódulo `packages/ui` de [alquimias/erp](https://github.com/alquimias/erp). El build usa el contexto del monorepo y depende de `@erp/eslint-config` y `@erp/tsconfig` con `workspace:*`.

## Desarrollo

```bash
git clone --recurse-submodules git@github.com:alquimias/erp.git
cd erp
pnpm install
pnpm --filter @erp/ui storybook
```

Storybook escucha en el puerto 6006. `pnpm --filter @erp/ui test` corre las pruebas unitarias.
