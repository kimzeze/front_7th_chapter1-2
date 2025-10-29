# Story 03: 반복 일정 아이콘 표시

## 사용자 스토리

**As a** 일정 관리 사용자
**I want** 캘린더 뷰와 이벤트 리스트에서 반복 일정에 아이콘이 표시되기를
**So that** 어떤 일정이 반복 일정인지 한눈에 파악할 수 있다

## Acceptance Criteria

- [ ] 반복 일정(repeat.type !== 'none')에는 반복 아이콘이 표시된다
- [ ] 주간 뷰(Week View)의 각 날짜 셀에서 반복 아이콘이 보인다
- [ ] 월간 뷰(Month View)의 각 날짜 셀에서 반복 아이콘이 보인다
- [ ] 오른쪽 이벤트 리스트에서 반복 아이콘이 보인다
- [ ] 아이콘은 이벤트 제목 옆에 표시된다
- [ ] 단일 일정으로 수정된 경우(repeat.type = 'none') 아이콘이 사라진다

## Technical Notes

### 영향 범위

- 수정 파일: `src/App.tsx`
  - `renderWeekView()` 함수 (라인 148-223)
  - `renderMonthView()` 함수 (라인 225-314)
  - 이벤트 리스트 렌더링 (라인 538-589)

### UI 컴포넌트

```typescript
import { Repeat } from '@mui/icons-material';

// 반복 일정 판별
const isRecurring = event.repeat.type !== 'none';

// 아이콘 추가
{isRecurring && <Repeat fontSize="small" />}
```

### 표시 위치

1. **주간/월간 뷰 셀 내부**:
```tsx
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  {isRecurring && <Repeat fontSize="small" />}
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
</Stack>
```

2. **이벤트 리스트**:
```tsx
<Stack direction="row" spacing={1} alignItems="center">
  {notifiedEvents.includes(event.id) && <Notifications color="error" />}
  {isRecurring && <Repeat color="primary" />}
  <Typography>{event.title}</Typography>
</Stack>
```

## 테스트 시나리오

- [ ] repeat.type이 'daily'인 일정에 아이콘이 표시된다
- [ ] repeat.type이 'weekly'인 일정에 아이콘이 표시된다
- [ ] repeat.type이 'monthly'인 일정에 아이콘이 표시된다
- [ ] repeat.type이 'yearly'인 일정에 아이콘이 표시된다
- [ ] repeat.type이 'none'인 일정에는 아이콘이 표시되지 않는다
- [ ] 반복 일정을 단일 수정하면 해당 일정의 아이콘이 사라진다
- [ ] 주간 뷰, 월간 뷰, 이벤트 리스트 모두에서 아이콘이 일관되게 표시된다

## 예시

**주간/월간 뷰**:
```
┌─────────────────┐
│ 15              │
│ 🔁 팀 미팅      │  ← Repeat 아이콘
│ 🔔 중요 회의    │  ← Notifications 아이콘 (알림용)
│ 점심 약속       │  ← 일반 일정
└─────────────────┘
```

**이벤트 리스트**:
```
┌──────────────────────────────┐
│ 🔁 팀 미팅                   │
│ 2025-01-15                   │
│ 10:00 - 11:00                │
│ 반복: 1주마다 (종료: 2025...) │
└──────────────────────────────┘
```

## 우선순위

- [x] P0 (필수)
- [ ] P1 (중요)
- [ ] P2 (선택)

## 관련 작업

- Epic: 반복 일정 관리 기능
- 의존성: Story 02 (반복 일정 자동 생성)
- 다음 Story: Story 04 (반복 종료 조건)

## 디자인 참고

- MUI Icon: `@mui/icons-material/Repeat`
- 색상: primary (파란색) 또는 inherit
- 크기: small (fontSize="small")
- 위치: 이벤트 제목 왼쪽, 알림 아이콘 오른쪽
