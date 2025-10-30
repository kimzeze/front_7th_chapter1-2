# 명세: 반복 일정 삭제 확인 다이얼로그 UI (작업 015)

## 📋 개요

**작업**: 반복 일정을 삭제할 때 "해당 일정만 삭제할지, 전체 반복 일정을 삭제할지" 선택하는 다이얼로그 표시
**목적**: 사용자가 반복 일정 삭제 시 의도한 범위를 명확히 선택하게 하여 실수로 전체 반복 일정을 삭제하는 것을 방지
**영향 범위**: `src/App.tsx`의 삭제 버튼 클릭 로직 (Delete 버튼 핸들러)

---

## 📝 요구사항

### 2.1 기능 요구사항

1. **다이얼로그 표시 조건**

   - 기존 이벤트를 삭제할 때만 표시
   - 단, `repeatParentId`가 존재하는 경우만 (반복 일정)
   - 단일 이벤트는 다이얼로그 없이 바로 삭제

2. **다이얼로그 UI**

   - 제목: "반복 일정 삭제"
   - 메시지: "해당 일정만 삭제하시겠어요?"
   - 버튼:
     - "이 일정만" → 단일 이벤트만 삭제
     - "전체 반복" → 모든 반복 인스턴스 삭제
     - "취소" → 삭제 작업 취소

3. **상태 관리**
   - 다이얼로그 열기/닫기 상태
   - 선택된 삭제 옵션 저장
   - 현재 삭제하려는 이벤트 임시 저장

### 2.2 비기능 요구사항

- **UI**: Material-UI Dialog 사용 (기존 패턴 유지)
- **반응성**: 즉각적인 응답
- **사용성**: 명확한 설명 텍스트로 사용자 혼란 방지
- **일관성**: 작업 012(수정 다이얼로그)와 동일한 UX 패턴

---

## 🎯 영향 범위

### 3.1 수정이 필요한 파일

- `src/App.tsx`
  - 상태 변수 추가: 다이얼로그 열기/닫기, 삭제 옵션, 삭제 대상 이벤트
  - 함수 수정: Delete 버튼 핸들러 (line 631)
  - UI 추가: Dialog 컴포넌트 추가

### 3.2 새로 생성할 파일

없음 (UI 로직만 추가)

### 3.3 필요한 import

이미 존재하는 import:

- `Dialog`, `DialogTitle`, `DialogContent`, `DialogContentText`, `DialogActions`, `Button` (MUI)
- `Delete` icon (이미 import됨)

---

## 📊 데이터 구조

### 4.1 상태 변수

```typescript
// 다이얼로그 관련 상태
const [deleteRepeatDialogOpen, setDeleteRepeatDialogOpen] = useState(false);
const [deletingEventForRepeat, setDeletingEventForRepeat] = useState<Event | null>(null);
const [deleteOption, setDeleteOption] = useState<'single' | 'all' | null>(null);
```

### 4.2 삭제 옵션 타입

```typescript
type DeleteOption = 'single' | 'all';

// 'single': 해당 이벤트만 삭제
// 'all': 같은 repeatParentId를 가진 모든 이벤트 삭제
```

---

## 🚨 엣지 케이스

### 6.1 repeatParentId가 없는 이벤트 (단일 이벤트)

- **현재 동작**: `deleteEvent(event.id)` 직접 호출
- **변경 후**: ✅ 동일 (다이얼로그 없이 바로 삭제)

### 6.2 repeatParentId가 있는 이벤트 (반복 이벤트)

- **현재 동작**: `deleteEvent(event.id)` 직접 호출 (단일 삭제)
- **변경 후**: ✅ 다이얼로그 표시 → 사용자 선택에 따라 삭제

### 6.3 다이얼로그 취소

- **동작**: 다이얼로그 닫기, 상태 초기화, 삭제 작업 없음

### 6.4 다이얼로그 열린 상태에서 다른 이벤트 삭제 시도

- **방지**: 다이얼로그가 열려있으면 다른 삭제 버튼 비활성화 또는 기존 다이얼로그 닫고 새로운 다이얼로그 열기

---

## 💻 구현 계획

### Phase 1: 상태 관리 추가

1. 다이얼로그 상태 변수 3개 추가
2. 초기값 설정

### Phase 2: Delete 버튼 핸들러 수정

기존:

```tsx
<IconButton aria-label="Delete event" onClick={() => deleteEvent(event.id)}>
  <Delete />
</IconButton>
```

변경 후:

```tsx
<IconButton
  aria-label="Delete event"
  onClick={() => {
    if (event.repeatParentId) {
      // 반복 일정: 다이얼로그 표시
      setDeletingEventForRepeat(event);
      setDeleteRepeatDialogOpen(true);
    } else {
      // 단일 일정: 바로 삭제
      deleteEvent(event.id);
    }
  }}
>
  <Delete />
</IconButton>
```

### Phase 3: Dialog 컴포넌트 추가

