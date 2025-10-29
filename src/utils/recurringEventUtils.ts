import { Event, EventForm, RepeatType } from '../types';

/**
 * 반복 일정 인스턴스들을 생성
 *
 * @param baseEvent - 기준 이벤트 (사용자가 입력한 원본 데이터)
 * @returns 생성된 이벤트 배열 (기준 이벤트 포함)
 */
export function generateRecurringEvents(baseEvent: EventForm): Event[] {
  // TODO: 구현 필요
  return [];
}

/**
 * 현재 날짜로부터 다음 반복 날짜를 계산
 *
 * @param currentDate - 현재 날짜
 * @param repeatType - 반복 유형
 * @returns 다음 반복 날짜 (계산 가능한 경우) 또는 null
 */
export function getNextOccurrence(currentDate: Date, repeatType: RepeatType): Date | null {
  // TODO: 구현 필요
  return null;
}
