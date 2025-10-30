import { http, HttpResponse } from 'msw';

import { events as defaultEvents } from '../__mocks__/response/events.json';
import { Event } from '../types';

/**
 * 테스트용 MSW 핸들러 팩토리
 *
 * @description
 * 테스트 격리 패턴:
 * - 핸들러 배열 반환 (server.use() 직접 호출 X)
 * - 클로저로 독립적인 events 배열 관리
 * - 각 테스트마다 독립적인 데이터 상태 보장
 */

const generateId = () => String(Date.now());
const findEventIndex = (events: Event[], id: string) => events.findIndex((e) => e.id === id);
const notFoundResponse = () => HttpResponse.json({ error: 'Event not found' }, { status: 404 });

/**
 * 테스트 격리를 위한 Mock 이벤트 리셋
 *
 * @description
 * handlersUtils의 함수들은 클로저로 독립적인 events 배열을 관리하므로,
 * 각 테스트에서 server.use()로 새 핸들러를 설정하면 자동으로 격리됩니다.
 *
 * afterEach에서 server.resetHandlers()만 호출하면 충분합니다.
 */
export const resetMockEvents = () => {
  // handlersUtils의 함수들은 클로저로 독립적인 배열을 사용하므로
  // 실제로 이 함수는 필요하지 않지만, 호환성을 위해 남겨둡니다
  // 각 테스트는 server.use()로 새 핸들러를 생성하므로 자동으로 격리됩니다
};

const createGetHandler = (events: Event[]) => {
  return http.get('/api/events', () => {
    return HttpResponse.json({ events: [...events] });
  });
};

/**
 * 이벤트 생성 테스트용 핸들러
 *
 * @param initEvents 초기 이벤트 배열
 * @returns MSW 핸들러 배열
 */
export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  const events = [...initEvents];

  return [
    createGetHandler(events),

    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      const eventWithId: Event = {
        ...newEvent,
        id: newEvent.id || generateId(),
      };

      events.push(eventWithId);
      return HttpResponse.json(eventWithId, { status: 201 });
    }),
  ];
};

/**
 * 이벤트 수정 테스트용 핸들러
 *
 * @param initEvents 초기 이벤트 배열 (기본값: events.json)
 * @returns MSW 핸들러 배열
 */
export const setupMockHandlerUpdating = (initEvents: Event[] = defaultEvents as Event[]) => {
  const events = [...initEvents];

  return [
    createGetHandler(events),

    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params as { id: string };
      const updatedData = (await request.json()) as Partial<Event>;

      const index = findEventIndex(events, id);
      if (index === -1) {
        return notFoundResponse();
      }

      events[index] = { ...events[index], ...updatedData };
      return HttpResponse.json(events[index]);
    }),
  ];
};

/**
 * 이벤트 삭제 테스트용 핸들러
 *
 * @param initEvents 초기 이벤트 배열 (기본값: events.json)
 * @returns MSW 핸들러 배열
 */
export const setupMockHandlerDeletion = (initEvents: Event[] = defaultEvents as Event[]) => {
  const events = [...initEvents];

  return [
    createGetHandler(events),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params as { id: string };

      const index = findEventIndex(events, id);
      if (index === -1) {
        return notFoundResponse();
      }

      events.splice(index, 1);
      return HttpResponse.json({ success: true });
    }),
  ];
};

// 작업 015용 별칭 (명확성을 위해 유지)
export const setupMockHandlerForDelete = setupMockHandlerDeletion;
