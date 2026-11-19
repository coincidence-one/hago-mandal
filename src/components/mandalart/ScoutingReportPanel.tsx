'use client';

import { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MandalartBlockData } from '@/types/mandalart';
import { cn } from '@/utils/cn';

export interface ScoutingReportPanelProps {
  blocks: MandalartBlockData[];
  playerName: string;
  jerseyNumber: string;
  onJumpToCell: (blockIndex: number, cellIndex: number) => void;
}

type AxisKey = 'tech' | 'physical' | 'mental' | 'attitude';

interface AxisAnalysis {
  key: AxisKey;
  label: string;
  ohtaniRatio: number; // %
  ohtaniDesc: string;
  userCount: number;
  userRatio: number; // %
}

const AXIS_KEYWORDS: Record<AxisKey, string[]> = {
  physical: [
    '몸',
    '체력',
    '건강',
    '운동',
    '수면',
    '식단',
    '근력',
    '유연',
    '스트레칭',
    '체중',
    '영양',
    '피지컬',
    '컨디션',
    '잠',
    '물',
    '러닝',
    '헬스',
  ],
  mental: [
    '멘탈',
    '마음',
    '집중',
    '마인드',
    '감정',
    '일희일비',
    '독서',
    '명상',
    '기록',
    '회고',
    '회복',
    '루틴',
    '습관',
    '시간',
    '몰입',
    '자신감',
    '평정',
  ],
  attitude: [
    '운',
    '인간성',
    '태도',
    '인사',
    '감사',
    '청소',
    '쓰레기',
    '배려',
    '신뢰',
    '소통',
    '네트워킹',
    '커뮤니케이션',
    '협업',
    '관계',
    '리더십',
    '예의',
    '긍정',
  ],
  tech: [
    '제구',
    '구위',
    '구속',
    '변화구',
    '기술',
    '실력',
    '코드',
    '코딩',
    '개발',
    '디자인',
    '아키텍처',
    '성능',
    '테스트',
    '학습',
    '공부',
    '영어',
    '자격증',
    '포트폴리오',
    '프로젝트',
    '매출',
    '커리어',
    '스킬',
    '리드',
  ],
};

const classifyPillar = (text: string): AxisKey => {
  const lower = text.toLowerCase();
  const order: AxisKey[] = ['physical', 'mental', 'attitude', 'tech'];
  for (const key of order) {
    if (AXIS_KEYWORDS[key].some((kw) => lower.includes(kw))) {
      return key;
    }
  }
  return 'tech';
};

