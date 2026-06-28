import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackButton({
  href,
  label = "Back",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink-deep"
    >
      <ArrowLeft size={16} /> {label}
    </Link>
  );
}
