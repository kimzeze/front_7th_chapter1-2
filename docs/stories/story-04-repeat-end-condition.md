# Story 04: 반복 종료 조건 설정

## 사용자 스토리

**As a** 일정 관리 사용자
**I want** 반복 일정의 종료 날짜를 지정할 수 있기를
**So that** 원하는 기간 동안만 반복 일정이 생성된다

## Acceptance Criteria

- [ ] 반복 종료일을 날짜 선택기로 지정할 수 있다
- [ ] 종료일을 지정하지 않으면 2025-12-31까지 생성된다
- [ ] 종료일이 2025-12-31을 초과하면 2025-12-31까지만 생성된다
- [ ] 종료일이 시작 날짜보다 이전이면 에러 메시지를 표시한다
- [ ] 종료일까지 반복 패턴에 따라 일정이 생성된다
- [ ] 반복 종료일이 설정되면 이벤트 리스트에 종료일이 표시된다

## Technical Notes

### 영향 범위

- 수정 파일: `src/App.tsx` (반복 종료일 입력 max 속성 추가)
- 수정 파일: `src/utils/recurringEventUtils.ts` (종료일 로직)
- 수정 파일: `src/hooks/useEventForm.ts` (validation)

### Validation 로직

```typescript
const MAX_DATE = '2025-12-31';

function validateRepeatEndDate(startDate: string, endDate?: string): string | null {
  if (!endDate) return null; // 종료일 없으면 MAX_DATE까지 생성

  const start = new Date(startDate);
  const end = new Date(endDate);
  const max = new Date(MAX_DATE);

  if (end < start) {
    return '종료일은 시작일보다 이후여야 합니다.';
  }

  if (end > max) {
    return `종료일은 ${MAX_DATE}까지만 설정할 수 있습니다.`;
  }

  return null;
}
```

### 생성 로직

```typescript
function generateRecurringEvents(baseEvent: EventForm): Event[] {
  const MAX_DATE = new Date('2025-12-31');
  const endDate = baseEvent.repeat.endDate
    ? new Date(baseEvent.repeat.endDate)
    : MAX_DATE;

  const effectiveEndDate = endDate > MAX_DATE ? MAX_DATE : endDate;

  // effectiveEndDate까지 생성
  // ...
}
```

## 테스트 시나리오

- [ ] 종료일 없이 반복 일정 생성 → 2025-12-31까지 생성
- [ ] 종료일 2025-06-30 설정 → 2025-06-30까지만 생성
- [ ] 종료일 2026-12-31 설정 → 2025-12-31까지만 생성 (제한)
- [ ] 종료일이 시작일보다 이전 → 에러 메시지 표시
- [ ] 종료일이 시작일과 같음 → 시작일 하나만 생성
- [ ] 반복 유형이 'none'이면 종료일이 무시된다

## 예시

**예시 1: 종료일 지정**
```typescript
입력: {
  date: '2025-01-01',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-01-05'
  }
}

출력: 5개 이벤트 (01-01, 01-02, 01-03, 01-04, 01-05)
```

**예시 2: 종료일 미지정**
```typescript
입력: {
  date: '2025-01-01',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: undefined
  }
}

출력: 365개 이벤트 (2025-01-01 ~ 2025-12-31)
```

**예시 3: 종료일 초과**
```typescript
입력: {
  date: '2025-01-01',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2026-06-30'  // 최대 날짜 초과
  }
}

출력: 365개 이벤트 (2025-01-01 ~ 2025-12-31)
경고: "종료일이 2025-12-31을 초과하여 2025-12-31까지만 생성됩니다."
```

## 우선순위

- [x] P0 (필수)
- [ ] P1 (중요)
- [ ] P2 (선택)

## 관련 작업

- Epic: 반복 일정 관리 기능
- 의존성: Story 02 (반복 일정 자동 생성)
- 다음 Story: Story 05 (반복 일정 수정)

## UI 개선 사항

### 날짜 선택기 제한
```tsx
<TextField
  type="date"
  value={repeatEndDate}
  onChange={(e) => setRepeatEndDate(e.target.value)}
  slotProps={{
    htmlInput: {
      min: date, // 시작일 이후만 선택 가능
      max: '2025-12-31' // 최대 날짜
    }
  }}
  error={!!endDateError}
  helperText={endDateError}
/>
```

### 이벤트 리스트 표시
```tsx
{event.repeat.type !== 'none' && (
  <Typography>
    반복: {event.repeat.interval}
    {event.repeat.type === 'daily' && '일'}
    {event.repeat.type === 'weekly' && '주'}
    {event.repeat.type === 'monthly' && '월'}
    {event.repeat.type === 'yearly' && '년'}
    마다
    {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
  </Typography>
)}
```
