export function Footer() {
  return (
    <footer className="mt-auto bg-surface-canvas-light">
      {/* DESIGN.md signature: lime squiggly divider above the footer */}
      <svg
        aria-hidden
        viewBox="0 0 1200 12"
        preserveAspectRatio="none"
        className="h-3 w-full text-accent-lime"
      >
        <path
          d="M0 6 Q 30 0 60 6 T 120 6 T 180 6 T 240 6 T 300 6 T 360 6 T 420 6 T 480 6 T 540 6 T 600 6 T 660 6 T 720 6 T 780 6 T 840 6 T 900 6 T 960 6 T 1020 6 T 1080 6 T 1140 6 T 1200 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-8 text-sm text-ink-deep">
        <p className="font-display text-lg font-bold">Purrmanent</p>
        <p className="text-on-dark-muted">
          90 days to a happy, settled cat. 🐾
        </p>
        <p className="mt-4 text-xs text-on-dark-muted">
          © {new Date().getFullYear()} Purrmanent.
        </p>
      </div>
    </footer>
  );
}
