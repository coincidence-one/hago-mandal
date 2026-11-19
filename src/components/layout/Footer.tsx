import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0b0c0e] py-12 px-4 sm:px-8 text-zinc-400">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono-tech bg-[#f4b942] px-2 py-0.5 text-xs font-extrabold text-[#0b0c0e]">
              17
            </span>
            <span className="text-base font-black tracking-tight text-[#f4f1ea]">
              하고만달 (HAGO-MANDAL)
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            오타니 쇼헤이의 투타겸업 정신과 81칸 만다라트 설계도를 모티브로 제작된 인터랙티브 목표 달성 웹 애플리케이션입니다.
          </p>
        </div>

        <div className="font-mono-tech flex flex-wrap gap-6 text-xs font-semibold text-zinc-400 uppercase">
          <Link href="/#ohtani-story" className="hover:text-[#f4b942]">
            01. Sequence
          </Link>
          <Link href="/#mandalart-explainer" className="hover:text-[#f4b942]">
            02. Method
          </Link>
          <Link href="/#mandalart-planner" className="hover:text-[#f4b942]">
            03. 9×9 Studio
          </Link>
          <Link href="/profiles" className="hover:text-[#f4b942]">
            04. Archive
          </Link>
        </div>
      </div>
    </footer>
  );
};
