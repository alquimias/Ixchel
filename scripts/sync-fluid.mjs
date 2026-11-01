#!/usr/bin/env node
/**
 * Vendorea Fluid Functionalism (sabor Base UI) desde el registry publicado.
 * Uso: node scripts/sync-fluid.mjs
 *
 * Reescribe imports `@/` a rutas relativas para que el paquete se consuma
 * en fuente sin que el consumidor declare esos alias.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const REGISTRY_URL = 'https://www.fluidfunctionalism.com/r/registry.json';
const ITEM_URL = (name) =>
  `https://www.fluidfunctionalism.com/r/${name}.json`;

const SKIP_NAMES = new Set([
  'icons-tabler',
  'icons-phosphor',
  'icons-hugeicons',
  'icons-untitledui',
]);

const CONCURRENCY = 8;

const STOCK_THEME_INLINE = `\
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-sans);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);`;

const STOCK_ROOT = `\
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);`;

const STOCK_DARK = `\
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);`;

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
  }
  return res.json();
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function selectItems(items) {
  const names = new Set(items.map((item) => item.name));
  const baseBare = new Set(
    [...names].filter((name) => name.startsWith('base/')).map((name) => name.slice(5)),
  );
  return items.filter((item) => {
    if (SKIP_NAMES.has(item.name) || item.name.startsWith('icons-')) return false;
    if (item.name.startsWith('base/')) return true;
    if (baseBare.has(item.name)) return false;
    return true;
  });
}

function destFor(file) {
  if (file.target) {
    if (file.target.startsWith('app/')) return null;
    return path.join(SRC, file.target);
  }

  const registryPath = file.path.replaceAll('\\', '/');
  const libOrHook = registryPath.match(
    /^registry\/(?:default|base|radix)\/(lib|hooks)\/(.+)$/,
  );
  if (libOrHook) return path.join(SRC, libOrHook[1], libOrHook[2]);

  const block = registryPath.match(/^registry\/blocks\/(.+)$/);
  if (block) return path.join(SRC, 'components', block[1]);

  const ui = registryPath.match(/^registry\/(?:default|base|radix)\/(.+)$/);
  if (ui) return path.join(SRC, 'components/ui', ui[1]);

  return path.join(SRC, 'components/ui', path.basename(registryPath));
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function resolveAliasSpec(spec) {
  const clean = spec.replace(/\.(tsx|ts|jsx|js)$/, '');
  if (
    clean.startsWith('lib/') ||
    clean.startsWith('hooks/') ||
    clean.startsWith('components/')
  ) {
    return path.join(SRC, clean);
  }
  const registryLib = clean.match(
    /^registry\/(?:default|base|radix)\/(lib|hooks)\/(.+)$/,
  );
  if (registryLib) return path.join(SRC, registryLib[1], registryLib[2]);
  const registryUi = clean.match(/^registry\/(?:default|base|radix)\/(.+)$/);
  if (registryUi) return path.join(SRC, 'components/ui', registryUi[1]);
  const blocks = clean.match(/^registry\/blocks\/(.+)$/);
  if (blocks) return path.join(SRC, 'components', blocks[1]);
  return null;
}

function relativeFrom(fromAbs, targetAbs) {
  let rel = toPosix(path.relative(path.dirname(fromAbs), targetAbs));
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function rewriteImports(content, fromAbs) {
  const withAliases = content.replace(
    /(['"])@\/([^'"]+)\1/g,
    (match, quote, spec) => {
      const targetAbs = resolveAliasSpec(spec);
      if (!targetAbs) return match;
      return `${quote}${relativeFrom(fromAbs, targetAbs)}${quote}`;
    },
  );
  return withAliases.replace(
    /(['"])next\/link\1/g,
    (_match, quote) =>
      `${quote}${relativeFrom(fromAbs, path.join(SRC, 'lib/next-link'))}${quote}`,
  );
}

const NEXT_LINK_SHIM = `"use client";

import { forwardRef, type AnchorHTMLAttributes } from "react";

/** Shim so vendored FF files that import next/link work outside Next.js. */
const Link = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function Link({ href, ...props }, ref) {
  return <a ref={ref} href={href} {...props} />;
});

export default Link;
`;

function cssVarName(key) {
  return key.startsWith('--') ? key : `--${key}`;
}

function varsToCss(vars, indent = '  ') {
  return Object.entries(vars)
    .map(([key, value]) => `${indent}${cssVarName(key)}: ${value};`)
    .join('\n');
}

function cssObjectToString(node, indent = 0) {
  const pad = '  '.repeat(indent);
  let out = '';
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out += `${pad}${key} {\n${cssObjectToString(value, indent + 1)}${pad}}\n`;
    } else {
      out += `${pad}${key}: ${value};\n`;
    }
  }
  return out;
}

function mergeVars(target, extra) {
  if (!extra) return;
  Object.assign(target, extra);
}

function buildThemeCss(themeVars, lightVars, darkVars, extraCssBlocks) {
  const themeLines = [
    STOCK_THEME_INLINE,
    varsToCss(themeVars, '  '),
  ]
    .filter(Boolean)
    .join('\n');

  const extras = extraCssBlocks.filter(Boolean).join('\n\n');

  return `/* Generated by scripts/sync-fluid.mjs — do not edit by hand. */
