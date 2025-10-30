import { http, HttpResponse } from 'msw';

import { events as initialEvents } from '../__mocks__/response/events.json';
import { Event } from '../types';

/**
 * MSW 핸들러
 *
 * @description
 * 테스트 격리 패턴:
 * - let mockEvents로 런타임 변경 가능
 * - resetMockEvents()로 각 테스트마다 초기화
 * - server.use()로 테스트별 핸들러 덮어쓰기 가능
 */

let mockEvents: Event[] = [...(initialEvents as Event[])];

const findEventById = (id: string) => mockEvents.findIndex((e) => e.id === id);
const generateId = () => String(Date.now());

/**
 * 테스트 격리를 위한 mockEvents 초기화 함수
 * afterEach에서 호출하여 각 테스트가 독립적으로 실행되도록 보장
 */
export const resetMockEvents = () => {
  mockEvents = [...(initialEvents as Event[])];
};

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    const eventWithId: Event = {
      ...newEvent,
      id: newEvent.id || generateId(),
    };

    mockEvents.push(eventWithId);
    return HttpResponse.json(eventWithId, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params as { id: string };
    const updatedData = (await request.json()) as Partial<Event>;

    const index = findEventById(id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    mockEvents[index] = { ...mockEvents[index], ...updatedData };
    return HttpResponse.json(mockEvents[index]);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params as { id: string };

    const index = findEventById(id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    mockEvents.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),
];
