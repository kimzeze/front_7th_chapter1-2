import { EventForm } from '../../types';
import { generateRecurringEvents, getNextOccurrence } from '../../utils/recurringEventUtils';

describe('generateRecurringEvents', () => {
  const createBaseEvent = (overrides: Partial<EventForm> = {}): EventForm => ({
    title: '테스트 이벤트',
    date: '2025-01-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
    ...overrides,
  });

  describe('긍정 케이스 - 기본 반복 생성', () => {
    it('매일 반복: 2025-01-01 ~ 2025-01-05 (5개 생성)', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-02');
      expect(result[2].date).toBe('2025-01-03');
      expect(result[3].date).toBe('2025-01-04');
      expect(result[4].date).toBe('2025-01-05');

      // 모든 이벤트가 같은 repeatParentId를 가짐
      const parentId = result[0].repeatParentId;
      expect(parentId).toBeDefined();
      expect(result.every((e) => e.repeatParentId === parentId)).toBe(true);

      // 각 이벤트는 고유한 id를 가짐
      const ids = result.map((e) => e.id);
      expect(new Set(ids).size).toBe(5);
    });

    it('매주 반복: 2025-01-01 ~ 2025-01-29 (5개 생성)', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-01-01',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-01-29',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-08');
      expect(result[2].date).toBe('2025-01-15');
      expect(result[3].date).toBe('2025-01-22');
      expect(result[4].date).toBe('2025-01-29');
    });

    it('매월 반복: 2025-01-15 ~ 2025-04-15 (4개 생성)', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-01-15',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-04-15',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-01-15');
      expect(result[1].date).toBe('2025-02-15');
      expect(result[2].date).toBe('2025-03-15');
      expect(result[3].date).toBe('2025-04-15');
    });

    it('매년 반복: 2025-06-01만 생성 (MAX_DATE 제한)', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-06-01',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-06-01',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      // 2025-12-31 제한으로 2025년만 생성
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-06-01');
    });
  });

  describe('경계값 케이스', () => {
    it('repeat.type이 none이면 1개만 반환', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-01-01',
        repeat: {
          type: 'none',
          interval: 0,
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[0].id).toBeDefined();
      // repeat.type === 'none'이면 repeatParentId는 없음
    });

    it('endDate가 없으면 2025-12-31까지 생성', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-12-25',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: undefined,
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      expect(result).toHaveLength(7); // 12-25 ~ 12-31 (7일)
      expect(result[0].date).toBe('2025-12-25');
      expect(result[6].date).toBe('2025-12-31');
    });

    it('endDate가 2025-12-31을 초과하면 2025-12-31까지만 생성', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-12-28',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2026-01-05',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      expect(result).toHaveLength(4); // 12-28, 12-29, 12-30, 12-31
      expect(result[3].date).toBe('2025-12-31');
    });

    it('시작일과 종료일이 같으면 1개만 생성', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-01',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-01-01');
    });

    it('종료일이 시작일보다 이전이면 빈 배열 반환', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-01-05',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-01',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      expect(result).toHaveLength(0);
    });
  });

  describe('데이터 무결성', () => {
    it('모든 반복 인스턴스가 동일한 repeatParentId를 가짐', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-03',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      const parentId = result[0].repeatParentId;
      expect(parentId).toBeDefined();
      expect(parentId).not.toBe('');

      result.forEach((event) => {
        expect(event.repeatParentId).toBe(parentId);
      });
    });

    it('각 이벤트는 고유한 id를 가짐', () => {
      // Given
      const baseEvent = createBaseEvent({
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-03',
        },
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      const ids = result.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(result.length);
    });

    it('title, startTime 등 원본 데이터가 모든 인스턴스에 복사됨', () => {
      // Given
      const baseEvent = createBaseEvent({
        title: '팀 미팅',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '중요 회의',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-03',
        },
        notificationTime: 10,
      });

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then
      result.forEach((event) => {
        expect(event.title).toBe('팀 미팅');
        expect(event.startTime).toBe('10:00');
        expect(event.endTime).toBe('11:00');
        expect(event.description).toBe('중요 회의');
        expect(event.location).toBe('회의실 A');
        expect(event.category).toBe('업무');
        expect(event.notificationTime).toBe(10);
      });
    });
  });
});

describe('getNextOccurrence', () => {
  it('daily: 1일 증가', () => {
    const current = new Date('2025-01-01');
    const next = getNextOccurrence(current, 'daily');

    expect(next).toEqual(new Date('2025-01-02'));
  });

  it('weekly: 7일 증가', () => {
    const current = new Date('2025-01-01');
    const next = getNextOccurrence(current, 'weekly');

    expect(next).toEqual(new Date('2025-01-08'));
  });

  it('monthly: 1달 증가', () => {
    const current = new Date('2025-01-15');
    const next = getNextOccurrence(current, 'monthly');

    expect(next).toEqual(new Date('2025-02-15'));
  });

  it('yearly: 1년 증가', () => {
    const current = new Date('2025-06-01');
    const next = getNextOccurrence(current, 'yearly');

    expect(next).toEqual(new Date('2026-06-01'));
  });

  it('none 타입이면 null 반환', () => {
    const current = new Date('2025-01-01');
    const next = getNextOccurrence(current, 'none');

    expect(next).toBeNull();
  });
});

