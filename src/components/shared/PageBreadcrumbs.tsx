import { Fragment, useState } from 'react';
import { UiLink } from '../../link';
import { StaggerReveal } from './StaggerReveal';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

export interface BreadcrumbTrailItem {
  label: string;
  to?: string;
}

export function breadcrumbItemsMatch(a: BreadcrumbTrailItem, b: BreadcrumbTrailItem): boolean {
  return a.label === b.label && (a.to ?? '') === (b.to ?? '');
}

export function breadcrumbTrailsEqual(a: BreadcrumbTrailItem[], b: BreadcrumbTrailItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => breadcrumbItemsMatch(item, b[index]));
}

type BreadcrumbTrailSnapshot = {
  items: BreadcrumbTrailItem[];
  firstChangedIndex: number;
};

function createInitialTrailSnapshot(items: BreadcrumbTrailItem[]): BreadcrumbTrailSnapshot {
  return {
    items,
    firstChangedIndex: items.length,
  };
}

/** Índice del primer segmento que difiere respecto al trail anterior. */
export function getFirstChangedBreadcrumbIndex(
  prev: BreadcrumbTrailItem[] | null,
  next: BreadcrumbTrailItem[],
): number {
  if (!prev) return next.length;

  let index = 0;
  while (index < prev.length && index < next.length) {
    if (breadcrumbItemsMatch(prev[index], next[index])) {
      index++;
    } else {
      break;
    }
  }

  return index;
}

export function PageBreadcrumbs({ items }: { items: BreadcrumbTrailItem[] }) {
  const [snapshot, setSnapshot] = useState<BreadcrumbTrailSnapshot>(() =>
    createInitialTrailSnapshot(items),
  );

  let firstChangedIndex = snapshot.firstChangedIndex;
  if (!breadcrumbTrailsEqual(snapshot.items, items)) {
    firstChangedIndex = getFirstChangedBreadcrumbIndex(snapshot.items, items);
    setSnapshot({ items, firstChangedIndex });
  }

  const lastIndex = items.length - 1;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          const shouldAnimate = index >= firstChangedIndex;
          const crumb = isLast ? (
            <BreadcrumbPage>{item.label}</BreadcrumbPage>
          ) : item.to ? (
            <BreadcrumbLink asChild>
              <UiLink to={item.to}>{item.label}</UiLink>
            </BreadcrumbLink>
          ) : (
            <span className="text-muted-foreground">{item.label}</span>
          );

          const crumbContent = shouldAnimate ? (
            <StaggerReveal key={`${item.label}:${item.to ?? ''}`}>
              <StaggerReveal.Line as="span" line={index - firstChangedIndex + 1} inline>
                {crumb}
              </StaggerReveal.Line>
            </StaggerReveal>
          ) : (
            crumb
          );

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>{crumbContent}</BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
