import type {
  MandalartBlockData,
  MandalartPillarInsight,
  MandalartTemplate,
  OhtaniScrollChapter,
} from '@/types/mandalart';

export const OHTANI_SCROLL_CHAPTERS: OhtaniScrollChapter[] = [
  {
    id: 'windup',
    stepNumber: '01',
    roleBadge: 'PITCHER · WIND-UP',
    roleType: 'pitcher',
    title: '마운드 위, 고요한 집중과 와인드업',
    subtitle: '오타니 쇼헤이가 공을 던지기 전, 먼저 던질 곳을 설계한다',
    description:
      '글러브를 가슴 앞에 모으고 왼발을 높이 들어 올리는 투구 준비 동작. 흔들리지 않는 하체 밸런스와 코어 축은 고교 1학년 시절 만다라트에 적었던 "몸 만들기"와 "제구"의 16가지 매일의 루틴에서 시작되었습니다.',
    metricLabel: 'MOUND BALANCE & FOCUS',
    metricValue: '99.4',
    metricUnit: '% SYNC',
    mandalKeyword: '제구 · 몸 만들기 · 멘탈',
    mandalQuote: '“불안정을 없애고, 몸을 열지 않는다. 하체 중심축을 끝까지 유지한다.”',
    accentColor: '#38bdf8',
    progressRange: [0, 0.22],
  },
  {
    id: 'release',
    stepNumber: '02',
    roleBadge: 'PITCHER · 165 KM/H RELEASE',
    roleType: 'pitcher',
    title: '불가능을 찢는 165km/h의 릴리즈',
    subtitle: '만다라트 우측 상단에 적었던 “스피드 160km/h”가 현실이 되는 순간',
    description:
      '채찍처럼 휘어지는 팔 스윙과 손끝에서 폭발하는 2,650 RPM의 회전수. 막연한 꿈이었던 구속 160km/h는 “어깨 가동역”, “라이너 캐치볼”, “하체 강화”라는 8개의 구체적인 행동 칸으로 쪼개졌을 때 비로소 현실이 되었습니다.',
    metricLabel: 'FASTBALL VELOCITY',
    metricValue: '165.0',
    metricUnit: 'KM/H (102.5 MPH)',
    mandalKeyword: '스피드 160km/h · 구위 · 변화구',
    mandalQuote: '“위에서 아래로 내리꽂는 각도, 볼 끝의 힘으로 타자를 압도한다.”',
    accentColor: '#ef4444',
    progressRange: [0.22, 0.44],
  },
  {
    id: 'transition',
    stepNumber: '03',
    roleBadge: 'TWO-WAY · BATTER STANCE',
    roleType: 'two-way',
    title: '투수의 눈으로 던지고, 타석에 서다',
    subtitle: '날아오는 공을 맞이하는 이도류(二刀流) 타격 준비 모션',
    description:
      '마운드에서 던진 공의 궤적이 홈플레이트로 도달하는 순간, 시점은 타석에 선 오타니로 전환됩니다. 배트를 곧게 세우고 스트라이크 존의 9개 코어 격자(3×3)를 응시하며 가장 완벽한 타이밍을 기다립니다.',
    metricLabel: 'STRIKE ZONE CORE GRID',
    metricValue: '3 × 3',
    metricUnit: 'CORE TARGET',
    mandalKeyword: '이도류(Two-Way) · 분위기 · 일희일비하지 않기',
    mandalQuote: '“머리는 차갑게, 심장은 뜨겁게. 핀치에 강하고 기복 없는 플레이.”',
    accentColor: '#f59e0b',
    progressRange: [0.44, 0.64],
  },
  {
    id: 'swing',
    stepNumber: '04',
    roleBadge: 'BATTER · BARREL IMPACT',
    roleType: 'batter',
    title: '전율의 풀스윙, 밤하늘을 가르는 배럴 타구',
    subtitle: '64개의 작은 실천이 한 번의 완벽한 스윙으로 응축되다',
    description:
      '폭발적인 힙턴과 함께 배트 중심에 정확히 맞은 타구가 191.5km/h의 속도로 날아오릅니다. 타구의 궤적은 경기장 상공에서 8갈래의 빛으로 뻗어 나가며 오타니를 만든 설계도, 만다라트로 확장됩니다.',
    metricLabel: 'EXIT VELOCITY · LAUNCH ANGLE',
    metricValue: '191.5',
    metricUnit: 'KM/H · 28° ARC',
    mandalKeyword: '인간성 · 운(運) · 신뢰받는 선수',
    mandalQuote: '“쓰레기를 줍고, 심판을 존중하며, 감사할 줄 아는 사람이 결국 결정적 한 방을 친다.”',
    accentColor: '#a855f7',
    progressRange: [0.64, 0.82],
  },
  {
    id: 'mandalart',
    stepNumber: '05',
    roleBadge: 'HAGO-MANDAL · 9×9 BLUEPRINT',
    roleType: 'vision',
    title: '하고만달: 전설을 만든 81칸의 만다라트',
    subtitle: '1개의 핵심 목표 × 8개의 기둥 × 64개의 일일 행동 = 멈추지 않는 성장',
    description:
      '투구에서 타격으로 이어진 에너지가 마침내 9×9 만다라트 계획표로 결정화됩니다. 아래로 스크롤하여 오타니의 실제 만다라트를 해부해 보고, 지금 바로 당신만의 "하고만달" 계획표를 완성해 보세요.',
    metricLabel: 'MANDAL-ART ARCHITECTURE',
    metricValue: '81',
    metricUnit: 'ACTION CELLS (9×9)',
    mandalKeyword: '8구단 드래프트 1순위 → 당신의 핵심 목표',
    mandalQuote: '“생각을 표로 시각화하는 순간, 무엇을 해야 할지 망설임이 사라진다.”',
    accentColor: '#10b981',
    progressRange: [0.82, 1.0],
  },
];

