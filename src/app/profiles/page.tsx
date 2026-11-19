'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import {
  HAGO_MANDAL_STORAGE_KEY,
} from '@/components/mandalart/MandalartPlannerSection';
import {
  buildMandalartBlocksFromTemplate,
  MANDALART_TEMPLATES,
} from '@/data/ohtaniMandalartData';
import type { MandalartBlockData } from '@/types/mandalart';
import { cn } from '@/utils/cn';

const ProfilesPage = () => {
  const [blocks, setBlocks] = useState<MandalartBlockData[]>(() =>
    buildMandalartBlocksFromTemplate(MANDALART_TEMPLATES[0])
  );
  const [updatedAt, setUpdatedAt] = useState<string>('방금 전');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HAGO_MANDAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        updatedAt?: string;
        blocks?: MandalartBlockData[];
      };
      if (Array.isArray(parsed.blocks) && parsed.blocks.length === 9) {
        setBlocks(parsed.blocks);
      }
      if (typeof parsed.updatedAt === 'string') {
        setUpdatedAt(new Date(parsed.updatedAt).toLocaleString('ko-KR'));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const coreGoal = blocks[4]?.cells[4] ?? '8구단 드래프트 1순위';
  const outerBlocks = blocks.filter((_, idx) => idx !== 4);

  const completedCount = outerBlocks.reduce((acc, b) => {
    const done = b.completedCells.reduce(
      (s, c, cIdx) => (cIdx !== 4 && c ? s + 1 : s),
      0
    );
    return acc + done;
  }, 0);

  const progressRate = Math.round((completedCount / 64) * 100);

  const rankTitle =
    progressRate >= 80
      ? '이도류 MVP 마스터 (#17)'
      : progressRate >= 45
        ? '165km/h 파이어볼러'
        : progressRate >= 20
          ? '메이저 콜업 유망주'
          : '만다라트 루키 플레이어';

  return (
    <main className="min-h-screen bg-slate-950 pt-28 pb-24 px-4 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <Badge variant="two-way">MY HAGO-MANDAL PROFILE</Badge>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              나의 핵심 목표: “{coreGoal}”
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              마지막 업데이트: {updatedAt} · 현재 등급:{' '}
              <strong className="text-sky-300">{rankTitle}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-center">
              <span className="text-xs font-bold text-slate-400">달성한 실천</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">
                {completedCount}{' '}
                <span className="text-sm text-slate-500">/ 64</span>
              </p>
            </div>
            <Link
              href="/#mandalart-planner"
              className="rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-5 py-4 text-sm font-extrabold text-slate-950 shadow-lg hover:brightness-110"
            >
              계획표 계속 편집하기 →
            </Link>
          </div>
        </div>

        {/* 8 Sub-Goal Progress Breakdown */}
        <h2 className="mt-12 text-xl font-extrabold text-white">
          8대 세부 목표별 실천 현황
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {outerBlocks.map((b, idx) => {
            const subGoalTitle = b.cells[4] || `세부 목표 ${idx + 1}`;
            const subDone = b.completedCells.reduce(
              (s, c, cIdx) => (cIdx !== 4 && c ? s + 1 : s),
              0
            );
            const subRate = Math.round((subDone / 8) * 100);

            return (
              <div
                key={b.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>PILLAR 0{idx + 1}</span>
                    <span className="font-bold text-sky-400">{subDone} / 8 완료</span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-white">
                    {subGoalTitle}
                  </h3>
                </div>

                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        subRate >= 75
                          ? 'bg-emerald-400'
                          : subRate >= 40
                            ? 'bg-sky-400'
                            : 'bg-amber-400'
                      )}
                      style={{ width: `${subRate}%` }}
                    />
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-slate-300">
                    {b.cells.map((cell, cIdx) => {
                      if (cIdx === 4) return null;
                      const done = b.completedCells[cIdx];
                      return (
                        <li
                          key={`${b.id}-${cIdx}`}
                          className="flex items-center gap-1.5 truncate"
                        >
                          <span
                            className={
                              done ? 'text-emerald-400 font-bold' : 'text-slate-600'
                            }
                          >
                            {done ? '✓' : '·'}
                          </span>
                          <span
                            className={
                              done ? 'line-through text-slate-500' : 'text-slate-300'
                            }
                          >
                            {cell}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ProfilesPage;
