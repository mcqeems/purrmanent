"use client";

import Link from "next/link";
import { useGamificationStatus } from "./hooks";

export function PointsPill() {
  const { data } = useGamificationStatus();
  return (
    <Link
      href="/progress"
      className="inline-flex items-center gap-1 rounded-full bg-surface-night px-3 py-1 text-sm font-semibold text-on-primary"
      title="Your points"
    >
      <span aria-hidden>★</span>
      {data?.points ?? 0}
    </Link>
  );
}