@import "tailwindcss";
@import "shadcn/tailwind.css";

@source "../";

@custom-variant dark (&:is(.dark *));

@theme inline {
${themeLines}
}

:root {
${STOCK_ROOT}
${varsToCss(lightVars, '  ')}
}

.dark {
${STOCK_DARK}
${varsToCss(darkVars, '  ')}
}

${extras}
`;
}

async function collectFiles(dir, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') return acc;
    throw error;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await collectFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

async function prune(keepAbs) {
  const keep = new Set(keepAbs.map((file) => path.resolve(file)));
  const roots = [
    path.join(SRC, 'components'),
    path.join(SRC, 'lib'),
    path.join(SRC, 'hooks'),
    path.join(SRC, 'styles'),
  ];
  const existing = [];
  for (const root of roots) {
    await collectFiles(root, existing);
  }
  const protectedNames = new Set(['storybook.css']);
  for (const file of existing) {
    if (keep.has(path.resolve(file))) continue;
    if (protectedNames.has(path.basename(file))) continue;
    await rm(file, { force: true });
  }
}

async function patchVendored() {
  const tooltipPath = path.join(SRC, 'components/ui/tooltip.tsx');
  let tooltip = await readFile(tooltipPath, 'utf8');
  if (!tooltip.includes('disableHoverableContent')) {
    tooltip = tooltip.replace(
      'skipDelayDuration?: number;',
      'skipDelayDuration?: number;\n  /** Accepted for Radix tooltip parity (color-picker). Ignored. */\n  disableHoverableContent?: boolean;',
    );
    await writeFile(tooltipPath, tooltip);
  }

  const corePath = path.join(SRC, 'components/ui/date-picker-core.tsx');
  let core = await readFile(corePath, 'utf8');
  if (core.includes('.resolvedOptions().hourCycle')) {
    core = core.replace(
      'const cycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;',
      `const cycle = (
    new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions() as {
      hourCycle?: string;
    }
  ).hourCycle;`,
    );
    await writeFile(corePath, core);
  }
}

async function main() {
  console.log(`Fetching ${REGISTRY_URL}`);
  const registry = await fetchJson(REGISTRY_URL);
  const selected = selectItems(registry.items ?? []);
  console.log(`Selected ${selected.length} items (Base UI flavor)`);

  const detailed = await mapPool(selected, CONCURRENCY, async (item) => {
    const url = ITEM_URL(item.name);
    try {
      const json = await fetchJson(url);
      return { meta: item, json, url };
    } catch (error) {
      console.warn(`skip ${item.name}: ${error.message}`);
      return { meta: item, json: null, url, error: String(error.message) };
    }
  });

  const themeVars = {};
  const lightVars = {};
  const darkVars = {};
  const extraCss = [];
  const dependencies = new Set();
  const written = [];
  const lockItems = [];

  const nextLinkPath = path.join(SRC, 'lib/next-link.tsx');
  await mkdir(path.dirname(nextLinkPath), { recursive: true });
  await writeFile(nextLinkPath, NEXT_LINK_SHIM);
  written.push(nextLinkPath);

  for (const entry of detailed) {
    const item = entry.json ?? entry.meta;
    if (!item) continue;

    for (const dep of item.dependencies ?? []) dependencies.add(dep);

    mergeVars(themeVars, item.cssVars?.theme);
    mergeVars(lightVars, item.cssVars?.light);
    mergeVars(darkVars, item.cssVars?.dark);
    if (item.css && Object.keys(item.css).length > 0) {
      extraCss.push(`/* ${item.name} */\n${cssObjectToString(item.css).trimEnd()}`);
    }

    const files = [];
    for (const file of item.files ?? []) {
      if (!file.content) continue;
      const dest = destFor(file);
      if (!dest) continue;
      const rewritten = rewriteImports(file.content, dest);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, rewritten.endsWith('\n') ? rewritten : `${rewritten}\n`);
      const rel = toPosix(path.relative(ROOT, dest));
      files.push(rel);
      written.push(dest);
    }

    lockItems.push({
      name: item.name,
      url: entry.url,
      files,
      sha256: sha256(
        (item.files ?? []).map((file) => file.content ?? '').join('\n'),
      ),
    });
  }

  const themePath = path.join(SRC, 'styles/theme.css');
  const themeCss = buildThemeCss(themeVars, lightVars, darkVars, extraCss);
  await mkdir(path.dirname(themePath), { recursive: true });
  await writeFile(themePath, themeCss);
  written.push(themePath);

  const lockPath = path.join(SRC, 'fluid.lock.json');
  const lock = {
    source: REGISTRY_URL,
    flavor: 'base',
    syncedAt: new Date().toISOString(),
    homepage: registry.homepage ?? 'https://www.fluidfunctionalism.com',
    items: lockItems,
    dependencies: [...dependencies].sort(),
  };
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  written.push(lockPath);

  await prune(written);
  await patchVendored();

  console.log(`Wrote ${written.length} files`);
  console.log(`Dependencies: ${lock.dependencies.join(', ') || '(none)'}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
