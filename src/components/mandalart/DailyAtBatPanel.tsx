'use client';

import { useMemo, useState } from 'react';
import { RefreshCw, Sparkles, Trophy, Zap } from 'lucide-react';
import type { MandalartBlockData } from '@/types/mandalart';
import { cn } from '@/utils/cn';

export interface DailyAtBatPanelProps {
  blocks: MandalartBlockData[];
  playerName: string;
  jerseyNumber: string;
  onToggleCellComplete: (blockIndex: number, cellIndex: number) => void;
  onUpdateCellText: (
    blockIndex: number,
    cellIndex: number,
    newValue: string
  ) => void;
  onSelectCell: (blockIndex: number, cellIndex: number) => void;
}

interface PitchTarget {
  blockIndex: number;
  cellIndex: number;
  pillarTitle: string;
  actionText: string;
  isEmpty: boolean;
}

const PITCH_TYPES = [
  '165 KM/H FOUR-SEAM',
  '144 KM/H SPLITTER',
  '136 KM/H SWEEPER',
  '152 KM/H CUTTER',
];

export const DailyAtBatPanel = ({
  blocks,
  playerName,
  jerseyNumber,
  onToggleCellComplete,
  onUpdateCellText,
  onSelectCell,
}: DailyAtBatPanelProps) => {
  const [pitchOffset, setPitchOffset] = useState<number>(0);
  const [quickDraftText, setQuickDraftText] = useState<string>('');
  const [lastSwingFeedback, setLastSwingFeedback] = useState<string>('');

  const stats = useMemo(() => {
    let filledCount = 0;
    let completedCount = 0;
    let homeRunCount = 0;
    const uncompletedPitches: PitchTarget[] = [];
    const emptySlots: PitchTarget[] = [];

    blocks.forEach((block, bIdx) => {
      if (bIdx === 4) return;
      const pillarTitle = block.cells[4]?.trim() || `기둥 0${bIdx > 4 ? bIdx : bIdx + 1}`;
      let blockCompleted = 0;

      block.cells.forEach((cellText, cIdx) => {
        if (cIdx === 4) return;
        const trimmed = cellText.trim();
        const isDone = Boolean(block.completedCells[cIdx]);
        if (trimmed.length > 0) {
          filledCount += 1;
        }
        if (isDone) {
          completedCount += 1;
          blockCompleted += 1;
        } else if (trimmed.length > 0) {
          uncompletedPitches.push({
            blockIndex: bIdx,
            cellIndex: cIdx,
            pillarTitle,
            actionText: trimmed,
            isEmpty: false,
          });
        } else {
          emptySlots.push({
            blockIndex: bIdx,
            cellIndex: cIdx,
            pillarTitle,
            actionText: '',
            isEmpty: true,
          });
        }
      });

      if (blockCompleted === 8) {
        homeRunCount += 1;
      }
    });

    const denominator = Math.max(1, filledCount);
    const rawAvg = completedCount / denominator;
    const battingAvg =
      rawAvg >= 1 ? '1.000' : `.${Math.round(rawAvg * 1000).toString().padStart(3, '0')}`;

    return {
      filledCount,
      completedCount,
      homeRunCount,
      battingAvg,
      uncompletedPitches,
      emptySlots,
    };
  }, [blocks]);

  // Prioritize uncompleted filled actions; if none left, offer empty slots so the user completes the 81-cell board one pitch at a time!
  const pitchPool =
    stats.uncompletedPitches.length > 0
      ? stats.uncompletedPitches
      : stats.emptySlots;

  const activePitch: PitchTarget | null =
    pitchPool.length > 0 ? pitchPool[pitchOffset % pitchPool.length] : null;

  const pitchLabel =
    PITCH_TYPES[(activePitch?.blockIndex ?? 0) % PITCH_TYPES.length];

  const handleSwingAndHit = () => {
    if (!activePitch) return;

    if (activePitch.isEmpty) {
      const trimmed = quickDraftText.trim();
      if (!trimmed) return;
      onUpdateCellText(activePitch.blockIndex, activePitch.cellIndex, trimmed);
      onToggleCellComplete(activePitch.blockIndex, activePitch.cellIndex);
      onSelectCell(activePitch.blockIndex, activePitch.cellIndex);
      setQuickDraftText('');
      setLastSwingFeedback(`HIT! "${trimmed}" 등록 & 1안타 기록`);
    } else {
      onToggleCellComplete(activePitch.blockIndex, activePitch.cellIndex);
      onSelectCell(activePitch.blockIndex, activePitch.cellIndex);
      setLastSwingFeedback(`CLEAN HIT! "${activePitch.actionText}" 달성 완료`);
    }
    setPitchOffset((prev) => prev + 1);
  };

  const displayJersey = jerseyNumber.trim() || '17';
  const displayName = (playerName.trim() || 'ROOKIE').toUpperCase();

  return (
    <div className="border border-[#f4b942]/40 bg-zinc-950 p-5 sm:p-6">
      {/* Top Season Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="font-mono-tech inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] text-[#f4b942] uppercase">
            <Zap className="h-3.5 w-3.5" /> TODAY&apos;S AT-BAT // 오늘의 1구 시스템
          </span>
          <h3 className="mt-1 text-lg font-black tracking-tight text-[#f4f1ea] sm:text-xl">
            81칸을 한 번에 보지 마세요. 매일 1구씩 맞히다 보면 만다라트가 완성됩니다.
          </h3>
        </div>

        {/* Live Baseball Season Stats */}
        <div className="grid grid-cols-3 gap-px border border-white/15 bg-white/15 text-center">
          <div className="bg-[#0b0c0e] px-3.5 py-2">
            <span className="font-mono-tech block text-[9px] text-zinc-500 uppercase">
              AVG (타율)
            </span>
            <span className="font-display text-xl tracking-tight text-[#f4b942]">
              {stats.battingAvg}
            </span>
          </div>
          <div className="bg-[#0b0c0e] px-3.5 py-2">
            <span className="font-mono-tech block text-[9px] text-zinc-500 uppercase">
              HITS (달성)
            </span>
            <span className="font-display text-xl tracking-tight text-[#f4f1ea]">
              {stats.completedCount}
              <span className="font-mono-tech text-[10px] text-zinc-500">/64</span>
            </span>
          </div>
          <div className="bg-[#0b0c0e] px-3.5 py-2">
            <span className="font-mono-tech block text-[9px] text-zinc-500 uppercase">
              HR (블록완성)
            </span>
            <span className="font-display text-xl tracking-tight text-[#f4b942]">
              {stats.homeRunCount}
              <span className="font-mono-tech text-[10px] text-zinc-500">/8</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active At-Bat Pitch Card */}
      {activePitch ? (
        <div className="mt-5 grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
          <div className="border border-white/15 bg-[#0b0c0e] p-4 sm:p-5 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono-tech bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#f4b942] uppercase">
                #{displayJersey} {displayName} · {pitchLabel}
              </span>
              <span className="font-mono-tech text-[10px] text-zinc-500 uppercase">
                PILLAR: {activePitch.pillarTitle} (BLOCK #{activePitch.blockIndex + 1})
              </span>
            </div>

            {activePitch.isEmpty ? (
              <div className="mt-3">
                <p className="text-xs font-bold text-zinc-400">
                  아직 비어 있는 타석입니다. 오늘 바로 실행할 행동 1개만 적고 스윙하세요!
                </p>
                <input
                  type="text"
                  value={quickDraftText}
                  onChange={(e) => setQuickDraftText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSwingAndHit();
                    }
                  }}
                  placeholder={`‘${activePitch.pillarTitle}’ 기둥의 새 루틴 1개 입력 (예: 15분 스트레칭)`}
                  className="mt-2.5 w-full border border-white/20 bg-zinc-950 px-3.5 py-2.5 text-sm font-bold text-[#f4f1ea] placeholder-zinc-600 focus:border-[#f4b942] focus:outline-none"
                />
              </div>
            ) : (
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono-tech text-[10px] font-bold text-zinc-500 uppercase">
                    INCOMING PITCH // 오늘의 1구
                  </p>
                  <p className="mt-1 text-xl font-black tracking-tight text-[#f4f1ea] sm:text-2xl">
                    “{activePitch.actionText}”
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSelectCell(activePitch.blockIndex, activePitch.cellIndex)
                  }
                  className="font-mono-tech shrink-0 border border-white/15 px-2.5 py-1.5 text-[10px] text-zinc-400 hover:border-white/40 hover:text-white"
                >
                  칸 위치 보기 ↗
                </button>
              </div>
            )}
          </div>

          {/* Swing & Shuffle Controls */}
          <div className="flex flex-col gap-2 lg:col-span-4">
            <button
              type="button"
              onClick={handleSwingAndHit}
              disabled={activePitch.isEmpty && !quickDraftText.trim()}
              className={cn(
                'font-mono-tech flex w-full items-center justify-center gap-2 px-5 py-3.5 text-xs font-extrabold tracking-widest uppercase transition',
                activePitch.isEmpty && !quickDraftText.trim()
                  ? 'cursor-not-allowed border border-white/10 bg-zinc-900 text-zinc-600'
                  : 'bg-[#f4b942] text-[#0b0c0e] hover:bg-[#f4f1ea]'
              )}
            >
              <Sparkles className="h-4 w-4" />
              {activePitch.isEmpty
                ? '루틴 등록 & 안타 치기 →'
                : 'SWING & HIT! (달성 완료) →'}
            </button>

            <button
              type="button"
              onClick={() => setPitchOffset((prev) => prev + 1)}
              className="font-mono-tech flex w-full items-center justify-center gap-1.5 border border-white/15 bg-[#0b0c0e] px-4 py-2.5 text-[11px] font-bold tracking-wider text-zinc-300 uppercase transition hover:border-white/40 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" /> 다른 공 보기 (NEXT PITCH)
            </button>

            {lastSwingFeedback ? (
              <p className="font-mono-tech text-center text-[10px] font-bold text-[#f4b942]">
                ✓ {lastSwingFeedback}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border border-[#f4b942]/50 bg-[#241e10] p-5">
          <div className="flex items-center gap-3">
            <Trophy className="h-7 w-7 text-[#f4b942]" />
            <div>
              <p className="font-mono-tech text-xs font-extrabold text-[#f4b942] uppercase">
                PERFECT GAME // 64/64 ACTIONS COMPLETED
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#f4f1ea]">
                축하합니다! 8개 블록 홈런을 모두 달성해 81칸 만다라트를 완벽히 정복했습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
