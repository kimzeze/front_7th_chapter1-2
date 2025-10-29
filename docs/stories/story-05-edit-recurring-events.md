# Story 05: 반복 일정 수정

## 사용자 스토리

**As a** 일정 관리 사용자
**I want** 반복 일정을 수정할 때 해당 일정만 수정할지, 모든 반복 일정을 수정할지 선택할 수 있기를
**So that** 필요에 따라 유연하게 일정을 관리할 수 있다

## Acceptance Criteria

- [ ] 반복 일정 수정 시 "해당 일정만 수정하시겠어요?" 다이얼로그가 표시된다
- [ ] "예" 선택 시: 해당 일정만 단일 일정으로 수정된다
  - repeat.type이 'none'으로 변경
  - repeatParentId는 유지
  - 반복 아이콘이 사라짐
- [ ] "아니오" 선택 시: 같은 repeatParentId를 가진 모든 일정이 수정된다
  - 모든 인스턴스의 제목, 시간, 설명 등이 동일하게 변경
  - repeat 정보는 유지
  - 반복 아이콘이 유지됨
- [ ] 단일 일정(repeat.type === 'none')을 수정하면 다이얼로그가 표시되지 않는다

## Technical Notes

### 영향 범위

- 신규 컴포넌트: 수정 확인 다이얼로그
- 수정 파일: `src/hooks/useEventOperations.ts` (saveEvent 로직)
- 수정 파일: `src/App.tsx` (다이얼로그 추가)

### 수정 로직

```typescript
async function handleEditRecurringEvent(
  event: Event,
  updatedData: Partial<Event>,
  editMode: 'single' | 'all'
) {
  if (editMode === 'single') {
    // 단일 수정
    await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...event,
        ...updatedData,
        repeat: { type: 'none', interval: 0 } // 반복 제거
      })
    });
  } else {
    // 전체 수정
    const eventsToUpdate = events.filter(
      e => e.repeatParentId === event.repeatParentId
    );

    for (const e of eventsToUpdate) {
      await fetch(`/api/events/${e.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...e,
          ...updatedData,
          // repeat 정보는 유지
          date: e.date // 날짜는 개별 유지!
        })
      });
    }
  }
}
```

### 다이얼로그 UI

```tsx
<Dialog open={isEditDialogOpen}>
  <DialogTitle>반복 일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      해당 일정만 수정하시겠어요?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => handleEdit('all')}>
      아니오 (전체 수정)
    </Button>
    <Button onClick={() => handleEdit('single')} color="primary">
      예 (이 일정만)
    </Button>
  </DialogActions>
</Dialog>
```

## 테스트 시나리오

- [ ] 반복 일정 수정 버튼 클릭 → 다이얼로그 표시
- [ ] "예" 선택 → 해당 일정만 수정, repeat.type = 'none', 아이콘 사라짐
- [ ] "아니오" 선택 → 같은 repeatParentId의 모든 일정 수정, repeat 유지
- [ ] 단일 일정 수정 → 다이얼로그 없이 바로 수정
- [ ] 전체 수정 시 각 일정의 날짜는 유지됨
- [ ] 전체 수정 시 제목, 시간, 설명, 카테고리 등은 모두 동일하게 변경

## 예시

**예시 1: 단일 수정**
```typescript
// 원본
{
  id: '2',
  date: '2025-01-08',
  title: '팀 미팅',
  repeat: { type: 'weekly', interval: 1, endDate: '2025-03-15' },
  repeatParentId: 'abc123'
}

// 수정 후 (단일)
{
  id: '2',
  date: '2025-01-08',
  title: '긴급 회의', // 변경
  repeat: { type: 'none', interval: 0 }, // 반복 제거
  repeatParentId: 'abc123' // 유지
}

// 다른 일정들 (id: 1, 3, 4...)은 변경 없음
```

**예시 2: 전체 수정**
```typescript
// 원본 (3개)
[
  { id: '1', date: '2025-01-01', title: '팀 미팅', repeatParentId: 'abc123' },
  { id: '2', date: '2025-01-08', title: '팀 미팅', repeatParentId: 'abc123' },
  { id: '3', date: '2025-01-15', title: '팀 미팅', repeatParentId: 'abc123' }
]

// 수정 후 (전체, 제목만 변경)
[
  { id: '1', date: '2025-01-01', title: '스프린트 리뷰', ... }, // 날짜는 유지!
  { id: '2', date: '2025-01-08', title: '스프린트 리뷰', ... },
  { id: '3', date: '2025-01-15', title: '스프린트 리뷰', ... }
]
```

## 우선순위

- [x] P0 (필수)
- [ ] P1 (중요)
- [ ] P2 (선택)

## 관련 작업

- Epic: 반복 일정 관리 기능
- 의존성: Story 02 (반복 일정 자동 생성)
- 다음 Story: Story 06 (반복 일정 삭제)

## 주의사항

### 날짜는 개별 유지
전체 수정 시 각 일정의 `date` 필드는 개별적으로 유지해야 합니다. 제목, 시간, 설명 등만 동일하게 변경됩니다.

### repeatParentId 유지
단일 수정 시에도 `repeatParentId`는 유지되어야 나중에 "이 일정이 원래 어떤 반복 그룹에 속했는지" 추적할 수 있습니다.

### 반복 정보 재생성 불가
전체 수정 시 반복 유형을 변경하면 기존 인스턴스들이 그대로 남아있기 때문에 혼란이 발생할 수 있습니다. 따라서 **전체 수정 시에는 repeat 정보를 변경할 수 없도록** 제한하는 것을 권장합니다.

대안: 반복 정보를 변경하려면 전체 삭제 후 새로 생성
