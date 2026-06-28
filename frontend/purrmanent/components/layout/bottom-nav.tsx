"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/crisis", label: "Crisis", icon: AlertTriangle },
  { href: "/progress", label: "Progress", icon: Trophy },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hairline-cloud bg-surface-canvas-light sm:hidden"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs",
              active ? "text-accent-violet" : "text-muted",
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
