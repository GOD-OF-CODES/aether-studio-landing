"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { irisClose, irisOpen } from "@/lib/iris";

/** A link that travels through the iris instead of cutting to the next page. */
export default function IrisLink({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode; "aria-label"?: string }) {
  const router = useRouter();
  return (
    <a
      href={href}
      className={className}
      {...rest}
      onMouseEnter={() => router.prefetch(href)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX || r.left + r.width / 2;
        const y = e.clientY || r.top + r.height / 2;
        irisClose(x, y, () => router.push(href));
      }}
    >
      {children}
    </a>
  );
}

/** Mounted once in the layout: opens the iris whenever a new page has arrived. */
export function IrisArrival() {
  const path = usePathname();
  useEffect(() => {
    const id = requestAnimationFrame(() => irisOpen());
    return () => cancelAnimationFrame(id);
  }, [path]);
  return null;
}
