import { Event, EventForm, RepeatType } from '../types';

export const MAX_DATE = '2025-12-31';

/**
 * 반복 일정 인스턴스들을 생성
 *
 * @param baseEvent - 기준 이벤트 (사용자가 입력한 원본 데이터)
 * @returns 생성된 이벤트 배열 (기준 이벤트 포함)
 */
export function generateRecurringEvents(baseEvent: EventForm): Event[] {
  const { repeat } = baseEvent;

  // repeat.type이 'none'이면 단일 이벤트만 반환
  if (repeat.type === 'none') {
    return [
      {
        ...baseEvent,
        id: generateId(),
      },
    ];
  }

  // repeatParentId 생성
  const repeatParentId = generateId();

  // 종료일 설정
  const maxDate = new Date(MAX_DATE);
  const endDate = repeat.endDate ? new Date(repeat.endDate) : maxDate;
  const effectiveEndDate = endDate > maxDate ? maxDate : endDate;

  // 시작일
  const startDate = new Date(baseEvent.date);

  // 종료일이 시작일보다 이전이면 빈 배열 반환
  if (effectiveEndDate < startDate) {
    return [];
  }

  const events: Event[] = [];
  let currentDate = new Date(startDate);

  // 반복 생성 루프
  while (currentDate <= effectiveEndDate) {
    events.push({
      ...baseEvent,
      id: generateId(),
      date: formatDate(currentDate),
      repeatParentId,
    });

    const nextDate = getNextOccurrence(currentDate, repeat.type);
    if (!nextDate || nextDate > effectiveEndDate) {
      break;
    }
    currentDate = nextDate;
  }

  return events;
}

/**
 * 현재 날짜로부터 다음 반복 날짜를 계산
 *
 * @param currentDate - 현재 날짜
 * @param repeatType - 반복 유형
 * @returns 다음 반복 날짜 (계산 가능한 경우) 또는 null
 */
export function getNextOccurrence(currentDate: Date, repeatType: RepeatType): Date | null {
  switch (repeatType) {
    case 'daily': {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      return next;
    }

    case 'weekly': {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      return next;
    }

    case 'monthly':
      return getNextMonthlyOccurrence(currentDate);

    case 'yearly':
      return getNextYearlyOccurrence(currentDate);

    default:
      return null;
  }
}

/**
 * 매월 반복의 다음 발생 날짜를 계산
 *
 * 31일과 같이 일부 달에 없는 날짜의 경우, 해당 날짜가 있는 다음 달을 찾아 반환합니다.
 * 예: 1월 31일 → 2월 건너뜀 → 3월 31일
 *
 * @param currentDate - 현재 날짜
 * @returns 다음 유효한 매월 반복 날짜 또는 null (MAX_DATE 초과 시)
 */
function getNextMonthlyOccurrence(currentDate: Date): Date | null {
  const originalDay = currentDate.getDate();
  const maxDate = new Date(MAX_DATE);
  let next = new Date(currentDate);

  // 다음 유효한 날짜를 찾을 때까지 반복
  while (true) {
    const currentMonth = next.getMonth();
    const currentYear = next.getFullYear();

    // 다음 달로 이동하고 원래 날짜로 설정 시도
    next.setMonth(currentMonth + 1);
    next.setDate(originalDay);

    // 날짜 overflow 감지: 월이 예상보다 더 증가한 경우
    // 예: 1월 31일 → 2월 31일 시도 → 3월 3일로 overflow
    const expectedMonth = (currentMonth + 1) % 12;
    if (next.getMonth() !== expectedMonth) {
      // overflow 발생 시: 의도한 달의 1일로 리셋하고 다음 달 시도
      next = new Date(currentYear, currentMonth + 1, 1);
      continue;
    }

    // MAX_DATE 초과 시 null 반환
    if (next > maxDate) {
      return null;
    }

    // 날짜가 원래 날짜와 일치하면 유효한 날짜 반환
    if (next.getDate() === originalDay) {
      return next;
    }
  }
}

/**
 * 매년 반복의 다음 발생 날짜를 계산
 *
 * 2월 29일(윤년에만 존재)의 경우, 평년을 건너뛰고 다음 윤년을 찾아 반환합니다.
 * 예: 2024-02-29 → 2028-02-29 (2025~2027 평년 건너뜀)
 *
 * @param currentDate - 현재 날짜
 * @returns 다음 유효한 매년 반복 날짜 또는 null (MAX_DATE 초과 시)
 */
function getNextYearlyOccurrence(currentDate: Date): Date | null {
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const maxDate = new Date(MAX_DATE);

  // 2월 29일이 아닌 경우: 일반 동작 (+1년)
  if (!(month === 1 && day === 29)) {
    const next = new Date(currentDate);
    next.setFullYear(next.getFullYear() + 1);
    return next;
  }

  // 2월 29일인 경우: 다음 윤년 찾기
  let year = currentDate.getFullYear() + 1;
  const maxYear = maxDate.getFullYear();

  while (year <= maxYear) {
    if (isLeapYear(year)) {
      const nextLeapDate = new Date(year, 1, 29); // 1 = 2월 (0-indexed)

      // MAX_DATE 초과하면 null 반환
      if (nextLeapDate > maxDate) {
        return null;
      }

      return nextLeapDate;
    }
    year++;
  }

  // 다음 윤년이 MAX_DATE를 초과하면 null 반환
  return null;
}

/**
 * 윤년 여부 판별
 *
 * 윤년 규칙:
 * 1. 4로 나누어떨어지지 않으면 평년
 * 2. 100으로 나누어떨어지지만 400으로 나누어떨어지지 않으면 평년
 * 3. 그 외는 윤년
 *
 * @param year - 연도
 * @returns 윤년이면 true, 평년이면 false
 * @example
 * isLeapYear(2024) // true (4로 나누어떨어짐)
 * isLeapYear(2025) // false (4로 나누어떨어지지 않음)
 * isLeapYear(2100) // false (100으로 나누어떨어지지만 400으로는 안 됨)
 * isLeapYear(2000) // true (400으로 나누어떨어짐)
 */
function isLeapYear(year: number): boolean {
  // 4로 나누어떨어지지 않으면 평년
  if (year % 4 !== 0) return false;

  // 100으로 나누어떨어지지만 400으로 나누어떨어지지 않으면 평년
  if (year % 100 === 0 && year % 400 !== 0) return false;

  // 그 외는 윤년
  return true;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 고유 ID 생성
 */
function generateId(): string {
  // crypto.randomUUID가 있으면 사용, 없으면 fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback: timestamp + random
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
