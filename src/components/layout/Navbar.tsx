import Link from 'next/link';

export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-[#0b0c0e]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="font-mono-tech flex h-8 w-8 items-center justify-center border border-[#f4b942] bg-[#f4b942] text-xs font-extrabold text-[#0b0c0e] transition-transform group-hover:scale-105">
              17
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black tracking-tight text-[#f4f1ea]">
                하고만달
              </span>
              <span className="font-mono-tech hidden text-[10px] tracking-[0.22em] text-zinc-500 uppercase sm:inline">
                HAGO-MANDAL
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <Link
              href="/#ohtani-story"
              className="font-mono-tech text-xs tracking-wider text-zinc-400 uppercase transition hover:text-[#f4f1ea]"
            >
              01. Sequence
            </Link>
            <Link
              href="/#mandalart-explainer"
              className="font-mono-tech text-xs tracking-wider text-zinc-400 uppercase transition hover:text-[#f4f1ea]"
            >
              02. Method
            </Link>
            <Link
              href="/#mandalart-planner"
              className="font-mono-tech text-xs tracking-wider text-zinc-400 uppercase transition hover:text-[#f4f1ea]"
            >
              03. 9×9 Studio
            </Link>
            <Link
              href="/profiles"
              className="font-mono-tech text-xs tracking-wider text-zinc-400 uppercase transition hover:text-[#f4f1ea]"
            >
              04. Archive
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profiles"
            className="font-mono-tech hidden border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-white/40 hover:text-white sm:inline-flex"
          >
            MY ARCHIVE
          </Link>
          <Link
            href="/#mandalart-planner"
            className="font-mono-tech bg-[#f4f1ea] px-3.5 py-1.5 text-xs font-extrabold tracking-wide text-[#0b0c0e] transition hover:bg-[#f4b942]"
          >
            BUILD MANDAL →
          </Link>
        </div>
      </nav>
    </header>
  );
};
