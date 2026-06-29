import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import logo from '@/app/assets/logo/logo-1000x1000.png';

export function PublicHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-surface-canvas-dark fixed w-full">
      <Link
        href="/"
        className="flex items-center gap-2 p-2 bg-surface-canvas-light rounded-xl"
      >
        <Image
          src={logo}
          alt="Purrmanent"
          width={32}
          height={32}
          className="rounded-md"
        />
        <span className="font-display text-xl font-bold">Purrmanent</span>
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link
          href="/about"
          className="hidden text-on-dark-muted hover:text-on-primary sm:inline"
        >
          About
        </Link>
        <Link
          href="/login"
          className="text-on-dark-muted hover:text-on-primary"
        >
          Sign in
        </Link>
        <Button asChild variant="inverted" size="sm">
          <Link href="/register">Get started</Link>
        </Button>
      </nav>
    </header>
  );
}
