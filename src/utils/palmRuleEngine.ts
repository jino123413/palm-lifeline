import type { PalmCapture, PalmReadingResult, PalmReadingTier } from '../types';

const TIER_META: Record<
  PalmReadingTier,
  {
    label: string;
    lead: string;
    guides: string[];
  }
> = {
  'strong-vitality': {
    label: '강한 생기형',
    lead: '기본 에너지가 높고 회복 속도가 빠른 흐름이에요.',
    guides: [
      '강한 추진력을 하루 핵심 1가지 일에 먼저 사용해 보세요.',
      '휴식 없이 몰아붙이면 오히려 효율이 떨어질 수 있어요.',
      '주 1회는 의도적으로 비워두는 회복 시간을 확보해 보세요.',
    ],
  },
  'steady-growth': {
    label: '안정 성장형',
    lead: '기복이 적고 꾸준히 결과를 내는 패턴이 강해요.',
    guides: [
      '루틴을 크게 바꾸기보다 작은 단위 개선이 잘 맞아요.',
      '중요 일정은 오전 시간대에 고정해 리듬을 유지해 보세요.',
      '성과 기록을 남기면 다음 주 계획 정확도가 높아져요.',
    ],
  },
  'balanced-explorer': {
    label: '균형 탐색형',
    lead: '새로운 자극과 안정 사이를 균형 있게 찾는 흐름이에요.',
    guides: [
      '새 시도는 짧게 검증하고, 맞는 것만 루틴으로 편입해 보세요.',
      '할 일 리스트를 3개 이하로 줄이면 집중 효율이 올라가요.',
      '하루 종료 전에 내일 우선순위 1개를 미리 정해 두세요.',
    ],
  },
  'recovery-first': {
    label: '회복 우선형',
    lead: '지금은 확장보다 체력·리듬 회복이 우선인 시점이에요.',
    guides: [
      '휴식 슬롯을 일정에 먼저 넣고 나머지 계획을 채워보세요.',
      '과한 멀티태스킹보다 단일 작업 완주가 더 큰 성과를 줘요.',
      '수면·수분·스트레칭을 기본 지표로 관리해 보세요.',
    ],
  },
};

const HEADLINES = [
  '이번 주는 에너지 방향이 선명한 편이에요.',
  '흐름이 한 번 잡히면 탄력이 붙는 타입이에요.',
  '작은 루틴 변화가 전체 컨디션을 크게 바꿔줄 수 있어요.',
  '무리한 확장보다 핵심 집중이 더 높은 결과를 만들어요.',
  '리듬만 맞추면 성과가 안정적으로 쌓이는 흐름이에요.',
];

const SUMMARIES = [
  '손금의 생기선과 보조선 조합이 비교적 뚜렷해요.',
  '중간 지점의 끊김이 적어 장기 리듬이 안정적인 편이에요.',
  '회복 구간 신호가 보여서 휴식 전략이 특히 중요해요.',
  '집중 구간이 짧고 강한 형태라 우선순위 관리가 핵심이에요.',
  '주기적 리셋을 넣으면 전반 점수가 빠르게 개선돼요.',
];

function hashSeed(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

function ranged(hash: number, min: number, max: number, offset: number): number {
  const span = max - min + 1;
  return min + ((hash >> (offset % 16)) % span);
}

function pick<T>(items: T[], hash: number, offset: number): T {
  return items[(hash + offset) % items.length];
}

function decideTier(averageScore: number): PalmReadingTier {
  if (averageScore >= 82) {
    return 'strong-vitality';
  }

  if (averageScore >= 66) {
    return 'steady-growth';
  }

  if (averageScore >= 48) {
    return 'balanced-explorer';
  }

  return 'recovery-first';
}

export function analyzePalmLifeline(capture: PalmCapture): PalmReadingResult {
  const sample = `${capture.id}:${capture.rawDataUri.slice(0, 480)}`;
  const baseHash = hashSeed(sample);

  const vitality = ranged(baseHash, 42, 96, 3);
  const stability = ranged(baseHash, 40, 94, 7);
  const recovery = ranged(baseHash, 38, 97, 11);
  const focus = ranged(baseHash, 41, 95, 13);
  const averageScore = Math.round((vitality + stability + recovery + focus) / 4);

  const tier = decideTier(averageScore);
  const tierMeta = TIER_META[tier];

  const headline = pick(HEADLINES, baseHash, 19);
  const summary = `${tierMeta.lead} ${pick(SUMMARIES, baseHash, 43)}`;

  const highlights = [
    `생기 지표 ${vitality}점: 일 시작 초반 추진력이 좋은 편이에요.`,
    `안정 지표 ${stability}점: 루틴 유지력이 중상 수준으로 보여요.`,
    `회복 지표 ${recovery}점: 휴식 설계가 결과 편차를 줄여줘요.`,
    `집중 지표 ${focus}점: 핵심 1~2개 목표에 몰입할 때 효율이 높아요.`,
  ];

  return {
    generatedAt: Date.now(),
    tier,
    tierLabel: tierMeta.label,
    headline,
    summary,
    scores: {
      vitality,
      stability,
      recovery,
      focus,
    },
    highlights,
    guides: tierMeta.guides,
    disclaimer: '손금 분석은 오락용 참고 콘텐츠이며, 실제 건강/의학적 판단을 대신하지 않아요.',
  };
}