describe('generateRecurringEvents - 31일 매월 반복 엣지 케이스', () => {
  const createBaseEvent = (overrides: Partial<EventForm> = {}): EventForm => ({
    title: '테스트 이벤트',
    date: '2025-01-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
    ...overrides,
  });

  it('31일 매월 반복: 31일이 없는 달(2,4,6,9,11월)을 건너뜀', () => {
    // Given
    const baseEvent = createBaseEvent({
      date: '2025-01-31',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-12-31',
      },
    });

    // When
    const result = generateRecurringEvents(baseEvent);

    // Then
    // 1. 개수: 31일이 있는 달만 생성 (1,3,5,7,8,10,12월 = 7개)
    expect(result).toHaveLength(7);

    // 2. 패턴: 모든 날짜가 31일
    result.forEach((event) => {
      const day = event.date.split('-')[2];
      expect(day).toBe('31');
    });

    // 3. 제외: 31일이 없는 달 확인
    const months = result.map((e) => e.date.split('-')[1]);
    expect(months).not.toContain('02'); // 2월
    expect(months).not.toContain('04'); // 4월
    expect(months).not.toContain('06'); // 6월
    expect(months).not.toContain('09'); // 9월
    expect(months).not.toContain('11'); // 11월

    // 4. 경계값: 첫 번째와 마지막만 확인
    expect(result[0].date).toBe('2025-01-31');
    expect(result[result.length - 1].date).toBe('2025-12-31');
  });

  it('30일 매월 반복: 2월만 건너뜀 (11개 생성)', () => {
    // Given
    const baseEvent = createBaseEvent({
      date: '2025-01-30',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-12-31',
      },
    });

    // When
    const result = generateRecurringEvents(baseEvent);

    // Then
    // 1. 개수: 2월만 제외 (11개)
    expect(result).toHaveLength(11);

    // 2. 패턴: 모든 날짜가 30일
    result.forEach((event) => {
      const day = event.date.split('-')[2];
      expect(day).toBe('30');
    });

    // 3. 제외: 2월 없음
    const months = result.map((e) => e.date.split('-')[1]);
    expect(months).not.toContain('02');

    // 4. 경계값
    expect(result[0].date).toBe('2025-01-30');
    expect(result[result.length - 1].date).toBe('2025-12-30');
  });

  it('29일 매월 반복: 평년(2025)에는 2월 건너뜀 (11개 생성)', () => {
    // Given
    const baseEvent = createBaseEvent({
      date: '2025-01-29',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-12-31',
      },
    });

    // When
    const result = generateRecurringEvents(baseEvent);

    // Then
    // 1. 개수: 평년 2월은 28일까지만이므로 제외 (11개)
    expect(result).toHaveLength(11);

    // 2. 패턴: 모든 날짜가 29일
    result.forEach((event) => {
      const day = event.date.split('-')[2];
      expect(day).toBe('29');
    });

    // 3. 제외: 2월 없음 (28일까지만)
    const months = result.map((e) => e.date.split('-')[1]);
    expect(months).not.toContain('02');

    // 4. 경계값
    expect(result[0].date).toBe('2025-01-29');
    expect(result[result.length - 1].date).toBe('2025-12-29');
  });

  it('28일 매월 반복: 모든 달 생성 (12개)', () => {
    // Given
    const baseEvent = createBaseEvent({
      date: '2025-01-28',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-12-31',
      },
    });

    // When
    const result = generateRecurringEvents(baseEvent);

    // Then
    // 1. 개수: 모든 달이 28일 이상 (12개)
    expect(result).toHaveLength(12);

    // 2. 패턴: 모든 날짜가 28일
    result.forEach((event) => {
      const day = event.date.split('-')[2];
      expect(day).toBe('28');
    });

    // 3. 포함: 2월도 포함 (28일 있음)
    const months = result.map((e) => e.date.split('-')[1]);
    expect(months).toContain('02');

    // 4. 경계값
    expect(result[0].date).toBe('2025-01-28');
    expect(result[result.length - 1].date).toBe('2025-12-28');
  });

  it('31일 매월 반복: 1월~4월 범위에서 2월, 4월 건너뜀', () => {
    // Given
    const baseEvent = createBaseEvent({
      date: '2025-01-31',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-04-30',
      },
    });

    // When
    const result = generateRecurringEvents(baseEvent);

    // Then
    // 1. 개수: 1월, 3월만 (2개)
    expect(result).toHaveLength(2);

    // 2. 패턴: 모든 날짜가 31일
    result.forEach((event) => {
      const day = event.date.split('-')[2];
      expect(day).toBe('31');
    });

    // 3. 제외: 2월, 4월 없음
    const months = result.map((e) => e.date.split('-')[1]);
    expect(months).not.toContain('02');
    expect(months).not.toContain('04');

    // 4. 포함: 1월, 3월만
    expect(months).toEqual(['01', '03']);
  });
});

describe('getNextOccurrence - monthly 엣지 케이스', () => {
  it('1월 31일의 다음은 3월 31일 (2월 건너뜀)', () => {
    const current = new Date('2025-01-31');
    const next = getNextOccurrence(current, 'monthly');

    expect(next).toEqual(new Date('2025-03-31'));
  });

  it('1월 30일의 다음은 3월 30일 (2월 건너뜀)', () => {
    const current = new Date('2025-01-30');
    const next = getNextOccurrence(current, 'monthly');

    expect(next).toEqual(new Date('2025-03-30'));
  });

  it('1월 28일의 다음은 2월 28일 (건너뛰지 않음)', () => {
    const current = new Date('2025-01-28');
    const next = getNextOccurrence(current, 'monthly');

    expect(next).toEqual(new Date('2025-02-28'));
  });

  it('3월 31일의 다음은 5월 31일 (4월 건너뜀)', () => {
    const current = new Date('2025-03-31');
    const next = getNextOccurrence(current, 'monthly');

    expect(next).toEqual(new Date('2025-05-31'));
  });
});
