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

describe('generateRecurringEvents - 윤년 2월 29일 매년 반복 엣지 케이스', () => {
  const createBaseEvent = (overrides: Partial<EventForm> = {}): EventForm => ({
    title: '테스트 이벤트',
    date: '2024-02-29',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: {
      type: 'yearly',
      interval: 1,
    },
    notificationTime: 10,
    ...overrides,
  });

  it('윤년 2월 29일 매년 반복: MAX_DATE 제한으로 1개만 생성', () => {
    // Given: 2024-02-29(윤년), 다음 윤년은 2028(MAX_DATE 초과)
    const baseEvent = createBaseEvent({
      date: '2024-02-29',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2030-12-31',
      },
    });

    // When
    const result = generateRecurringEvents(baseEvent);

    // Then
    // 1. 개수: 2024만 (다음 윤년 2028은 MAX_DATE 초과)
    expect(result).toHaveLength(1);

    // 2. 패턴: 2월 29일만
    result.forEach((event) => {
      const [, month, day] = event.date.split('-');
      expect(month).toBe('02');
      expect(day).toBe('29');
    });

    // 3. 경계값
    expect(result[0].date).toBe('2024-02-29');
  });

  it('평년 2월 28일 매년 반복: 모든 해에 생성', () => {
    // Given: 2024-02-28, 2025도 28일까지는 존재
    const baseEvent = createBaseEvent({
      date: '2024-02-28',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2026-12-31',
      },
    });

    // When
    const result = generateRecurringEvents(baseEvent);

    // Then
    // 1. 개수: 2024, 2025 (2개, MAX_DATE가 2025-12-31이므로 2026은 생성 안 됨)
    expect(result).toHaveLength(2);

    // 2. 패턴: 모든 날짜가 02-28
    result.forEach((event) => {
      const [, month, day] = event.date.split('-');
      expect(month).toBe('02');
      expect(day).toBe('28');
    });

    // 3. 경계값
    expect(result[0].date).toBe('2024-02-28');
    expect(result[1].date).toBe('2025-02-28');
  });

  it('일반 날짜 매년 반복: 기존 동작 유지', () => {
    // Given: 일반 날짜는 윤년 검증 없이 매년 생성
    const baseEvent = createBaseEvent({
      date: '2024-03-15',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2030-12-31',
      },
    });

    // When
    const result = generateRecurringEvents(baseEvent);

    // Then
    // 1. 개수: 2024, 2025 (MAX_DATE 2025-12-31)
    expect(result).toHaveLength(2);

    // 2. 패턴: 모든 날짜가 03-15
    result.forEach((event) => {
      const [, month, day] = event.date.split('-');
      expect(month).toBe('03');
      expect(day).toBe('15');
    });

    // 3. 경계값
    expect(result[0].date).toBe('2024-03-15');
    expect(result[1].date).toBe('2025-03-15');
  });
});

describe('getNextOccurrence - yearly 윤년 엣지 케이스', () => {
  it('2월 29일(윤년)의 다음은 null (다음 윤년 2028이 MAX_DATE 초과)', () => {
    const current = new Date('2024-02-29');
    const next = getNextOccurrence(current, 'yearly');

    // 다음 윤년은 2028이지만 MAX_DATE가 2025-12-31이므로 null
    expect(next).toBeNull();
  });

  it('2월 28일의 다음은 2025-02-28 (일반 동작)', () => {
    const current = new Date('2024-02-28');
    const next = getNextOccurrence(current, 'yearly');

    expect(next).toEqual(new Date('2025-02-28'));
  });

  it('일반 날짜의 다음은 +1년 (일반 동작)', () => {
    const current = new Date('2024-03-15');
    const next = getNextOccurrence(current, 'yearly');

    expect(next).toEqual(new Date('2025-03-15'));
  });
});

