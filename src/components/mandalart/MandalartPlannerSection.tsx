'use client';

import { useEffect, useState } from 'react';
import type { PlayerDraftPayload } from '@/app/page';
import { DailyAtBatPanel } from './DailyAtBatPanel';
import { ScoutingReportPanel } from './ScoutingReportPanel';
import {
  buildMandalartBlocksFromTemplate,
  MANDALART_TEMPLATES,
} from '@/data/ohtaniMandalartData';
import type { MandalartBlockData } from '@/types/mandalart';
import { cn } from '@/utils/cn';

export const HAGO_MANDAL_STORAGE_KEY = 'hago_mandal_saved_blocks_v1';

interface SelectedCellCoord {
  blockIndex: number;
  cellIndex: number;
}

export interface MandalartPlannerSectionProps {
  playerDraft?: PlayerDraftPayload;
}

export const MandalartPlannerSection = ({
  playerDraft,
}: MandalartPlannerSectionProps) => {
  const [activeTemplateId, setActiveTemplateId] =
    useState<string>('ohtani-highschool');
  const [blocks, setBlocks] = useState<MandalartBlockData[]>(() =>
    buildMandalartBlocksFromTemplate(MANDALART_TEMPLATES[0])
  );
  const [playerName, setPlayerName] = useState<string>('');
  const [jerseyNumber, setJerseyNumber] = useState<string>('17');
  const [selectedCell, setSelectedCell] = useState<SelectedCellCoord>({
    blockIndex: 4,
    cellIndex: 4,
  });
  const [viewMode, setViewMode] = useState<'full-81' | 'focus-block'>('full-81');
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number>(4);
  const [saveToastMessage, setSaveToastMessage] = useState<string>('');

  // Load saved Mandal-art + player identity from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HAGO_MANDAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        templateId?: string;
        blocks?: MandalartBlockData[];
        playerName?: string;
        jerseyNumber?: string;
      };
      if (Array.isArray(parsed.blocks) && parsed.blocks.length === 9) {
        setBlocks(parsed.blocks);
        if (typeof parsed.templateId === 'string') {
          setActiveTemplateId(parsed.templateId);
        }
      }
      if (typeof parsed.playerName === 'string') {
        setPlayerName(parsed.playerName);
      }
      if (typeof parsed.jerseyNumber === 'string' && parsed.jerseyNumber) {
        setJerseyNumber(parsed.jerseyNumber);
      }
    } catch {
      // Ignore malformed storage data
    }
  }, []);

  const persistState = (
    nextBlocks: MandalartBlockData[],
    templateId: string,
    nextName = playerName,
    nextJersey = jerseyNumber
  ) => {
    try {
      window.localStorage.setItem(
        HAGO_MANDAL_STORAGE_KEY,
        JSON.stringify({
          templateId,
          playerName: nextName,
          jerseyNumber: nextJersey,
          updatedAt: new Date().toISOString(),
          blocks: nextBlocks,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  };

  const showToast = (msg: string) => {
    setSaveToastMessage(msg);
    window.setTimeout(() => {
      setSaveToastMessage('');
    }, 2800);
  };

  // Handle baton-pass trigger from ACT 06 ("OHTANI #17 -> YOUR DRAFT")
  useEffect(() => {
    if (!playerDraft || playerDraft.triggerCount === 0) return;

    const blankTemplate =
      MANDALART_TEMPLATES.find((t) => t.id === 'blank-canvas') ??
      MANDALART_TEMPLATES[MANDALART_TEMPLATES.length - 1];
    const nextBlocks = buildMandalartBlocksFromTemplate(blankTemplate);

    if (playerDraft.coreGoal) {
      nextBlocks[4].cells[4] = playerDraft.coreGoal;
      nextBlocks[4].title = playerDraft.coreGoal;
    }

    const nextName = playerDraft.name || 'ROOKIE';
    const nextJersey = playerDraft.jerseyNumber || '17';

    setActiveTemplateId(blankTemplate.id);
    setBlocks(nextBlocks);
    setPlayerName(nextName);
    setJerseyNumber(nextJersey);
    setSelectedCell({ blockIndex: 4, cellIndex: 4 });
    persistState(nextBlocks, blankTemplate.id, nextName, nextJersey);
    showToast(
      `#${nextJersey} ${nextName} 님의 만다라트 드래프트가 시작되었습니다! 중앙 주변 8대 기둥을 채워보세요.`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerDraft?.triggerCount]);

  const handleSelectTemplate = (templateId: string) => {
    const found = MANDALART_TEMPLATES.find((t) => t.id === templateId);
    if (!found) return;
    const nextBlocks = buildMandalartBlocksFromTemplate(found);
    setActiveTemplateId(templateId);
    setBlocks(nextBlocks);
    persistState(nextBlocks, templateId);
    showToast(`‘${found.name}’ 템플릿을 불러왔습니다.`);
  };

  const handleUpdateIdentity = (nextName: string, nextJersey: string) => {
    setPlayerName(nextName);
    setJerseyNumber(nextJersey);
    persistState(blocks, activeTemplateId, nextName, nextJersey);
  };

  /**
   * Updates a cell and automatically keeps the Core 3x3 sub-goals (block 4, cell X)
   * synchronized with the Outer Block center cells (block X, cell 4)!
   */
  const handleUpdateCellText = (
    blockIndex: number,
    cellIndex: number,
    newValue: string
  ) => {
    setBlocks((prev) => {
      const next = prev.map((b) => ({
        ...b,
        cells: [...b.cells],
        completedCells: [...b.completedCells],
      }));

      const targetBlock = next[blockIndex];
      if (!targetBlock) return prev;
      targetBlock.cells[cellIndex] = newValue;

      if (blockIndex === 4 && cellIndex !== 4) {
        const linkedOuterBlock = next[cellIndex];
        if (linkedOuterBlock) {
          linkedOuterBlock.cells[4] = newValue;
          linkedOuterBlock.title = newValue;
        }
      }

      if (blockIndex !== 4 && cellIndex === 4) {
        const coreBlock = next[4];
        if (coreBlock) {
          coreBlock.cells[blockIndex] = newValue;
        }
        targetBlock.title = newValue;
      }

      if (blockIndex === 4 && cellIndex === 4) {
        targetBlock.title = newValue;
      }

      persistState(next, activeTemplateId);
      return next;
    });
  };

  const handleToggleCellComplete = (blockIndex: number, cellIndex: number) => {
    if (blockIndex === 4 || cellIndex === 4) return;

    setBlocks((prev) => {
      const next = prev.map((b, bIdx) => {
        if (bIdx !== blockIndex) return b;
        const nextCompleted = [...b.completedCells];
        nextCompleted[cellIndex] = !nextCompleted[cellIndex];
        return {
          ...b,
          completedCells: nextCompleted,
        };
      });
      persistState(next, activeTemplateId);
      return next;
    });
  };

  // Compute completion stats across all 64 action items
  const totalActionCount = 64;
  const completedActionCount = blocks.reduce((acc, block, bIdx) => {
    if (bIdx === 4) return acc;
    const blockDone = block.completedCells.reduce(
      (sum, done, cIdx) => (cIdx !== 4 && done ? sum + 1 : sum),
      0
    );
    return acc + blockDone;
  }, 0);
  const completionPercent = Math.round(
    (completedActionCount / totalActionCount) * 100
  );

  const handleExportPng = () => {
    const canvas = document.createElement('canvas');
    const width = 1600;
    const height = 1860;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Deep Obsidian Swiss Canvas
    ctx.fillStyle = '#0b0c0e';
    ctx.fillRect(0, 0, width, height);

    // Outer Architectural Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    // Top Telemetry Pill
    const displayNo = jerseyNumber.trim() || '17';
    const displayName = (playerName.trim() || 'OHTANI ROOKIE').toUpperCase();
    ctx.fillStyle = '#f4b942';
    ctx.fillRect(60, 62, 500, 34);
    ctx.fillStyle = '#0b0c0e';
    ctx.font = '800 18px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `HAGO-MANDAL // #${displayNo} ${displayName} DRAFT`,
      76,
      79
    );

    // Right Telemetry Progress
    ctx.fillStyle = '#f4f1ea';
    ctx.font = '700 20px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      `ACTIONS ${completedActionCount}/64 (${completionPercent}%)`,
      width - 60,
      79
    );

    // Core Goal Headline
    const coreGoalText = blocks[4]?.cells[4] || '나의 핵심 목표';
    ctx.fillStyle = '#f4f1ea';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(coreGoalText, 60, 146);

    const gridStartY = 200;
    const gridMargin = 56;
    const gridWidth = width - gridMargin * 2;
    const cellSize = gridWidth / 9;

    for (let macroR = 0; macroR < 3; macroR += 1) {
      for (let macroC = 0; macroC < 3; macroC += 1) {
        const blockIdx = macroR * 3 + macroC;
        const block = blocks[blockIdx];
        if (!block) continue;

        for (let cellR = 0; cellR < 3; cellR += 1) {
          for (let cellC = 0; cellC < 3; cellC += 1) {
            const cellIdx = cellR * 3 + cellC;
            const globalR = macroR * 3 + cellR;
            const globalC = macroC * 3 + cellC;

            const x = gridMargin + globalC * cellSize;
            const y = gridStartY + globalR * cellSize;

            const isCoreCenter = blockIdx === 4 && cellIdx === 4;
            const isCoreSub = blockIdx === 4 && cellIdx !== 4;
            const isOuterSub = blockIdx !== 4 && cellIdx === 4;
            const isCompleted = block.completedCells[cellIdx];

            ctx.fillStyle = isCoreCenter
              ? '#f4b942'
              : isCoreSub || isOuterSub
                ? '#18181b'
                : isCompleted
                  ? '#241e10'
                  : '#0e0e11';

            ctx.strokeStyle = isCoreCenter
              ? '#f4b942'
              : isCoreSub || isOuterSub
                ? 'rgba(244, 185, 66, 0.5)'
                : 'rgba(255, 255, 255, 0.14)';
            ctx.lineWidth = isCoreCenter || isCoreSub || isOuterSub ? 2.5 : 1;

            ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
            ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

            // Text rendering
            ctx.fillStyle = isCoreCenter
              ? '#0b0c0e'
              : isCoreSub || isOuterSub
                ? '#f4b942'
                : isCompleted
                  ? '#f4b942'
                  : '#f4f1ea';
            ctx.font =
              isCoreCenter || isCoreSub || isOuterSub
                ? '800 19px sans-serif'
                : '600 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const text = block.cells[cellIdx] || '';
            const maxCharsPerLine = 7;
            if (text.length > maxCharsPerLine) {
              const line1 = text.slice(0, maxCharsPerLine);
              const line2 = text.slice(maxCharsPerLine, maxCharsPerLine * 2);
              ctx.fillText(line1, x + cellSize / 2, y + cellSize / 2 - 12);
              ctx.fillText(line2, x + cellSize / 2, y + cellSize / 2 + 14);
            } else {
              ctx.fillText(text, x + cellSize / 2, y + cellSize / 2);
            }
          }
        }
      }
    }

    // Macro 3x3 Bold Dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(gridMargin, gridStartY, gridWidth, gridWidth);
    for (let i = 1; i <= 2; i += 1) {
      const pos = gridMargin + i * cellSize * 3;
      const yPos = gridStartY + i * cellSize * 3;
      ctx.beginPath();
      ctx.moveTo(pos, gridStartY);
      ctx.lineTo(pos, gridStartY + gridWidth);
      ctx.moveTo(gridMargin, yPos);
      ctx.lineTo(gridMargin + gridWidth, yPos);
      ctx.stroke();
    }

    // Footer Draft Quote
    ctx.fillStyle = '#71717a';
    ctx.font = '700 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      'OHTANI STARTED WITH 81 CELLS. NOW IT IS YOUR TURN.',
      60,
      height - 62
    );
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f4b942';
    ctx.fillText('HAGO-MANDAL.APP', width - 60, height - 62);

    const link = document.createElement('a');
    link.download = `hago-mandal-${displayNo}-${activeTemplateId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('스위스 에디토리얼 81칸 포스터 PNG가 저장되었습니다!');
  };

  const currentSelectedBlock = blocks[selectedCell.blockIndex] ?? blocks[4];
  const currentSelectedText =
    currentSelectedBlock?.cells[selectedCell.cellIndex] ?? '';
  const isSelectedCoreCenter =
    selectedCell.blockIndex === 4 && selectedCell.cellIndex === 4;
  const isSelectedSubGoal =
    (selectedCell.blockIndex === 4 && selectedCell.cellIndex !== 4) ||
    (selectedCell.blockIndex !== 4 && selectedCell.cellIndex === 4);
  const isSelectedActionItem = !isSelectedCoreCenter && !isSelectedSubGoal;
  const isSelectedCompleted =
    currentSelectedBlock?.completedCells[selectedCell.cellIndex] ?? false;

  return (
    <section
      id="mandalart-planner"
      className="relative border-t border-white/10 bg-[#0b0c0e] py-24 px-4 text-[#f4f1ea] sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Swiss Editorial Section Header + Player Identity Telemetry */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="font-mono-tech inline-block border border-[#f4b942]/40 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-[#f4b942] uppercase">
              ACT 07 // YOUR 81-CELL DRAFT STUDIO
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#f4f1ea] sm:text-5xl">
              이제 당신의 시즌을{' '}
              <span className="text-[#f4b942]">81칸에 기록</span>하세요
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              중앙 3×3의 핵심 기둥 8개를 정하면 바깥쪽 64개의 일일 루틴으로 자동 확장됩니다. 한 번에 다 채우지 않아도 좋습니다 — 매일 1구씩 실행하며 나만의 시즌을 완성해 보세요.
            </p>
          </div>

          {/* Player Identity Badge Inputs */}
          <div className="flex flex-wrap items-end gap-2 border border-white/15 bg-zinc-950 p-3.5">
            <div>
              <label
                htmlFor="planner-jersey"
                className="font-mono-tech block text-[10px] font-bold tracking-widest text-zinc-500 uppercase"
              >
                #NO.
              </label>
              <input
                id="planner-jersey"
                type="text"
                maxLength={3}
                value={jerseyNumber}
                onChange={(e) =>
                  handleUpdateIdentity(playerName, e.target.value)
                }
                className="font-mono-tech mt-1 w-16 border border-white/15 bg-[#0b0c0e] px-2.5 py-1.5 text-center text-xs font-extrabold text-[#f4b942] focus:border-[#f4b942] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="planner-player"
                className="font-mono-tech block text-[10px] font-bold tracking-widest text-zinc-500 uppercase"
              >
                PLAYER NAME
              </label>
              <input
                id="planner-player"
                type="text"
                maxLength={18}
                value={playerName}
                onChange={(e) =>
                  handleUpdateIdentity(e.target.value, jerseyNumber)
                }
                placeholder="내 이름 입력"
                className="mt-1 w-36 border border-white/15 bg-[#0b0c0e] px-3 py-1.5 text-xs font-bold text-[#f4f1ea] placeholder-zinc-600 focus:border-[#f4b942] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Template Preset Bar & Export Controls */}
        <div className="mt-8 flex flex-col justify-between gap-4 border border-white/15 bg-zinc-950 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-tech mr-2 text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
              TEMPLATE:
            </span>
            {MANDALART_TEMPLATES.map((tpl) => {
              const isCurrent = tpl.id === activeTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={cn(
                    'border px-3 py-2 text-xs font-bold transition-colors',
                    isCurrent
                      ? 'border-[#f4b942] bg-[#f4b942] text-[#0b0c0e]'
                      : 'border-white/15 bg-[#0b0c0e] text-zinc-400 hover:border-white/40 hover:text-[#f4f1ea]'
                  )}
                >
                  <span
                    className={cn(
                      'font-mono-tech mr-1.5 text-[10px]',
                      isCurrent ? 'text-[#0b0c0e]' : 'text-[#f4b942]'
                    )}
                  >
                    [{tpl.badge}]
                  </span>
                  {tpl.name}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex border border-white/15 bg-[#0b0c0e] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('full-81')}
                className={cn(
                  'font-mono-tech px-3 py-1.5 text-[11px] font-bold uppercase transition',
                  viewMode === 'full-81'
                    ? 'bg-[#f4f1ea] text-[#0b0c0e]'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                9×9 ALL
              </button>
              <button
                type="button"
                onClick={() => setViewMode('focus-block')}
                className={cn(
                  'font-mono-tech px-3 py-1.5 text-[11px] font-bold uppercase transition',
                  viewMode === 'focus-block'
                    ? 'bg-[#f4f1ea] text-[#0b0c0e]'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                3×3 FOCUS
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportPng}
              className="font-mono-tech bg-[#f4b942] px-4 py-2 text-xs font-extrabold tracking-wider text-[#0b0c0e] uppercase transition hover:bg-[#f4f1ea]"
            >
              ↓ POSTER PNG 저장
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {saveToastMessage ? (
          <div className="font-mono-tech mt-4 border border-[#f4b942]/50 bg-[#f4b942]/10 px-4 py-2.5 text-center text-xs font-bold text-[#f4b942]">
            ✓ {saveToastMessage}
          </div>
        ) : null}

        {/* 1. TODAY'S AT-BAT (Daily 1-Pitch Completion System) */}
        <div className="mt-6">
          <DailyAtBatPanel
            blocks={blocks}
            playerName={playerName}
            jerseyNumber={jerseyNumber}
            onToggleCellComplete={handleToggleCellComplete}
            onUpdateCellText={handleUpdateCellText}
            onSelectCell={(blockIndex, cellIndex) => {
              setSelectedCell({ blockIndex, cellIndex });
              if (viewMode === 'focus-block') {
                setFocusedBlockIndex(blockIndex);
              }
            }}
          />
        </div>

        {/* 2. OHTANI #17 vs YOU SCOUTING REPORT */}
        <div className="mt-4">
          <ScoutingReportPanel
            blocks={blocks}
            playerName={playerName}
            jerseyNumber={jerseyNumber}
            onJumpToCell={(blockIndex, cellIndex) => {
              setSelectedCell({ blockIndex, cellIndex });
              if (viewMode === 'focus-block') {
                setFocusedBlockIndex(blockIndex);
              }
              const inputEl = document.getElementById('mandal-cell-input');
              if (inputEl) {
                inputEl.focus();
                inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          />
        </div>

        {/* Active Cell Editor & Progress Dashboard Bar */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Selected Cell Inspector */}
          <div className="flex flex-col justify-between gap-4 border border-white/15 bg-zinc-950 p-5 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'font-mono-tech px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase',
                    isSelectedCoreCenter
                      ? 'bg-[#f4b942] text-[#0b0c0e]'
                      : isSelectedSubGoal
                        ? 'border border-[#f4b942]/60 text-[#f4b942]'
                        : 'border border-white/20 text-[#f4f1ea]'
                  )}
                >
                  {isSelectedCoreCenter
                    ? 'CORE GOAL // 중앙 핵심'
                    : isSelectedSubGoal
                      ? 'PILLAR // 8대 기둥 (자동 연동)'
                      : 'ACTION // 일일 실천 과제'}
                </span>
                <span className="font-mono-tech text-[11px] text-zinc-500">
                  BLOCK #{selectedCell.blockIndex + 1} · CELL #{selectedCell.cellIndex + 1}
                </span>
              </div>

              {isSelectedActionItem ? (
                <button
                  type="button"
                  onClick={() =>
                    handleToggleCellComplete(
                      selectedCell.blockIndex,
                      selectedCell.cellIndex
                    )
                  }
                  className={cn(
                    'font-mono-tech border px-3.5 py-1.5 text-[11px] font-extrabold uppercase transition',
                    isSelectedCompleted
                      ? 'border-[#f4b942] bg-[#f4b942] text-[#0b0c0e]'
                      : 'border-white/20 bg-[#0b0c0e] text-zinc-300 hover:border-[#f4b942]/60 hover:text-[#f4b942]'
                  )}
                >
                  {isSelectedCompleted
                    ? '✓ COMPLETED (클릭 시 해제)'
                    : '○ MARK COMPLETE'}
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="mandal-cell-input"
                className="font-mono-tech shrink-0 text-[11px] font-bold tracking-wider text-zinc-400 uppercase"
              >
                EDIT CELL:
              </label>
              <input
                id="mandal-cell-input"
                type="text"
                value={currentSelectedText}
                onChange={(e) =>
                  handleUpdateCellText(
                    selectedCell.blockIndex,
                    selectedCell.cellIndex,
                    e.target.value
                  )
                }
                placeholder="목표나 실천 행동을 입력하세요"
                className="w-full border border-white/15 bg-[#0b0c0e] px-4 py-2.5 text-sm font-bold text-[#f4f1ea] placeholder-zinc-600 focus:border-[#f4b942] focus:outline-none"
              />
            </div>
          </div>

          {/* 64-Action Completion Gauge */}
          <div className="flex flex-col justify-between border border-white/15 bg-zinc-950 p-5 lg:col-span-4">
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                EXECUTION RATE // 64 ACTIONS
              </span>
              <span className="font-display text-3xl tracking-tight text-[#f4b942]">
                {completionPercent}%
              </span>
            </div>
            <div className="my-3 h-2 w-full overflow-hidden bg-[#0b0c0e] border border-white/10">
              <div
                className="h-full bg-[#f4b942] transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="font-mono-tech flex items-center justify-between text-[11px] text-zinc-500">
              <span>DONE: {completedActionCount} / 64</span>
              <span className="font-bold text-[#f4b942]">AUTO-SAVED</span>
            </div>
          </div>
        </div>

        {/* Focus Block Selector (when in 3x3 Focus Mode) */}
        {viewMode === 'focus-block' ? (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {blocks.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setFocusedBlockIndex(idx)}
                className={cn(
                  'font-mono-tech border px-3 py-2 text-xs font-bold transition',
                  focusedBlockIndex === idx
                    ? 'border-[#f4b942] bg-[#f4b942] text-[#0b0c0e]'
                    : 'border-white/15 bg-zinc-950 text-zinc-400 hover:text-white'
                )}
              >
                {idx === 4
                  ? `★ CORE (${b.cells[4] || '핵심'})`
                  : `0${idx > 4 ? idx : idx + 1}. ${b.cells[4] || '기둥'}`}
              </button>
            ))}
          </div>
        ) : null}

        {/* THE 9x9 SWISS EDITORIAL MANDAL-ART MATRIX */}
        <div
          className={cn(
            'mt-6 grid gap-3 sm:gap-4',
            viewMode === 'full-81'
              ? 'grid-cols-1 md:grid-cols-3'
              : 'mx-auto max-w-xl grid-cols-1'
          )}
        >
          {blocks.map((block, bIdx) => {
            if (viewMode === 'focus-block' && bIdx !== focusedBlockIndex) {
              return null;
            }
            const isCoreMacroBlock = bIdx === 4;

            return (
              <div
                key={block.id}
                className={cn(
                  'border p-2 transition-colors sm:p-2.5',
                  isCoreMacroBlock
                    ? 'border-[#f4b942]/60 bg-zinc-950'
                    : 'border-white/15 bg-zinc-950/80'
                )}
              >
                {/* 3x3 Inner Grid */}
                <div className="grid grid-cols-3 gap-px bg-white/10">
                  {block.cells.map((cellText, cIdx) => {
                    const isSelected =
                      selectedCell.blockIndex === bIdx &&
                      selectedCell.cellIndex === cIdx;
                    const isCoreCenter = bIdx === 4 && cIdx === 4;
                    const isCoreSubGoal = bIdx === 4 && cIdx !== 4;
                    const isOuterCenterSubGoal = bIdx !== 4 && cIdx === 4;
                    const isCompleted = block.completedCells[cIdx];

                    return (
                      <button
                        key={`${block.id}-cell-${cIdx}`}
                        type="button"
                        onClick={() => {
                          setSelectedCell({
                            blockIndex: bIdx,
                            cellIndex: cIdx,
                          });
                        }}
                        onDoubleClick={() => handleToggleCellComplete(bIdx, cIdx)}
                        className={cn(
                          'group relative flex min-h-[68px] flex-col items-center justify-center p-2 text-center transition-colors duration-150 sm:min-h-[78px]',
                          isCoreCenter
                            ? 'bg-[#f4b942] text-[#0b0c0e] font-black'
                            : isCoreSubGoal || isOuterCenterSubGoal
                              ? 'bg-zinc-900 text-[#f4b942] font-extrabold hover:bg-zinc-800'
                              : isCompleted
                                ? 'bg-[#241e10] text-[#f4b942]'
                                : 'bg-[#0b0c0e] text-[#f4f1ea] hover:bg-zinc-900',
                          isSelected &&
                            'z-10 ring-2 ring-[#f4f1ea] ring-inset'
                        )}
                      >
                        {/* Top-right completion badge for outer action items */}
                        {!isCoreCenter && !isCoreSubGoal && !isOuterCenterSubGoal ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCellComplete(bIdx, cIdx);
                            }}
                            title="실천 완료 체크 토글"
                            className={cn(
                              'font-mono-tech absolute top-1 right-1 flex h-4 w-4 items-center justify-center text-[9px] font-black transition',
                              isCompleted
                                ? 'bg-[#f4b942] text-[#0b0c0e]'
                                : 'border border-white/20 bg-[#0b0c0e] text-zinc-500 opacity-0 group-hover:opacity-100'
                            )}
                          >
                            ✓
                          </span>
                        ) : null}

                        <span
                          className={cn(
                            'line-clamp-3 break-keep leading-snug',
                            isCoreCenter
                              ? 'text-xs font-black sm:text-sm'
                              : isCoreSubGoal || isOuterCenterSubGoal
                                ? 'text-xs font-extrabold sm:text-[13px]'
                                : 'text-[11px] font-medium sm:text-xs',
                            !cellText && 'opacity-25'
                          )}
                        >
                          {cellText || '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
