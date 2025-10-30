import { ChangeEvent, useState } from 'react';

import { Event, RepeatType } from '../types';
import { MAX_DATE } from '../utils/recurringEventUtils';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || '업무');
  const [isRepeating, setIsRepeating] = useState(initialEvent?.repeat.type !== 'none');
  const [repeatType, setRepeatType] = useState<RepeatType>(initialEvent?.repeat.type || 'none');
  const [repeatInterval, setRepeatInterval] = useState(initialEvent?.repeat.interval || 1);
  const [repeatEndDate, setRepeatEndDate] = useState(initialEvent?.repeat.endDate || '');
  const [notificationTime, setNotificationTime] = useState(initialEvent?.notificationTime || 10);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const [repeatEndDateError, setRepeatEndDateError] = useState<string | null>(null);

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const validateRepeatEndDate = (endDate: string, startDate: string): string | null => {
    if (!endDate) {
      return null; // 종료일은 선택사항이므로 빈 값은 허용
    }

    if (!startDate) {
      return null; // 시작일이 없으면 검증 불가
    }

    const end = new Date(endDate);
    const start = new Date(startDate);
    const maxDate = new Date(MAX_DATE);

    // 1. 시작일보다 이전 체크
    if (end < start) {
      return '종료일은 시작일 이후여야 합니다.';
    }

    // 2. MAX_DATE 초과 체크
    if (end > maxDate) {
      return `종료일은 ${MAX_DATE} 이하여야 합니다.`;
    }

    return null;
  };

  const handleRepeatEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setRepeatEndDate(newEndDate);

    const error = validateRepeatEndDate(newEndDate, date);
    setRepeatEndDateError(error);
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
    setNotificationTime(10);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    setRepeatType(event.repeat.type);
    setRepeatInterval(event.repeat.interval);
    setRepeatEndDate(event.repeat.endDate || '');
    setNotificationTime(event.notificationTime);
  };

  return {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    repeatEndDateError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    handleRepeatEndDateChange,
    resetForm,
    editEvent,
  };
};
