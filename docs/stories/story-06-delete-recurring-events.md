# Story 06: 반복 일정 삭제

## 사용자 스토리

**As a** 일정 관리 사용자
**I want** 반복 일정을 삭제할 때 해당 일정만 삭제할지, 모든 반복 일정을 삭제할지 선택할 수 있기를
**So that** 필요에 따라 유연하게 일정을 제거할 수 있다

## Acceptance Criteria

- [ ] 반복 일정 삭제 시 "해당 일정만 삭제하시겠어요?" 다이얼로그가 표시된다
- [ ] "예" 선택 시: 해당 일정만 삭제된다
  - 선택한 일정 하나만 삭제
  - 다른 반복 일정은 유지
- [ ] "아니오" 선택 시: 같은 repeatParentId를 가진 모든 일정이 삭제된다
  - 모든 반복 인스턴스가 삭제됨
- [ ] 단일 일정(repeat.type === 'none')을 삭제하면 다이얼로그가 표시되지 않는다

## Technical Notes

### 영향 범위

- 신규 컴포넌트: 삭제 확인 다이얼로그
- 수정 파일: `src/hooks/useEventOperations.ts` (deleteEvent 로직)
- 수정 파일: `src/App.tsx` (다이얼로그 추가)

### 삭제 로직

```typescript
async function handleDeleteRecurringEvent(
  event: Event,
  deleteMode: 'single' | 'all'
) {
  if (deleteMode === 'single') {
    // 단일 삭제
    await fetch(`/api/events/${event.id}`, {
      method: 'DELETE'
    });
  } else {
    // 전체 삭제
    const eventsToDelete = events.filter(
      e => e.repeatParentId === event.repeatParentId
    );

    for (const e of eventsToDelete) {
      await fetch(`/api/events/${e.id}`, {
        method: 'DELETE'
      });
    }
  }

  await fetchEvents(); // 목록 갱신
}
```

### 다이얼로그 UI

```tsx
<Dialog open={isDeleteDialogOpen}>
  <DialogTitle>반복 일정 삭제</DialogTitle>
  <DialogContent>
    <DialogContentText>
      해당 일정만 삭제하시겠어요?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsDeleteDialogOpen(false)}>
      취소
    </Button>
    <Button onClick={() => handleDelete('all')} color="warning">
      아니오 (전체 삭제)
    </Button>
    <Button onClick={() => handleDelete('single')} color="error">
      예 (이 일정만)
    </Button>
  </DialogActions>
</Dialog>
```

## 테스트 시나리오

- [ ] 반복 일정 삭제 버튼 클릭 → 다이얼로그 표시
- [ ] "예" 선택 → 해당 일정만 삭제, 다른 반복 일정은 유지
- [ ] "아니오" 선택 → 같은 repeatParentId의 모든 일정 삭제
- [ ] "취소" 선택 → 삭제 취소
- [ ] 단일 일정 삭제 → 다이얼로그 없이 바로 삭제
- [ ] 전체 삭제 후 캘린더에서 모든 인스턴스가 사라짐

## 예시

**예시 1: 단일 삭제**
```typescript
// 원본 (3개)
[
  { id: '1', date: '2025-01-01', title: '팀 미팅', repeatParentId: 'abc123' },
  { id: '2', date: '2025-01-08', title: '팀 미팅', repeatParentId: 'abc123' },
  { id: '3', date: '2025-01-15', title: '팀 미팅', repeatParentId: 'abc123' }
]

// id: '2' 단일 삭제 후
[
  { id: '1', date: '2025-01-01', title: '팀 미팅', repeatParentId: 'abc123' },
  // id: '2' 삭제됨
  { id: '3', date: '2025-01-15', title: '팀 미팅', repeatParentId: 'abc123' }
]
```

**예시 2: 전체 삭제**
```typescript
// 원본 (3개)
[
  { id: '1', date: '2025-01-01', title: '팀 미팅', repeatParentId: 'abc123' },
  { id: '2', date: '2025-01-08', title: '팀 미팅', repeatParentId: 'abc123' },
  { id: '3', date: '2025-01-15', title: '팀 미팅', repeatParentId: 'abc123' }
]

// id: '2' 전체 삭제 후
[] // 모두 삭제됨
```

## 우선순위

- [x] P0 (필수)
- [ ] P1 (중요)
- [ ] P2 (선택)

## 관련 작업

- Epic: 반복 일정 관리 기능
- 의존성: Story 02 (반복 일정 자동 생성)
- 이전 Story: Story 05 (반복 일정 수정)

## UX 개선 사항

### 버튼 색상 구분
- "예 (이 일정만)": error (빨강) - 더 위험성이 낮음
- "아니오 (전체 삭제)": warning (주황) - 더 많은 데이터 삭제
- "취소": default (회색)

### 확인 메시지
```
해당 일정만 삭제하시겠어요?

예 → 2025-01-08 일정만 삭제됩니다.
아니오 → "팀 미팅" 반복 일정 전체(9개)가 삭제됩니다.
```

### 삭제 후 스낵바
- 단일 삭제: "일정이 삭제되었습니다."
- 전체 삭제: "반복 일정 9개가 삭제되었습니다."

## 주의사항

### repeatParentId가 없는 경우
일부 반복 일정이 단일 수정되어 `repeat.type = 'none'`이 되었지만 `repeatParentId`는 여전히 가지고 있는 경우, 전체 삭제 시 이들도 함께 삭제될 수 있습니다.

**해결책**: 전체 삭제 시 `repeat.type !== 'none'`인 일정만 필터링하여 삭제

```typescript
const eventsToDelete = events.filter(
  e => e.repeatParentId === event.repeatParentId && e.repeat.type !== 'none'
);
```

또는 단일 수정 시 `repeatParentId`를 제거하는 방식도 가능합니다.

### API 호출 최적화
여러 일정을 삭제할 때 순차적으로 API를 호출하면 시간이 오래 걸릴 수 있습니다.

**개선안**:
- `Promise.all`로 병렬 처리
- 서버에 bulk delete API 추가 (선택 사항)

```typescript
await Promise.all(
  eventsToDelete.map(e =>
    fetch(`/api/events/${e.id}`, { method: 'DELETE' })
  )
);
```