```tsx
<Dialog
  open={deleteRepeatDialogOpen}
  onClose={() => {
    setDeleteRepeatDialogOpen(false);
    setDeletingEventForRepeat(null);
    setDeleteOption(null);
  }}
>
  <DialogTitle>반복 일정 삭제</DialogTitle>
  <DialogContent>
    <DialogContentText>해당 일정만 삭제하시겠어요?</DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => {
        setDeleteOption('single');
        if (deletingEventForRepeat) {
          deleteEvent(deletingEventForRepeat.id, 'single');
        }
        setDeleteRepeatDialogOpen(false);
      }}
    >
      이 일정만
    </Button>
    <Button
      onClick={() => {
        setDeleteOption('all');
        if (deletingEventForRepeat) {
          deleteEvent(deletingEventForRepeat.id, 'all');
        }
        setDeleteRepeatDialogOpen(false);
      }}
    >
      전체 반복
    </Button>
    <Button onClick={() => setDeleteRepeatDialogOpen(false)}>취소</Button>
  </DialogActions>
</Dialog>
```

---

## ✅ 테스트 시나리오

### 긍정 케이스

- [ ] TC-001: repeatParentId가 있는 이벤트 삭제 시 다이얼로그가 표시된다
- [ ] TC-002: "이 일정만" 버튼 클릭 시 다이얼로그가 닫힌다
- [ ] TC-003: "전체 반복" 버튼 클릭 시 다이얼로그가 닫힌다
- [ ] TC-004: "취소" 버튼 클릭 시 다이얼로그가 닫히고 삭제가 취소된다

### 부정 케이스

- [ ] TC-005: repeatParentId가 없는 이벤트 삭제 시 다이얼로그가 표시되지 않는다

### 경계값 케이스

- [ ] TC-006: 다이얼로그 열린 상태에서 ESC 키 또는 외부 클릭 시 닫힌다

### 통합 시나리오

- [ ] TC-007: 반복 이벤트 삭제 → "이 일정만" → 다시 다른 반복 이벤트 삭제 가능

---

## 📋 구현 체크리스트

- [ ] 상태 변수 3개 추가 완료
- [ ] Delete 버튼 onClick 핸들러 수정
- [ ] Dialog 컴포넌트 추가
- [ ] "이 일정만" 버튼 로직
- [ ] "전체 반복" 버튼 로직
- [ ] "취소" 버튼 로직
- [ ] 다이얼로그 닫기 시 상태 초기화

---

## 🔗 참고

### 관련 작업

- 작업 012: 반복 일정 수정 확인 다이얼로그 UI (유사한 패턴)
- 작업 016: 단일 삭제 로직 구현 (다음 작업, deleteOption 활용)
- 작업 017: 전체 삭제 로직 구현 (다음 작업, deleteOption 활용)

### 주의사항

- ⚠️ 이 작업(015)은 **UI만** 구현
- ⚠️ `deleteEvent(id, deleteOption)` 시그니처는 아직 `deleteOption` 파라미터를 받지 않음
- ⚠️ 작업 016/017에서 `deleteEvent` 함수를 수정하여 `deleteOption`을 처리할 예정
- ✅ 현재는 `deleteOption` 상태만 설정하고, 실제 로직은 다음 작업에서 구현

---

## 📐 예시

### 사용자 흐름 1: 반복 일정 삭제 (단일)

1. 사용자가 반복 이벤트의 Delete 아이콘 클릭
2. 다이얼로그 표시: "해당 일정만 삭제하시겠어요?"
3. 사용자가 "이 일정만" 클릭
4. `deleteOption`이 `'single'`로 설정됨
5. `deleteEvent(event.id, 'single')` 호출 (작업 016에서 구현)
6. 해당 이벤트만 삭제됨

### 사용자 흐름 2: 반복 일정 삭제 (전체)

1. 사용자가 반복 이벤트의 Delete 아이콘 클릭
2. 다이얼로그 표시
3. 사용자가 "전체 반복" 클릭
4. `deleteOption`이 `'all'`로 설정됨
5. `deleteEvent(event.id, 'all')` 호출 (작업 017에서 구현)
6. 같은 `repeatParentId`를 가진 모든 이벤트 삭제됨

### 사용자 흐름 3: 취소

1. 다이얼로그 표시
2. 사용자가 "취소" 클릭
3. 다이얼로그 닫힘, 삭제 없음

---

## ✨ 작업 012와의 차이점

| 항목         | 작업 012 (수정)                  | 작업 015 (삭제)                    |
| ------------ | -------------------------------- | ---------------------------------- |
| 다이얼로그   | `editRepeatDialogOpen`           | `deleteRepeatDialogOpen`           |
| 임시 이벤트  | `editingEventForRepeat`          | `deletingEventForRepeat`           |
| 옵션 상태    | `editOption`                     | `deleteOption`                     |
| 버튼 액션    | `editEvent(event, editOption)`   | `deleteEvent(id, deleteOption)`    |
| 다이얼로그명 | "반복 일정 수정"                 | "반복 일정 삭제"                   |
| 메시지       | "해당 일정만 수정하시겠어요?"    | "해당 일정만 삭제하시겠어요?"      |
| 영향 범위    | `useEventOperations.saveEvent()` | `useEventOperations.deleteEvent()` |
| 주의사항     | 수정 시 데이터 보존 필요         | 삭제는 복구 불가능 (주의 필요)     |

---

## 🎯 완료 조건

- [x] 명세 문서 작성 완료
- [ ] 테스트 설계 (Phase 2)
- [ ] 테스트 작성 (Phase 3 - RED)
- [ ] 기능 구현 (Phase 4 - GREEN)
- [ ] 리팩토링 (Phase 5 - REFACTOR)
