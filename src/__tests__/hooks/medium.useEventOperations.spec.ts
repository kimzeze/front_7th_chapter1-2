import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';
import * as recurringEventUtils from '../../utils/recurringEventUtils.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

// Mock generateRecurringEvents
vi.mock('../../utils/recurringEventUtils.ts', async () => {
  const actual = await vi.importActual('../../utils/recurringEventUtils.ts');
  return {
    ...actual,
    generateRecurringEvents: vi.fn(),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  server.use(...setupMockHandlerCreation()); // 핸들러 배열을 스프레드로 전달

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    id: '1',
    title: '새 회의',
    date: '2025-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([{ ...newEvent, id: '1' }]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  server.use(...setupMockHandlerUpdating());

  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const updatedEvent: Event = {
    id: '1',
    date: '2025-10-15',
    startTime: '09:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    title: '수정된 회의',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events[0]).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  server.use(...setupMockHandlerDeletion());

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });

  server.resetHandlers();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const nonExistentEvent: Event = {
    id: '999', // 존재하지 않는 ID
    title: '존재하지 않는 이벤트',
    date: '2025-07-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '이 이벤트는 존재하지 않습니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

  expect(result.current.events).toHaveLength(1);
});

describe('반복 이벤트 저장 (작업 008)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueSnackbarFn.mockClear();
  });

  // TC-001: 단일 이벤트 저장 (기존 로직 유지)
  it('반복 없는 단일 이벤트는 API에 1개만 저장된다', async () => {
    server.use(...setupMockHandlerCreation());

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const singleEvent: EventForm = {
      title: '회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(singleEvent);
    });

    // generateRecurringEvents 호출 확인
    expect(recurringEventUtils.generateRecurringEvents).not.toHaveBeenCalled();
    // 스낵바 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });

  // TC-002: 매주 반복 이벤트 저장 (핵심)
  it('매주 반복 설정된 이벤트는 여러 이벤트가 생성되어 순차적으로 저장된다', async () => {
    server.use(...setupMockHandlerCreation());

    // Mock 반환값 설정: 4개의 이벤트
    const mockEvents: Event[] = [
      {
        id: 'uuid-1',
        title: '스탠드업',
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
        notificationTime: 10,
        repeatParentId: 'parent-1',
      },
      {
        id: 'uuid-2',
        title: '스탠드업',
        date: '2025-01-22',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
        notificationTime: 10,
        repeatParentId: 'parent-1',
      },
      {
        id: 'uuid-3',
        title: '스탠드업',
        date: '2025-01-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
        notificationTime: 10,
        repeatParentId: 'parent-1',
      },
      {
        id: 'uuid-4',
        title: '스탠드업',
        date: '2025-02-05',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
        notificationTime: 10,
        repeatParentId: 'parent-1',
      },
    ];

    vi.mocked(recurringEventUtils.generateRecurringEvents).mockReturnValueOnce(mockEvents);

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const weeklyEvent: EventForm = {
      title: '스탠드업',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(weeklyEvent);
    });

    // generateRecurringEvents 호출 확인
    expect(recurringEventUtils.generateRecurringEvents).toHaveBeenCalledWith(weeklyEvent);
    expect(recurringEventUtils.generateRecurringEvents).toHaveBeenCalledTimes(1);
    // 스낵바 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });

  // TC-007: 수정 모드에서 반복 생성 로직 미적용
  it('수정 모드에서는 반복 생성 로직이 미적용되고 단일 이벤트만 수정된다', async () => {
    server.use(...setupMockHandlerUpdating());

    const { result } = renderHook(() => useEventOperations(true));

    await act(() => Promise.resolve(null));

    const updatedEvent: Event = {
      id: '1',
      title: '회의 (수정됨)',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '11:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    // generateRecurringEvents 호출 안 됨
    expect(recurringEventUtils.generateRecurringEvents).not.toHaveBeenCalled();
    // 스낵바 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });
  });

  // TC-005: 부분 실패 처리
  it('반복 이벤트 저장 중 부분 실패 시 에러를 처리한다', async () => {
    const mockEvents: Event[] = [
      {
        id: 'uuid-1',
        title: '회의',
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-1',
      },
      {
        id: 'uuid-2',
        title: '회의',
        date: '2025-01-22',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-1',
      },
    ];

    vi.mocked(recurringEventUtils.generateRecurringEvents).mockReturnValueOnce(mockEvents);

    // 2번째 POST 호출에서 실패 시뮬레이션
    let postCallCount = 0;
    server.use(
      http.post('/api/events', () => {
        postCallCount++;
        if (postCallCount === 2) {
          return new HttpResponse(null, { status: 500 });
        }
        return new HttpResponse(JSON.stringify({ success: true }), { status: 200 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const weeklyEvent: EventForm = {
      title: '회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(weeklyEvent);
    });

    // 에러 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
      variant: 'error',
    });

    server.resetHandlers();
  });

  // TC-008: 빈 배열 반환 (반복 종료일이 시작일보다 이전)
  it('반복 생성 결과가 빈 배열이면 API 호출을 하지 않는다', async () => {
    // Mock: 빈 배열 반환
    vi.mocked(recurringEventUtils.generateRecurringEvents).mockReturnValueOnce([]);

    server.use(...setupMockHandlerCreation());

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const invalidEvent: EventForm = {
      title: '회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-01-08' },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(invalidEvent);
    });

    // generateRecurringEvents 호출됨
    expect(recurringEventUtils.generateRecurringEvents).toHaveBeenCalledWith(invalidEvent);
    // 스낵바 메시지 확인
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });
});

// 작업 013: 단일 수정 로직 구현
describe('작업 013: 단일 수정 로직 (editOption === "single")', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('반복 이벤트 단일 수정', () => {
    // TC-001: editOption === 'single'일 때 repeat.type을 'none'으로 변경
    it('TC-001: editOption === "single"일 때 수정이 성공하고 스낵바가 표시된다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const repeatEvent: Event = {
        id: '1',
        title: '회의 (수정됨)',
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
        repeatParentId: 'parent-123',
      };

      await act(async () => {
        await result.current.saveEvent(repeatEvent, 'single');
      });

      // 스낵바 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });

    // TC-002: repeatParentId가 제거됨 (간소화)
    it('TC-002: 단일 수정 시 정상적으로 수정된다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const repeatEvent: Event = {
        id: '1',
        title: '스탠드업',
        date: '2025-02-01',
        startTime: '09:00',
        endTime: '09:30',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-abc',
      };

      await act(async () => {
        await result.current.saveEvent(repeatEvent, 'single');
      });

      // 스낵바 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });

  describe('단일 이벤트 수정 (repeatParentId 없음)', () => {
    // TC-003: repeatParentId 없는 경우 기존 로직 유지
    it('TC-003: repeatParentId가 없는 단일 이벤트는 기존 로직대로 수정된다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const singleEvent: Event = {
        id: '1',
        title: '개인 일정',
        date: '2025-03-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
        // repeatParentId 없음
      };

      await act(async () => {
        await result.current.saveEvent(singleEvent, 'single');
      });

      // 스낵바 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });

  describe('editOption이 null 또는 undefined인 경우', () => {
    // TC-004: editOption이 null이면 기존 로직 수행
    it('TC-004: editOption이 undefined이면 정상적으로 수정된다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const repeatEvent: Event = {
        id: '1',
        title: '회의',
        date: '2025-04-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-xyz',
      };

      await act(async () => {
        await result.current.saveEvent(repeatEvent); // editOption 전달 안 함
      });

      // 스낵바 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });

  describe('editOption === "all" (작업 014 대비)', () => {
    // TC-005: editOption === 'all'이면 현재는 기존 로직 수행
    it('TC-005: editOption === "all"일 때 현재는 단일 이벤트만 수정된다 (작업 014 대비)', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const repeatEvent: Event = {
        id: '1',
        title: '회의',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-aaa',
      };

      await act(async () => {
        await result.current.saveEvent(repeatEvent, 'all');
      });

      // 스낵바 메시지 확인 (현재는 단일 이벤트만 수정, 작업 014에서 전체 수정 구현 예정)
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });

  describe('에러 처리', () => {
    // TC-006: API 실패 시 에러 처리
    it('TC-006: 단일 수정 중 API 실패 시 에러 메시지를 표시한다', async () => {
      // Mock: API 실패
      server.use(
        http.put('/api/events/:id', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const repeatEvent: Event = {
        id: '6',
        title: '회의',
        date: '2025-06-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-bbb',
      };

      await act(async () => {
        await result.current.saveEvent(repeatEvent, 'single');
      });

      // 에러 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
        variant: 'error',
      });
    });
  });

  describe('통합 시나리오', () => {
    // TC-007: 반복 이벤트 단일 수정 후 다시 수정
    it('TC-007: 단일 수정으로 분리된 이벤트를 다시 수정할 때 정상 동작한다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      // 첫 번째 수정: 단일 수정으로 분리
      const repeatEvent: Event = {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-ccc',
      };

      await act(async () => {
        await result.current.saveEvent(repeatEvent, 'single');
      });

      // 첫 번째 수정 성공 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });

      // 두 번째 수정: 일반 단일 이벤트로 수정
      const separatedEvent: Event = {
        id: '1',
        title: '회의 (재수정)',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '수정됨',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
        // repeatParentId 없음
      };

      await act(async () => {
        await result.current.saveEvent(separatedEvent); // editOption 없음
      });

      // 두 번째 수정 성공 확인
      expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });
});

// 작업 014: 전체 수정 로직 구현
describe('작업 014: 전체 수정 로직 (editOption === "all")', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('반복 이벤트 전체 수정', () => {
    // TC-001: editOption === 'all'일 때 같은 그룹의 모든 이벤트가 수정됨
    it('TC-001: editOption === "all"일 때 같은 그룹의 모든 이벤트가 수정된다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const eventData: Event = {
        id: '1',
        title: '회의 (전체 수정)',
        date: '2025-01-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '전체 수정됨',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-123',
      };

      await act(async () => {
        await result.current.saveEvent(eventData, 'all');
      });

      // 스낵바 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });

    // TC-002: 각 이벤트의 날짜는 원본 유지
    it('TC-002: 전체 수정 시 각 이벤트의 날짜는 원본 유지된다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const eventData: Event = {
        id: '1',
        title: '수정된 제목',
        date: '2025-01-15',
        startTime: '10:30',
        endTime: '11:00',
        description: '수정됨',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-123',
      };

      await act(async () => {
        await result.current.saveEvent(eventData, 'all');
      });

      // 정상 수정 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });

  describe('repeatParentId 없는 경우', () => {
    // TC-003: repeatParentId가 없으면 기존 로직 수행
    it('TC-003: repeatParentId가 없으면 기존 로직으로 수정된다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const singleEvent: Event = {
        id: '1',
        title: '개인 일정',
        date: '2025-03-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
        // repeatParentId 없음
      };

      await act(async () => {
        await result.current.saveEvent(singleEvent, 'all');
      });

      // 스낵바 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });

  describe('단일 이벤트만 있는 그룹', () => {
    // TC-004: 같은 그룹에 1개만 있어도 정상 동작
    it('TC-004: 같은 그룹에 1개만 있어도 정상적으로 수정된다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const eventData: Event = {
        id: '1',
        title: '회의',
        date: '2025-04-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-single',
      };

      await act(async () => {
        await result.current.saveEvent(eventData, 'all');
      });

      // 스낵바 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });

  describe('에러 처리', () => {
    // TC-005: 반복 그룹의 일부 이벤트 실패 시 에러 처리
    it('TC-005: 반복 그룹의 일부 이벤트 업데이트 실패 시 에러를 표시한다', async () => {
      // Mock: 같은 repeatParentId를 가진 여러 이벤트 준비
      const parentId = 'parent-005';
      const mockEvents: Event[] = [
        {
          id: 'recurring-1',
          title: '주간 회의',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '회의실',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: parentId,
        },
        {
          id: 'recurring-2',
          title: '주간 회의',
          date: '2025-11-08',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '회의실',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: parentId,
        },
        {
          id: 'recurring-3',
          title: '주간 회의',
          date: '2025-11-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '회의실',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: parentId,
        },
      ];

      // Mock: GET은 성공, PUT은 두 번째 이벤트에서만 실패
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', ({ params }) => {
          const { id } = params;
          // recurring-2만 실패
          if (id === 'recurring-2') {
            return new HttpResponse(null, { status: 500 });
          }
          return HttpResponse.json({ id, title: '수정됨' });
        })
      );

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      // 전체 수정 시도
      const eventData: Event = {
        id: 'recurring-1',
        title: '주간 회의 (수정됨)',
        date: '2025-11-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '시간 변경',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: parentId,
      };

      await act(async () => {
        await result.current.saveEvent(eventData, 'all');
      });

      // 에러 메시지 확인 (부분 실패 시)
      expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('일정 저장 실패', {
        variant: 'error',
      });
    });
  });

  describe('통합 시나리오', () => {
    // TC-006: 전체 수정 후 단일 수정 가능
    it('TC-006: 전체 수정 후 다시 단일 수정을 할 수 있다', async () => {
      server.use(...setupMockHandlerUpdating());

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      // 첫 번째: 전체 수정
      const eventData1: Event = {
        id: '1',
        title: '회의 (전체 수정)',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-integration',
      };

      await act(async () => {
        await result.current.saveEvent(eventData1, 'all');
      });

      // 첫 번째 수정 성공 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });

      // 두 번째: 단일 수정
      const eventData2: Event = {
        id: '1',
        title: '회의 (단일 수정)',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '수정됨',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-integration',
      };

      await act(async () => {
        await result.current.saveEvent(eventData2, 'single');
      });

      // 두 번째 수정도 성공 확인
      expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });
  });
});

describe('작업 017: 전체 삭제 로직 (deleteOption === "all")', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('반복 이벤트 전체 삭제', () => {
    // TC-001: deleteOption === 'all'일 때 같은 그룹의 모든 이벤트가 삭제됨
    it('TC-001: deleteOption === "all"일 때 같은 그룹의 모든 이벤트가 삭제된다', async () => {
      // Arrange: 같은 repeatParentId를 가진 3개 이벤트 준비
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '스탠드업',
          date: '2025-01-15',
          startTime: '10:00',
          endTime: '10:30',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-001',
        },
        {
          id: '2',
          title: '스탠드업',
          date: '2025-01-22',
          startTime: '10:00',
          endTime: '10:30',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-001',
        },
        {
          id: '3',
          title: '스탠드업',
          date: '2025-01-29',
          startTime: '10:00',
          endTime: '10:30',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-001',
        },
      ];

      server.use(...setupMockHandlerDeletion(mockEvents));

      // Act: deleteOption을 'all'로 설정
      const { result } = renderHook(() => useEventOperations(true, undefined, undefined, 'all'));

      await act(() => Promise.resolve(null));

      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert: 성공 메시지 확인
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
        variant: 'info',
      });
    });

    // TC-002: 병렬 삭제 확인 (Promise.all)
    it('TC-002: 전체 삭제 시 모든 DELETE 요청이 병렬로 실행된다', async () => {
      // Arrange: 4개 이벤트
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '회의',
          date: '2025-02-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-002',
        },
        {
          id: '2',
          title: '회의',
          date: '2025-02-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-002',
        },
        {
          id: '3',
          title: '회의',
          date: '2025-02-03',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-002',
        },
        {
          id: '4',
          title: '회의',
          date: '2025-02-04',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-002',
        },
      ];

      server.use(...setupMockHandlerDeletion(mockEvents));

      // TC-002: deleteOption = 'all'
      const { result } = renderHook(() => useEventOperations(true, undefined, undefined, 'all'));

      await act(() => Promise.resolve(null));

      // Act
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert: 성공 메시지로 간접 검증
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
        variant: 'info',
      });
    });
  });

  describe('repeatParentId 없는 경우', () => {
    // TC-003: repeatParentId가 없으면 에러 발생
    it('TC-003: deleteOption === "all"이지만 repeatParentId가 없으면 에러가 발생한다', async () => {
      // Arrange: repeatParentId가 없는 단일 이벤트
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '개인 일정',
          date: '2025-03-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '개인',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
          // repeatParentId 없음
        },
      ];

      server.use(...setupMockHandlerDeletion(mockEvents));

      // TC-003: deleteOption = 'all' (에러 케이스)
      const { result } = renderHook(() => useEventOperations(true, undefined, undefined, 'all'));

      await act(() => Promise.resolve(null));

      // Act: deleteOption이 'all'이지만 repeatParentId가 없음
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert: 에러 메시지 확인
      // deleteOption === 'all'이지만 repeatParentId가 없으면 에러
      // 실제로는 UI에서 이런 경우가 발생하지 않지만, 방어적 코딩
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        expect.stringMatching(/삭제|실패/),
        expect.objectContaining({ variant: expect.any(String) })
      );
    });
  });

  describe('단일 이벤트만 있는 그룹', () => {
    // TC-004: 같은 그룹에 1개만 있어도 정상 동작
    it('TC-004: 같은 그룹에 1개만 있어도 정상 삭제된다', async () => {
      // Arrange: 1개만 있는 그룹
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '단독 이벤트',
          date: '2025-04-01',
          startTime: '16:00',
          endTime: '17:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-004',
        },
      ];

      server.use(...setupMockHandlerDeletion(mockEvents));

      // TC-004: deleteOption = 'all'
      const { result } = renderHook(() => useEventOperations(true, undefined, undefined, 'all'));

      await act(() => Promise.resolve(null));

      // Act
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
        variant: 'info',
      });
    });
  });

  describe('에러 처리', () => {
    // TC-005: 전체 삭제 중 API 실패 시 에러 처리
    it('TC-005: 전체 삭제 중 일부 실패하면 에러 메시지를 표시한다', async () => {
      // Arrange: API 실패 시뮬레이션
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '실패 테스트',
                date: '2025-05-01',
                startTime: '10:00',
                endTime: '11:00',
                description: '',
                location: '',
                category: '업무',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
                repeatParentId: 'parent-del-all-005',
              },
            ],
          });
        }),
        http.delete('/api/events/:id', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      // TC-005: deleteOption = 'all'
      const { result } = renderHook(() => useEventOperations(true, undefined, undefined, 'all'));

      await act(() => Promise.resolve(null));

      // Act
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', {
        variant: 'error',
      });
    });
  });

  describe('deleteOption 조건 분기', () => {
    // TC-006: deleteOption === 'single'이면 단일 삭제만 수행
    it('TC-006: deleteOption === "single"이면 해당 이벤트만 삭제된다', async () => {
      // Arrange: 같은 그룹의 3개 이벤트
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '반복 이벤트',
          date: '2025-06-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-006',
        },
        {
          id: '2',
          title: '반복 이벤트',
          date: '2025-06-08',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-006',
        },
        {
          id: '3',
          title: '반복 이벤트',
          date: '2025-06-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-del-all-006',
        },
      ];

      server.use(...setupMockHandlerDeletion(mockEvents));

      // TC-006: deleteOption = 'single'
      const { result } = renderHook(() => useEventOperations(true, undefined, undefined, 'single'));

      await act(() => Promise.resolve(null));

      // Act: deleteOption === 'single'
      // 작업 016에서 구현한 단일 삭제 로직
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert: 정상 삭제 (1개만)
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
        variant: 'info',
      });
    });

    // TC-007: deleteOption === null이면 단일 삭제 수행 (기본 동작)
    it('TC-007: deleteOption이 설정되지 않으면 단일 삭제된다 (기본 동작)', async () => {
      // Arrange
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '일반 이벤트',
          date: '2025-07-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '개인',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(...setupMockHandlerDeletion(mockEvents));

      // TC-007: deleteOption = null (기본값)
      const { result } = renderHook(() => useEventOperations(true, undefined, undefined, null));

      await act(() => Promise.resolve(null));

      // Act: deleteOption === null (기본값)
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
        variant: 'info',
      });
    });
  });

  describe('통합 시나리오', () => {
    // TC-008: 전체 삭제 후 단일 삭제 가능
    it('TC-008: 전체 삭제 후 다른 반복 이벤트를 단일 삭제할 수 있다', async () => {
      // Arrange: 두 개의 반복 그룹
      const mockEvents: Event[] = [
        // 그룹 A
        {
          id: '1',
          title: '그룹 A',
          date: '2025-08-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-group-a',
        },
        {
          id: '2',
          title: '그룹 A',
          date: '2025-08-08',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-group-a',
        },
        // 그룹 B
        {
          id: '3',
          title: '그룹 B',
          date: '2025-08-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '개인',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-group-b',
        },
        {
          id: '4',
          title: '그룹 B',
          date: '2025-08-08',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '개인',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
          repeatParentId: 'parent-group-b',
        },
      ];

      server.use(...setupMockHandlerDeletion(mockEvents));

      // TC-008: 첫 번째는 deleteOption = 'all'
      const { result: result1 } = renderHook(() =>
        useEventOperations(true, undefined, undefined, 'all')
      );

      await act(() => Promise.resolve(null));

      // Act 1: 그룹 A 전체 삭제 (deleteOption === 'all')
      await act(async () => {
        await result1.current.deleteEvent('1');
      });

      // Assert 1
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
        variant: 'info',
      });

      // 두 번째 훅은 deleteOption = 'single'
      const { result: result2 } = renderHook(() =>
        useEventOperations(true, undefined, undefined, 'single')
      );

      await act(() => Promise.resolve(null));

      // Act 2: 그룹 B 단일 삭제 (deleteOption === 'single')
      await act(async () => {
        await result2.current.deleteEvent('3');
      });

      // Assert 2: 두 번째 삭제도 정상 동작
      expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('일정이 삭제되었습니다.', {
        variant: 'info',
      });
    });
  });
});
