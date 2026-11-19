export type OhtaniPhaseId =
  | 'windup'
  | 'release'
  | 'transition'
  | 'swing'
  | 'mandalart';

export interface OhtaniScrollChapter {
  id: OhtaniPhaseId;
  stepNumber: string;
  roleBadge: string;
  roleType: 'pitcher' | 'two-way' | 'batter' | 'vision';
  title: string;
  subtitle: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  metricUnit: string;
  mandalKeyword: string;
  mandalQuote: string;
  accentColor: string;
  progressRange: [number, number];
}

export type CustomPoseMap = Partial<Record<OhtaniPhaseId, string>>;

export interface MandalartBlockData {
  id: string;
  blockIndex: number; // 0 to 8 (4 is center core block)
  title: string;
  categoryColor: string;
  cells: string[]; // length 9 (index 4 is center of the 3x3 block)
  completedCells: boolean[]; // length 9
}

export interface MandalartTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  coreGoal: string;
  subGoals: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  /**
   * 8 outer blocks in reading order around center:
   * 0: top-left, 1: top-center, 2: top-right,
   * 3: mid-left, (center is core), 4: mid-right,
   * 5: bottom-left, 6: bottom-center, 7: bottom-right
   * Each has 8 action items surrounding its center subGoal
   */
  outerActions: [
    [string, string, string, string, string, string, string, string],
    [string, string, string, string, string, string, string, string],
    [string, string, string, string, string, string, string, string],
    [string, string, string, string, string, string, string, string],
    [string, string, string, string, string, string, string, string],
    [string, string, string, string, string, string, string, string],
    [string, string, string, string, string, string, string, string],
    [string, string, string, string, string, string, string, string],
  ];
}

export interface MandalartPillarInsight {
  blockPosition: number;
  title: string;
  englishTitle: string;
  ohtaniStory: string;
  keyHabits: string[];
  accentClass: string;
}
