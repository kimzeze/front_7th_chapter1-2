import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/recurringEventUtils';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  /**
   * 저장 완료 후 공통 처리
   * @param message 스낵바 메시지
   */
  const handleSaveSuccess = async (message: string) => {
    await fetchEvents();
    onSave?.();
    enqueueSnackbar(message, { variant: 'success' });
  };

  /**
   * 반복 이벤트 저장 처리
   * @param eventData 이벤트 폼 데이터
   */
  const saveRepeatingEvent = async (eventData: EventForm) => {
    const recurringEvents = generateRecurringEvents(eventData);

    // 빈 배열인 경우 (예: 종료일이 시작일보다 이전)
    if (recurringEvents.length === 0) {
      await handleSaveSuccess('일정이 추가되었습니다.');
      return;
    }

    // 모든 이벤트를 순차적으로 저장
    for (let i = 0; i < recurringEvents.length; i++) {
      const event = recurringEvents[i];

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Failed to save event ${i + 1}`);
      }
    }

    // 모든 저장 완료 후
    await handleSaveSuccess('일정이 추가되었습니다.');
  };

  /**
   * 단일 이벤트 저장
   * @param eventData 이벤트 데이터
   */
  const saveSingleEvent = async (eventData: Event | EventForm) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error('Failed to save event');
    }

    await handleSaveSuccess('일정이 추가되었습니다.');
  };

  const saveEvent = async (eventData: Event | EventForm, editOption?: 'single' | 'all') => {
    try {
      if (editing) {
        // 수정 모드
        let dataToSave = eventData;

        // 단일 수정: repeat.type을 'none'으로 변경, repeatParentId 제거
        if (editOption === 'single' && (eventData as Event).repeatParentId) {
          const modifiedData: Partial<Event> = {
            ...eventData,
            repeat: { ...eventData.repeat, type: 'none' as const },
          };
          // repeatParentId 제거
          delete modifiedData.repeatParentId;
          dataToSave = modifiedData as Event | EventForm;
        }

        const response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          throw new Error('Failed to save event');
        }

        await handleSaveSuccess('일정이 수정되었습니다.');
      } else {
        // 신규 생성 모드
        const isRepeating = (eventData as EventForm).repeat?.type !== 'none';

        if (isRepeating) {
          // 반복 이벤트 처리
          await saveRepeatingEvent(eventData as EventForm);
        } else {
          // 단일 이벤트 저장 (기존 로직)
          await saveSingleEvent(eventData);
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