export const ScoutingReportPanel = ({
  blocks,
  playerName,
  jerseyNumber,
  onJumpToCell,
}: ScoutingReportPanelProps) => {
  const report = useMemo(() => {
    const counts: Record<AxisKey, number> = {
      tech: 0,
      physical: 0,
      mental: 0,
      attitude: 0,
    };

    let filledPillars = 0;
    let firstEmptyPillarBlockIdx: number | null = null;

    for (let bIdx = 0; bIdx < blocks.length; bIdx += 1) {
      if (bIdx === 4) continue;
      const block = blocks[bIdx];
      if (!block) continue;
      const pillarTitle = block.cells[4]?.trim() ?? '';
      const filledActions = block.cells.filter(
        (c, idx) => idx !== 4 && c.trim().length > 0
      ).length;

      if (!pillarTitle && firstEmptyPillarBlockIdx === null) {
        firstEmptyPillarBlockIdx = bIdx;
      }

      if (pillarTitle.length > 0) {
        filledPillars += 1;
        const combinedText = `${pillarTitle} ${block.cells.join(' ')}`;
        const axis = classifyPillar(combinedText);
        counts[axis] += 1 + filledActions * 0.125;
      }
    }

    const totalScore = Math.max(
      1,
      counts.tech + counts.physical + counts.mental + counts.attitude
    );

    const axes: AxisAnalysis[] = [
      {
        key: 'tech',
        label: 'TECH & SKILL (기술·전문성)',
        ohtaniRatio: 50,
        ohtaniDesc: '제구·구위·구속·변화구 (4기둥)',
        userCount: Math.round(counts.tech * 10) / 10,
        userRatio:
          filledPillars === 0 ? 0 : Math.round((counts.tech / totalScore) * 100),
      },
      {
        key: 'physical',
        label: 'PHYSICAL & BODY (피지컬·체력)',
        ohtaniRatio: 13,
        ohtaniDesc: '몸 만들기·영양·가동성 (1기둥)',
        userCount: Math.round(counts.physical * 10) / 10,
        userRatio:
          filledPillars === 0
            ? 0
            : Math.round((counts.physical / totalScore) * 100),
      },
      {
        key: 'mental',
        label: 'MENTAL & FOCUS (멘탈·집중)',
        ohtaniRatio: 12,
        ohtaniDesc: '일희일비하지 않기·분위기 (1기둥)',
        userCount: Math.round(counts.mental * 10) / 10,
        userRatio:
          filledPillars === 0
            ? 0
            : Math.round((counts.mental / totalScore) * 100),
      },
      {
        key: 'attitude',
        label: 'ATTITUDE & LUCK (인간성·운)',
        ohtaniRatio: 25,
        ohtaniDesc: '쓰레기 줍기·인사·신뢰 (2기둥)',
        userCount: Math.round(counts.attitude * 10) / 10,
        userRatio:
          filledPillars === 0
            ? 0
            : Math.round((counts.attitude / totalScore) * 100),
      },
    ];

    const missingAxes = axes.filter((a) => a.userCount === 0);

    let diagnosisTitle = '오타니식 4대 영역 황금 밸런스에 근접했습니다!';
    let diagnosisDesc =
      '기술적 성장뿐 아니라 체력·멘탈·태도(운)까지 고르게 배치되어 슬럼프에도 흔들리지 않는 단단한 설계도입니다.';
    let isWarning = false;

    if (filledPillars === 0) {
      diagnosisTitle = '아직 8개 기둥이 비어 있습니다.';
      diagnosisDesc =
        '중앙 3×3 주변 8칸에 기둥을 채우면 오타니의 황금 비율과 실시간으로 비교해 스카우팅 리포트를 생성합니다.';
      isWarning = true;
    } else if (missingAxes.length > 0) {
      const missingNames = missingAxes.map((m) => m.label.split(' ')[0]).join(', ');
      diagnosisTitle = `스카우팅 경고: [${missingNames}] 영역이 비어 있습니다.`;
      diagnosisDesc = `오타니는 기술(50%)만큼 체력·멘탈·운/인간성(50%)에 칸을 할애했습니다. 지금 보드에 ${missingNames} 기둥을 추가하면 훨씬 오래 버티는 만다라트가 됩니다.`;
      isWarning = true;
    }

    return {
      axes,
      filledPillars,
      firstEmptyPillarBlockIdx,
      diagnosisTitle,
      diagnosisDesc,
      isWarning,
    };
  }, [blocks]);

  const displayJersey = jerseyNumber.trim() || '17';
  const displayName = (playerName.trim() || 'ROOKIE').toUpperCase();

  return (
    <div className="border border-white/15 bg-zinc-950 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="font-mono-tech inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] text-[#f4b942] uppercase">
            <Activity className="h-3.5 w-3.5" /> SCOUTING REPORT // OHTANI #17 vs #{displayJersey} {displayName}
          </span>
          <h3 className="mt-1 text-lg font-black tracking-tight text-[#f4f1ea] sm:text-xl">
            내 만다라트는 오타니의 밸런스와 얼마나 닮았을까?
          </h3>
        </div>
        <span className="font-mono-tech border border-white/15 bg-[#0b0c0e] px-3 py-1 text-[11px] font-bold text-zinc-300">
          PILLARS ACTIVE: {report.filledPillars} / 8
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: 4-Axis Comparison Bars */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8">
          {report.axes.map((axis) => (
            <div
              key={axis.key}
              className="border border-white/10 bg-[#0b0c0e] p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-tech text-[11px] font-bold text-[#f4f1ea]">
                  {axis.label}
                </span>
                <span
                  className={cn(
                    'font-mono-tech text-[11px] font-extrabold',
                    axis.userRatio > 0 ? 'text-[#f4b942]' : 'text-zinc-600'
                  )}
                >
                  YOU {axis.userRatio}%
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-zinc-500">
                오타니 기준 {axis.ohtaniRatio}% · {axis.ohtaniDesc}
              </p>

              {/* Ohtani Reference Bar vs User Bar */}
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech w-11 text-[9px] text-zinc-500">
                    #17
                  </span>
                  <div className="h-1.5 flex-1 bg-zinc-900">
                    <div
                      className="h-full bg-zinc-500"
                      style={{ width: `${Math.min(100, axis.ohtaniRatio)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech w-11 text-[9px] font-bold text-[#f4b942]">
                    YOU
                  </span>
                  <div className="h-2 flex-1 bg-zinc-900">
                    <div
                      className="h-full bg-[#f4b942] transition-all duration-300"
                      style={{ width: `${Math.min(100, axis.userRatio)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Live Scouting Diagnosis Card */}
        <div
          className={cn(
            'flex flex-col justify-between border p-5 lg:col-span-4',
            report.isWarning
              ? 'border-[#f4b942]/50 bg-[#0b0c0e]'
              : 'border-[#f4b942] bg-[#241e10]'
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              {report.isWarning ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#f4b942]" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#f4b942]" />
              )}
              <span className="font-mono-tech text-[10px] font-extrabold tracking-widest text-[#f4b942] uppercase">
                COACH FEEDBACK
              </span>
            </div>
            <h4 className="mt-2.5 text-base font-black leading-snug text-[#f4f1ea]">
              {report.diagnosisTitle}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              {report.diagnosisDesc}
            </p>
          </div>

          {report.firstEmptyPillarBlockIdx !== null ? (
            <button
              type="button"
              onClick={() => {
                if (report.firstEmptyPillarBlockIdx !== null) {
                  onJumpToCell(4, report.firstEmptyPillarBlockIdx);
                }
              }}
              className="font-mono-tech mt-4 w-full bg-[#f4b942] px-4 py-2.5 text-[11px] font-extrabold tracking-wider text-[#0b0c0e] uppercase transition hover:bg-[#f4f1ea]"
            >
              빈 기둥(#{report.firstEmptyPillarBlockIdx + 1}) 바로 채우기 →
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
