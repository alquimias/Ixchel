import {
  createContext,
  forwardRef,
  useContext,
  type AnchorHTMLAttributes,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from 'react';

export type UiLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
};

export type UiLinkComponent = ForwardRefExoticComponent<
  UiLinkProps & RefAttributes<HTMLAnchorElement>
>;

const DefaultUiLink = forwardRef<HTMLAnchorElement, UiLinkProps>(function DefaultUiLink(
  { to, ...props },
  ref,
) {
  return <a ref={ref} href={to} {...props} />;
});

const UiLinkContext = createContext<UiLinkComponent>(DefaultUiLink);

export function UiLinkProvider({
  component,
  children,
}: {
  component: UiLinkComponent;
  children: ReactNode;
}) {
  return <UiLinkContext.Provider value={component}>{children}</UiLinkContext.Provider>;
}

export function useUiLink(): UiLinkComponent {
  return useContext(UiLinkContext);
}

export const UiLink = forwardRef<HTMLAnchorElement, UiLinkProps>(function UiLink(props, ref) {
  const Component = useUiLink();
  // El provider guarda un componente estable (el Link del router, o un <a>).
  // El linter no puede ver que no se crea uno nuevo en cada render.
  // eslint-disable-next-line react-hooks/static-components
  return <Component ref={ref} {...props} />;
});
