import { http, HttpResponse } from 'msw';

import { events as defaultEvents } from '../__mocks__/response/events.json';
import { Event } from '../types';

/**
 * 테스트용 MSW 핸들러 팩토리
 *
 * @description
 * chapter1-1의 검증된 패턴 사용:
 * - 핸들러 배열 반환 (server.use() 직접 호출 X)
 * - 클로저로 독립적인 events 배열 관리
 * - 테스트 격리 보장
 */

const generateId = () => String(Date.now());
const findEventIndex = (events: Event[], id: string) => events.findIndex((e) => e.id === id);
const notFoundResponse = () => HttpResponse.json({ error: 'Event not found' }, { status: 404 });

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
