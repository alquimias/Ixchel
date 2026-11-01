"use client";

import { forwardRef, type AnchorHTMLAttributes } from "react";

/** Shim so vendored FF files that import next/link work outside Next.js. */
const Link = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function Link({ href, ...props }, ref) {
  return <a ref={ref} href={href} {...props} />;
});

export default Link;
