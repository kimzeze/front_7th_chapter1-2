import { Event, EventForm, RepeatType } from '../types';

const MAX_DATE = '2025-12-31';

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

    case 'monthly': {
      const originalDay = currentDate.getDate();
      const maxDate = new Date(MAX_DATE);
      let next = new Date(currentDate);

      // 다음 유효한 날짜를 찾을 때까지 반복
      while (true) {
        // 다음 달로 이동
        const currentMonth = next.getMonth();
        const currentYear = next.getFullYear();

        // 다음 달의 같은 날짜로 설정 시도
        next.setMonth(currentMonth + 1);
        next.setDate(originalDay);

        // 월이 예상보다 더 증가했다면 (날짜가 overflow되어 다음 달로 넘어감)
        // 예: 2월 31일 → 3월 3일이 되면 month가 2가 아니라 3이 됨
        const expectedMonth = (currentMonth + 1) % 12;
        if (next.getMonth() !== expectedMonth) {
          // 의도한 달로 돌아가서 다시 시도
          next = new Date(currentYear, currentMonth + 1, 1);
          continue;
        }

        // MAX_DATE 초과하면 null 반환
        if (next > maxDate) {
          return null;
        }

        // 날짜가 일치하면 반환
        if (next.getDate() === originalDay) {
          return next;
        }
      }
    }

    case 'yearly': {
      const next = new Date(currentDate);
      next.setFullYear(next.getFullYear() + 1);
      return next;
    }

    default:
      return null;
  }
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
