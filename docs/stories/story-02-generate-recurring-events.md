# Story 02: 반복 일정 자동 생성

## 사용자 스토리

**As a** 일정 관리 사용자
**I want** 반복 유형을 설정하면 자동으로 여러 일정이 생성되기를
**So that** 매번 수동으로 일정을 입력하지 않아도 된다

## Acceptance Criteria

- [ ] 반복 일정을 생성하면 종료일까지 반복 패턴에 따라 여러 일정이 생성된다
- [ ] 매일 반복: 다음 날부터 종료일까지 매일 생성
- [ ] 매주 반복: 다음 주 같은 요일부터 종료일까지 매주 생성
- [ ] 매월 반복: 다음 달 같은 날짜부터 종료일까지 매월 생성
  - 31일에 매월 반복 → 31일이 없는 달은 건너뜀
- [ ] 매년 반복: 다음 해 같은 날짜부터 종료일까지 매년 생성
  - 윤년 2월 29일에 매년 반복 → 평년은 건너뜀
- [ ] 모든 반복 일정은 동일한 `repeatParentId`를 가진다
- [ ] 최대 2025-12-31까지만 생성된다

## Technical Notes

### 영향 범위

- 신규 파일: `src/utils/recurringEventUtils.ts`
- 수정 파일: `src/hooks/useEventOperations.ts` (saveEvent 로직)

### 핵심 함수

```typescript
/**
 * 반복 일정 인스턴스들을 생성
 * @param baseEvent - 기준 이벤트
 * @returns 생성된 이벤트 배열
 */
function generateRecurringEvents(baseEvent: EventForm): Event[]

/**
 * 다음 반복 날짜를 계산
 * @param currentDate - 현재 날짜
 * @param repeatType - 반복 유형
 * @returns 다음 반복 날짜 또는 null (더 이상 없으면)
 */
function getNextOccurrence(
  currentDate: Date,
  repeatType: RepeatType
): Date | null
```

### 알고리즘

1. 기준 이벤트의 날짜를 시작점으로 설정
2. repeatParentId 생성 (UUID 또는 timestamp)
3. while (현재 날짜 <= 종료일 && 현재 날짜 <= 2025-12-31):
   - 새 이벤트 생성 (repeatParentId 포함)
   - 다음 날짜 계산
   - 날짜가 유효하지 않으면 건너뛰기 (31일, 2월 29일)
4. 생성된 이벤트 배열 반환

### 엣지 케이스

- **31일 매월 반복**: 2월(28/29일), 4월(30일), 6월(30일), 9월(30일), 11월(30일) 건너뛰기
- **윤년 2월 29일 매년 반복**: 평년 건너뛰기
- **2025-12-31 제한**: 이후 날짜는 생성 안 함

## 테스트 시나리오

- [ ] 2025-01-01 매일 반복 → 2025-01-02부터 종료일까지 생성
- [ ] 2025-01-31 매월 반복 → 2025-03-31, 05-31, 07-31... 생성 (2월, 4월, 6월 건너뜀)
- [ ] 2024-02-29 매년 반복 → 2025년 건너뛰고 2028-02-29 생성
- [ ] 2025-06-01 매일 반복, 종료일 2026-01-01 → 2025-12-31까지만 생성
- [ ] 생성된 모든 일정이 동일한 repeatParentId를 가진다
- [ ] 반복 없음(none)이면 단일 이벤트만 생성

## 예시

**입력**:
```typescript
{
  title: '팀 미팅',
  date: '2025-01-15',
  startTime: '10:00',
  endTime: '11:00',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-03-15'
  }
}
```

**출력** (간략히):
```typescript
[
  { id: '1', date: '2025-01-15', repeatParentId: 'abc123', ... },
  { id: '2', date: '2025-01-22', repeatParentId: 'abc123', ... },
  { id: '3', date: '2025-01-29', repeatParentId: 'abc123', ... },
  { id: '4', date: '2025-02-05', repeatParentId: 'abc123', ... },
  { id: '5', date: '2025-02-12', repeatParentId: 'abc123', ... },
  { id: '6', date: '2025-02-19', repeatParentId: 'abc123', ... },
  { id: '7', date: '2025-02-26', repeatParentId: 'abc123', ... },
  { id: '8', date: '2025-03-05', repeatParentId: 'abc123', ... },
  { id: '9', date: '2025-03-12', repeatParentId: 'abc123', ... }
]
```

## 우선순위

- [x] P0 (필수)
- [ ] P1 (중요)
- [ ] P2 (선택)

## 관련 작업

- Epic: 반복 일정 관리 기능
- 의존성: Story 01 (반복 유형 선택 UI)
- 다음 Story: Story 03 (반복 아이콘 표시)
