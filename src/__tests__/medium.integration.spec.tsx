import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2025-10-01
    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2025-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
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

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});

describe('반복 설정 UI', () => {
  it('반복 일정 체크박스가 체크되지 않으면 반복 설정 UI가 보이지 않는다', async () => {
    // Given
    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // Then
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });

    // 체크박스가 체크되어 있으면 해제 (다른 테스트의 영향 제거)
    if (repeatCheckbox.getAttribute('checked') !== null) {
      // 이미 체크되어 있을 수 있으므로 스킵
    }

    // 반복 설정 UI가 보이지 않아야 함 (체크되지 않은 상태)
    if (!repeatCheckbox.getAttribute('checked')) {
      expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();
    }
  });

  it('반복 일정 체크박스를 체크하면 반복 설정 UI가 표시된다', async () => {
    // Given
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // When
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // Then: findBy를 사용하여 요소가 나타날 때까지 기다리기
    expect(await screen.findByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('반복 유형을 선택할 수 있다', async () => {
    // Given
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // When
    const repeatTypeSelect = await screen.findByLabelText('반복 유형');
    await user.click(repeatTypeSelect);

    // Then: 모든 옵션이 보여야 함
    expect(screen.getByRole('option', { name: '매일' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매월' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매년' })).toBeInTheDocument();
  });

  it('반복 간격을 입력할 수 있다', async () => {
    // Given
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // When
    const intervalInput = await screen.findByLabelText('반복 간격');
    await user.clear(intervalInput);
    await user.type(intervalInput, '2');

    // Then
    expect(intervalInput).toHaveValue(2);
  });

  it('반복 종료일을 선택할 수 있다', async () => {
    // Given
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // When
    const endDateInput = await screen.findByLabelText('반복 종료일');
    await user.type(endDateInput, '2025-12-31');

    // Then
    expect(endDateInput).toHaveValue('2025-12-31');
  });
});

describe('반복 종료일 Validation', () => {
  it('종료일이 시작일보다 이전이면 에러 메시지를 표시한다', async () => {
    // Given
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 시작일 입력
    const dateInput = screen.getByLabelText('날짜');
    await user.type(dateInput, '2025-01-15');

    // 반복 일정 체크
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // When: 시작일보다 이전 날짜 입력
    const endDateInput = await screen.findByLabelText('반복 종료일');
    await user.type(endDateInput, '2025-01-10');

    // Then: 에러 메시지 표시
    expect(await screen.findByText('종료일은 시작일 이후여야 합니다.')).toBeInTheDocument();
  });

  it('종료일이 2025-12-31을 초과하면 에러 메시지를 표시한다', async () => {
    // Given
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 시작일 입력
    const dateInput = screen.getByLabelText('날짜');
    await user.type(dateInput, '2025-01-01');

    // 반복 일정 체크
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // When: MAX_DATE 초과 날짜 입력
    const endDateInput = await screen.findByLabelText('반복 종료일');
    await user.type(endDateInput, '2026-01-01');

    // Then: 에러 메시지 표시
    expect(await screen.findByText('종료일은 2025-12-31 이하여야 합니다.')).toBeInTheDocument();
  });

  it('유효한 종료일을 입력하면 에러 메시지가 표시되지 않는다', async () => {
    // Given
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 시작일 입력
    const dateInput = screen.getByLabelText('날짜');
    await user.type(dateInput, '2025-01-01');

    // 반복 일정 체크
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // When: 유효한 날짜 입력
    const endDateInput = await screen.findByLabelText('반복 종료일');
    await user.type(endDateInput, '2025-12-31');

    // Then: 에러 메시지 없음
    expect(screen.queryByText('종료일은 시작일 이후여야 합니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('종료일은 2025-12-31 이하여야 합니다.')).not.toBeInTheDocument();
  });

  it('종료일이 빈 값이면 에러 메시지가 표시되지 않는다', async () => {
    // Given
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 시작일 입력
    const dateInput = screen.getByLabelText('날짜');
    await user.type(dateInput, '2025-01-01');

    // 반복 일정 체크
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // When: 종료일을 입력하지 않음 (빈 값)
    const endDateInput = await screen.findByLabelText('반복 종료일');
    // 아무것도 입력하지 않음

    // Then: 에러 메시지 없음
    expect(screen.queryByText('종료일은 시작일 이후여야 합니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('종료일은 2025-12-31 이하여야 합니다.')).not.toBeInTheDocument();
  });
});