export const OHTANI_PILLAR_INSIGHTS: MandalartPillarInsight[] = [
  {
    blockPosition: 0,
    title: '몸 만들기',
    englishTitle: 'BODY BUILDING',
    ohtaniStory:
      '160km/h의 강속구와 풀타임 이도류를 버티기 위해 유연성과 가동역, 식단(밤 7공기, 아침 3공기)까지 수치화해 관리했습니다.',
    keyHabits: ['몸 관리', '영양제 섭취', 'FSQ 90kg', 'RSQ 130kg', '식사 저녁 7숟갈/아침 3숟갈', '가동역', '스테미너', '유연성'],
    accentClass: 'from-sky-500/20 to-blue-600/10 border-sky-400/40 text-sky-300',
  },
  {
    blockPosition: 1,
    title: '제구',
    englishTitle: 'CONTROL',
    ohtaniStory:
      '빠르기만 한 공이 아니라 원하는 코스에 꽂기 위해 인스텝 개선, 릴리즈 포인트 안정, 하체 강화를 세밀하게 점검했습니다.',
    keyHabits: ['인스텝 개선', '몸통 강화', '축 다리 흔들리지 않기', '불안정 없애기', '멘탈 컨트롤', '몸을 열지 않기', '하체 강화', '릴리즈 포인트 안정'],
    accentClass: 'from-cyan-500/20 to-teal-600/10 border-cyan-400/40 text-cyan-300',
  },
  {
    blockPosition: 2,
    title: '구위',
    englishTitle: 'PITCH QUALITY',
    ohtaniStory:
      '타자가 알고도 못 치는 공 끝의 힘을 만들기 위해 위에서 아래로 던지는 각도와 회전수, 볼 끝의 힘을 단련했습니다.',
    keyHabits: ['각도를 만든다', '위에서부터 공 던지기', '손목 강화', '하체 강화', '회전수 증가', '가동성', '볼 끝의 힘', '힘이 아닌 폼으로 던지기'],
    accentClass: 'from-indigo-500/20 to-violet-600/10 border-indigo-400/40 text-indigo-300',
  },
  {
    blockPosition: 3,
    title: '멘탈',
    englishTitle: 'MENTALITY',
    ohtaniStory:
      '위기 상황에서도 흔들리지 않도록 “일희일비하지 않기”, “머리는 차갑게 심장은 뜨겁게” 같은 마인드셋을 습관으로 정의했습니다.',
    keyHabits: ['뚜렷한 목표·목적', '일희일비하지 않기', '머리는 차갑게 심장은 뜨겁게', '분위기에 휩쓸리지 않기', '동료를 배려하는 마음', '승리에 대한 집념', '연습은 실전처럼', '핀치에 강하게'],
    accentClass: 'from-purple-500/20 to-fuchsia-600/10 border-purple-400/40 text-purple-300',
  },
  {
    blockPosition: 4,
    title: '스피드 160km/h',
    englishTitle: 'SPEED 160 KM/H',
    ohtaniStory:
      '당시 고교 야구에서 불가능이라 여겨졌던 160km/h를 목표로 삼고, 축으로 돌기·어깨 강도·라이너 캐치볼로 구체화해 실제로 고3 때 160km/h를 달성했습니다.',
    keyHabits: ['축으로 돌기', '하체 강화', '체중 증가', '코어·몸통 강화', '어깨 주위 강화', '가동역 넓히기', '라이너 캐치볼', '피칭 늘리기'],
    accentClass: 'from-rose-500/20 to-red-600/10 border-rose-400/40 text-rose-300',
  },
  {
    blockPosition: 5,
    title: '인간성',
    englishTitle: 'HUMANITY',
    ohtaniStory:
      '실력만 뛰어난 선수가 아니라 모두가 응원하고 싶은 선수가 되기 위해 감성, 배려, 감사, 예의를 훈련 항목과 동등한 비중으로 두었습니다.',
    keyHabits: ['감성', '사랑받는 사람', '계획성', '감사', '예의', '배려', '신뢰받는 사람', '지속력'],
    accentClass: 'from-amber-500/20 to-orange-600/10 border-amber-400/40 text-amber-300',
  },
  {
    blockPosition: 6,
    title: '운 (運)',
    englishTitle: 'GOOD FORTUNE',
    ohtaniStory:
      '오타니 만다라트에서 가장 유명한 영역입니다. “운조차 실력으로 끌어당긴다”는 철학으로 쓰레기 줍기(“다른 사람이 버린 운을 줍는다”), 부실 청소, 심판 존중을 실천했습니다.',
    keyHabits: ['인사하기', '쓰레기 줍기', '부실 청소', '물건을 소중히 쓰기', '심판에게 존경심 갖기', '긍정적 사고', '응원받는 사람 되기', '책 읽기'],
    accentClass: 'from-emerald-500/20 to-green-600/10 border-emerald-400/40 text-emerald-300',
  },
  {
    blockPosition: 7,
    title: '변화구',
    englishTitle: 'BREAKING BALL',
    ohtaniStory:
      '직구와 똑같은 투구 폼에서 나오는 날카로운 포크볼·슬라이더를 장착해 타자의 타이밍을 뺏는 결정구를 완성했습니다.',
    keyHabits: ['카운트 볼 늘리기', '포크볼 완성', '슬라이더 날카로움', '좌타자 결정구', '스트라이크에서 볼로 제구', '낙차와 깊이', '직구와 같은 폼 유지', '느린 변화구 완급조절'],
    accentClass: 'from-blue-500/20 to-indigo-600/10 border-blue-400/40 text-blue-300',
  },
];

