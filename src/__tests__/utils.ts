import { Event } from '../types';
import { fillZero } from '../utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

/**
 * Factory 패턴: 테스트용 Event 객체 생성
 * - 기본값 제공으로 보일러플레이트 감소
 * - 필요한 필드만 오버라이드 가능
 * - 매번 새로운 객체 생성 (공유 참조 방지)
 */
let eventIdCounter = 1;

export const createMockEvent = (overrides: Partial<Event> = {}): Event => {
  return {
    id: `test-event-${eventIdCounter++}`,
    title: '테스트 이벤트',
    date: '2025-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
    ...overrides,
  };
};

/**
 * Factory: 단일 이벤트 (repeatParentId 없음)
 */
export const createSingleEvent = (overrides: Partial<Event> = {}): Event => {
  return createMockEvent({
    title: '단일 회의',
    ...overrides,
  });
};

/**
 * Factory: 반복 이벤트 (repeatParentId 있음)
 */
export const createRecurringEvent = (
  repeatParentId: string,
  overrides: Partial<Event> = {}
): Event => {
  return createMockEvent({
    title: '주간 회의',
    repeat: { type: 'weekly', interval: 1 },
    repeatParentId,
    ...overrides,
  });
};