// 작업 009: repeatParentId 생성 및 할당 검증
describe('작업 009: repeatParentId 생성 및 할당 (작업 009)', () => {
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

  // ID 형식 검증 헬퍼 함수
  const isValidUUID = (id: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  };

  const isValidTimestampId = (id: string): boolean => {
    return /^\d+-[a-z0-9]+$/.test(id);
  };

  const isValidRepeatParentId = (id: string): boolean => {
    return isValidUUID(id) || isValidTimestampId(id);
  };

  // TC-001: 4개 반복 이벤트 - 모두 동일한 repeatParentId
  it('TC-001: 4개 반복 이벤트는 모두 동일한 repeatParentId를 가짐', () => {
    // Arrange
    const eventForm = createBaseEvent({
      date: '2025-01-15',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
    });

    // Act
    const events = generateRecurringEvents(eventForm);

    // Assert
    expect(events).toHaveLength(4);
    const parentId = events[0].repeatParentId;
    expect(parentId).toBeDefined();
    expect(events[1].repeatParentId).toBe(parentId);
    expect(events[2].repeatParentId).toBe(parentId);
    expect(events[3].repeatParentId).toBe(parentId);
  });

  // TC-002: 3개 반복 이벤트 (매월) - 모두 동일한 repeatParentId
  it('TC-002: 3개 반복 이벤트(매월)는 모두 동일한 repeatParentId를 가짐', () => {
    // Arrange
    const eventForm = createBaseEvent({
      date: '2025-01-15',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-03-15' },
    });

    // Act
    const events = generateRecurringEvents(eventForm);

    // Assert
    expect(events).toHaveLength(3);
    const parentId = events[0].repeatParentId;
    expect(parentId).toBeDefined();
    expect(events.every((e) => e.repeatParentId === parentId)).toBe(true);
  });

  // TC-003: 31개 반복 이벤트 (매일) - 첫 이벤트와 마지막 이벤트의 repeatParentId가 동일
  it('TC-003: 31개 반복 이벤트(매일)의 첫 이벤트와 마지막 이벤트의 repeatParentId가 동일', () => {
    // Arrange
    const eventForm = createBaseEvent({
      date: '2025-01-01',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
    });

    // Act
    const events = generateRecurringEvents(eventForm);

    // Assert
    expect(events).toHaveLength(31);
    expect(events[0].repeatParentId).toBe(events[30].repeatParentId);
  });

  // TC-004: 단일 이벤트 - repeatParentId 없음
  it('TC-004: 단일 이벤트(repeat.type === none)는 repeatParentId가 없음', () => {
    // Arrange
    const eventForm = createBaseEvent({
      date: '2025-01-15',
      repeat: { type: 'none', interval: 1 },
    });

    // Act
    const events = generateRecurringEvents(eventForm);

    // Assert
    expect(events).toHaveLength(1);
    expect(events[0].repeatParentId).toBeUndefined();
  });

  // TC-005: 2개 반복 그룹 - 서로 다른 repeatParentId
  it('TC-005: 2개 반복 그룹은 각각 다른 repeatParentId를 가짐', () => {
    // Arrange
    const eventForm1 = createBaseEvent({
      date: '2025-01-15',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
    });

    const eventForm2 = createBaseEvent({
      date: '2025-03-15',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-04-05' },
    });

    // Act
    const group1Events = generateRecurringEvents(eventForm1);
    const group2Events = generateRecurringEvents(eventForm2);

    // Assert
    expect(group1Events[0].repeatParentId).not.toBe(group2Events[0].repeatParentId);
  });

  // TC-006: 각 이벤트의 id는 고유하지만 repeatParentId는 동일
  it('TC-006: 각 이벤트의 id는 고유하지만 repeatParentId는 동일', () => {
    // Arrange
    const eventForm = createBaseEvent({
      date: '2025-01-15',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
    });

    // Act
    const events = generateRecurringEvents(eventForm);

    // Assert
    // 각 id는 고유
    const ids = events.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);

    // 모든 repeatParentId는 동일
    const parentIds = events.map((e) => e.repeatParentId);
    const uniqueParentIds = new Set(parentIds);
    expect(uniqueParentIds.size).toBe(1);
  });

  // TC-007: repeatParentId 형식 검증 (UUID 또는 Timestamp)
  it('TC-007: repeatParentId는 유효한 UUID 또는 Timestamp 형식', () => {
    // Arrange
    const eventForm = createBaseEvent({
      date: '2025-01-15',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
    });

    // Act
    const events = generateRecurringEvents(eventForm);

    // Assert
    events.forEach((event) => {
      if (event.repeatParentId) {
        expect(isValidRepeatParentId(event.repeatParentId)).toBe(true);
      }
    });
  });

  // TC-008: 1개만 생성되는 반복 (종료일 = 시작일)
  it('TC-008: 시작일과 종료일이 같으면 1개 이벤트 생성, repeatParentId 할당', () => {
    // Arrange
    const eventForm = createBaseEvent({
      date: '2025-01-15',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-01-15' },
    });

    // Act
    const events = generateRecurringEvents(eventForm);

    // Assert
    expect(events).toHaveLength(1);
    expect(events[0].repeatParentId).toBeDefined();
    expect(isValidRepeatParentId(events[0].repeatParentId!)).toBe(true);
  });

  // TC-009: 빈 배열 반환 (종료일이 시작일보다 이전)
  it('TC-009: 종료일이 시작일보다 이전이면 빈 배열 반환', () => {
    // Arrange
    const eventForm = createBaseEvent({
      date: '2025-01-15',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-01-08' },
    });

    // Act
    const events = generateRecurringEvents(eventForm);

    // Assert
    expect(events).toHaveLength(0);
  });
});