export const MANDALART_TEMPLATES: MandalartTemplate[] = [
  {
    id: 'ohtani-highschool',
    name: '오타니 쇼헤이 원본 (81칸)',
    badge: 'LEGEND PRESET',
    description:
      '하나마키히가시 고교 1학년 오타니 쇼헤이가 직접 작성해 160km/h와 메이저리그 MVP 신화를 이룬 실제 만다라트 계획표입니다.',
    coreGoal: '8구단 드래프트 1순위',
    subGoals: [
      '몸 만들기',
      '제구',
      '구위',
      '멘탈',
      '스피드 160km/h',
      '인간성',
      '운 (運)',
      '변화구',
    ],
    outerActions: [
      [
        '몸 관리',
        '영양제 섭취',
        'FSQ 90kg',
        'RSQ 130kg',
        '식사 밤7/아침3',
        '가동역 확보',
        '스테미너',
        '유연성 강화',
      ],
      [
        '인스텝 개선',
        '몸통 강화',
        '축다리 고정',
        '불안정 제거',
        '멘탈 컨트롤',
        '몸 열리지 않기',
        '하체 강화',
        '릴리즈 안정',
      ],
      [
        '각도 만들기',
        '위에서 던지기',
        '손목 강화',
        '하체 드라이브',
        '회전수 증가',
        '관절 가동성',
        '볼 끝의 힘',
        '폼으로 던지기',
      ],
      [
        '뚜렷한 목표',
        '일희일비 금지',
        '차분한 머리·열정',
        '분위기 안타기',
        '동료 배려',
        '승리 집념',
        '실전 같은 연습',
        '위기에 강함',
      ],
      [
        '축으로 회전',
        '하체 웨이트',
        '체중 증량',
        '코어 강화',
        '어깨 근력',
        '가동역 확장',
        '라이너 캐치볼',
        '피칭 수 늘리기',
      ],
      [
        '감성 키우기',
        '사랑받는 사람',
        '철저한 계획성',
        '감사하는 마음',
        '바른 예의',
        '타인 배려',
        '신뢰받는 사람',
        '꾸준한 지속력',
      ],
      [
        '먼저 인사하기',
        '쓰레기 줍기',
        '부실 청소하기',
        '도구 아껴쓰기',
        '심판 존중하기',
        '긍정적 사고',
        '응원받는 태도',
        '꾸준히 책 읽기',
      ],
      [
        '카운트 구종',
        '포크볼 완성',
        '슬라이더 각도',
        '좌타자 결정구',
        '유인구 제구',
        '깊은 낙차',
        '직구와 같은 폼',
        '완급 조절',
      ],
    ],
  },
  {
    id: 'frontend-master',
    name: '프론트엔드 이도류 개발자',
    badge: 'DEV CAREER',
    description:
      'UI/UX 연출력(투수)과 탄탄한 엔지니어링 아키텍처(타자)를 겸비한 올라운더 개발자로 성장하기 위한 81칸 로드맵입니다.',
    coreGoal: '대체불가 프론트엔드 엔지니어',
    subGoals: [
      'TypeScript·코어',
      '모던 웹 UI/모션',
      '성능 최적화',
      '사이드 프로젝트',
      '아키텍처·설계',
      '기술 블로그·공유',
      '건강·체력관리',
      '개발 습관·운',
    ],
    outerActions: [
      [
        'Zero Any 원칙',
        '제네릭 마스터',
        '브라우저 렌더링',
        '이벤트 루프 심화',
        '타입 가드 패턴',
        '스키마 검증',
        '최신 ES 스펙',
        '메모리 누수 분석',
      ],
      [
        '스크롤 애니메이션',
        'Canvas 60fps',
        '웹 접근성(a11y)',
        '반응형 그리드',
        '마이크로 인터랙션',
        '디자인 시스템',
        '모션 감소 대응',
        '다크모드 설계',
      ],
      [
        'LCP 2.5초 이내',
        '번들 사이즈 감량',
        '이미지 최적화',
        '렌더링 병목 제거',
        '캐싱 전략 수립',
        'Core Web Vitals',
        '코드 스플리팅',
        '네트워크 워터폴',
      ],
      [
        '하고만달 런칭',
        '실사용자 피드백',
        '매주 3회 커밋',
        '오픈소스 기여',
        '기획부터 배포까지',
        '자동화 테스트',
        'CI/CD 파이프라인',
        '포트폴리오 정리',
      ],
      [
        '공통 컴포넌트화',
        '상태관리 분리',
        '폴더 구조 표준화',
        '관심사 분리',
        '확장 가능한 훅',
        '에러 바운더리',
        '클린 코드 리뷰',
        '문서화 습관',
      ],
      [
        '월 2편 기술글',
        '트러블슈팅 기록',
        '스터디 발표',
        '깃허브 프로필',
        '배운 점 요약',
        '콘퍼런스 참석',
        '코드 리뷰 경청',
        '동료 온보딩 돕기',
      ],
      [
        '주 3회 운동',
        '거북목 스트레칭',
        '7시간 숙면',
        '물 2L 마시기',
        '눈 피로 휴식',
        '코어 근육 강화',
        '카페인 조절',
        '산책으로 환기',
      ],
      [
        '버려진 코드 정리',
        '이슈 선제 대응',
        '동료에게 감사 인사',
        '일정 약속 지키기',
        '긍정적 피드백',
        '매일 30분 독서',
        '데스크 정돈',
        '작은 성취 기록',
      ],
    ],
  },
  {
    id: 'godsaeng-starter',
    name: '2026 갓생 루틴 메이커',
    badge: 'LIFE DESIGN',
    description:
      '막연한 새해 다짐 대신 오늘 당장 체크할 수 있는 64개의 생활 밀착형 습관으로 채운 자기계발 만다라트입니다.',
    coreGoal: '나만의 갓생 시스템 완성',
    subGoals: [
      '탄탄한 체력',
      '커리어 점프',
      '스마트 재테크',
      '단단한 멘탈',
      '지적 성장',
      '좋은 인간관계',
      '생활 환경 정돈',
      '행운을 부르는 습관',
    ],
    outerActions: [
      [
        '주 3회 유산소',
        '근력 운동 40분',
        '아침 스트레칭',
        '단백질 챙겨먹기',
        '야식 줄이기',
        '계단 이용하기',
        '정기 건강검진',
        '일정한 기상시간',
      ],
      [
        '핵심 역량 1시간',
        '업무 회고 노션',
        '사이드 프로젝트',
        '외국어 20분',
        '업계 트렌드 읽기',
        '포트폴리오 갱신',
        '우선순위 집중',
        '데드라인 준수',
      ],
      [
        '가계부 주간점검',
        '선저축 후지출',
        '구독 서비스 정리',
        '투자 공부 30분',
        '충동구매 멈추기',
        '비상금 통장',
        '경제 뉴스 요약',
        '월간 자산 체크',
      ],
      [
        '일희일비 않기',
        '하루 5분 명상',
        '감정 일기 쓰기',
        '남과 비교 금지',
        '충분한 휴식',
        '디지털 디톡스',
        '실패에서 배우기',
        '나 자신 칭찬',
      ],
      [
        '월 2권 완독',
        '밑줄 문장 기록',
        '전시회·공연 관람',
        '새로운 툴 배우기',
        '글쓰기 주 1회',
        '강의 1개 완강',
        '질문 노트 작성',
        '지식 카드 정리',
      ],
      [
        '먼저 밝게 인사',
        '경청하는 태도',
        '감사 표현하기',
        '약속 10분 전 도착',
        '가족 안부 전화',
        '좋은 자극 모임',
        '칭찬 아끼지 않기',
        '예의 바른 소통',
      ],
      [
        '아침 이불 정리',
        '책상 위 비우기',
        '안 쓰는 물건 정리',
        '방 환기 10분',
        '설거지 바로 하기',
        '옷장 계절 정리',
        '작업 공간 조명',
        '식물 돌보기',
      ],
      [
        '길거리 쓰레기 줍기',
        '바른 자세 유지',
        '웃는 표정 연습',
        '물건 소중히 쓰기',
        '긍정적인 말투',
        '작은 선행 실천',
        '오늘의 감사 3개',
        '만다라트 매일 점검',
      ],
    ],
  },
  {
    id: 'blank-canvas',
    name: '빈 캔버스 (직접 설계하기)',
    badge: 'CUSTOM',
    description:
      '중앙의 핵심 목표 1칸부터 시작해 나만의 8대 세부 목표와 64개 실천 과제를 자유롭게 채워보세요.',
    coreGoal: '이루고 싶은 단 하나의 핵심 목표',
    subGoals: [
      '세부 목표 1',
      '세부 목표 2',
      '세부 목표 3',
      '세부 목표 4',
      '세부 목표 5',
      '세부 목표 6',
      '세부 목표 7',
      '세부 목표 8',
    ],
    outerActions: [
      ['실천 1-1', '실천 1-2', '실천 1-3', '실천 1-4', '실천 1-5', '실천 1-6', '실천 1-7', '실천 1-8'],
      ['실천 2-1', '실천 2-2', '실천 2-3', '실천 2-4', '실천 2-5', '실천 2-6', '실천 2-7', '실천 2-8'],
      ['실천 3-1', '실천 3-2', '실천 3-3', '실천 3-4', '실천 3-5', '실천 3-6', '실천 3-7', '실천 3-8'],
      ['실천 4-1', '실천 4-2', '실천 4-3', '실천 4-4', '실천 4-5', '실천 4-6', '실천 4-7', '실천 4-8'],
      ['실천 5-1', '실천 5-2', '실천 5-3', '실천 5-4', '실천 5-5', '실천 5-6', '실천 5-7', '실천 5-8'],
      ['실천 6-1', '실천 6-2', '실천 6-3', '실천 6-4', '실천 6-5', '실천 6-6', '실천 6-7', '실천 6-8'],
      ['실천 7-1', '실천 7-2', '실천 7-3', '실천 7-4', '실천 7-5', '실천 7-6', '실천 7-7', '실천 7-8'],
      ['실천 8-1', '실천 8-2', '실천 8-3', '실천 8-4', '실천 8-5', '실천 8-6', '실천 8-7', '실천 8-8'],
    ],
  },
];

const BLOCK_COLOR_PALETTE: string[] = [
  'sky',
  'cyan',
  'indigo',
  'purple',
  'amber', // center core block
  'rose',
  'orange',
  'emerald',
  'blue',
];

/**
 * Outer block indices in the 3x3 macro grid:
 * 0, 1, 2
 * 3, [4=CORE], 5
 * 6, 7, 8
 * Maps outer index (0..7) to macro block index (0..8 excluding 4)
 */
export const OUTER_TO_MACRO_BLOCK_INDEX: number[] = [0, 1, 2, 3, 5, 6, 7, 8];

export const buildMandalartBlocksFromTemplate = (
  template: MandalartTemplate
): MandalartBlockData[] => {
  const blocks: MandalartBlockData[] = Array.from({ length: 9 }, (_, blockIndex) => ({
    id: `block-${blockIndex}`,
    blockIndex,
    title: '',
    categoryColor: BLOCK_COLOR_PALETTE[blockIndex] ?? 'sky',
    cells: Array.from({ length: 9 }, () => ''),
    completedCells: Array.from({ length: 9 }, () => false),
  }));

  // Populate center core block (blockIndex = 4)
  const coreCells: string[] = [
    template.subGoals[0],
    template.subGoals[1],
    template.subGoals[2],
    template.subGoals[3],
    template.coreGoal,
    template.subGoals[4],
    template.subGoals[5],
    template.subGoals[6],
    template.subGoals[7],
  ];

  blocks[4] = {
    id: 'block-4',
    blockIndex: 4,
    title: template.coreGoal,
    categoryColor: 'amber',
    cells: coreCells,
    completedCells: Array.from({ length: 9 }, () => false),
  };

  // Populate 8 outer blocks
  OUTER_TO_MACRO_BLOCK_INDEX.forEach((macroBlockIdx, outerIdx) => {
    const subGoal = template.subGoals[outerIdx] ?? `세부 목표 ${outerIdx + 1}`;
    const actions = template.outerActions[outerIdx];
    const cells: string[] = [
      actions[0],
      actions[1],
      actions[2],
      actions[3],
      subGoal,
      actions[4],
      actions[5],
      actions[6],
      actions[7],
    ];

    blocks[macroBlockIdx] = {
      id: `block-${macroBlockIdx}`,
      blockIndex: macroBlockIdx,
      title: subGoal,
      categoryColor: BLOCK_COLOR_PALETTE[macroBlockIdx] ?? 'sky',
      cells,
      completedCells: Array.from({ length: 9 }, (_, cellIdx) =>
        template.id === 'ohtani-highschool' ? cellIdx === 1 || cellIdx === 6 : false
      ),
    };
  });

  return blocks;
};
