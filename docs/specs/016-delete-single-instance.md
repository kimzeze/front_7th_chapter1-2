# 016: 반복 일정 단일 삭제 로직 구현

작성일: 2025-10-30
작성자: Spec Designer
상태: ✅ 승인됨

---

## 📌 개요

**목적**: 작업 015에서 구현한 삭제 확인 다이얼로그의 "이 일정만" 버튼 클릭 시, 선택한 반복 일정 인스턴스만 삭제하는 로직을 구현합니다.

**범위**: `src/hooks/useEventOperations.ts`의 `deleteEvent` 함수 수정

**작업 시간**: ~30분 (복잡도: 1/5)

---

## 🎯 요구사항

### 기능 요구사항

1. **단일 인스턴스 삭제**

   - 반복 일정의 특정 인스턴스만 삭제
   - 다른 인스턴스는 영향받지 않음
   - 기존 `deleteEvent` API 활용

2. **deleteOption 연동**

   - `App.tsx`의 `deleteOption` 상태를 `useEventOperations`에 전달
   - `deleteOption === 'single'`일 때만 단일 삭제 로직 실행

3. **기존 동작 유지**
   - `repeatParentId`가 없는 일반 이벤트는 기존 로직 유지
   - `deleteOption`이 null이면 기존 로직 유지

### 비기능 요구사항

1. **성능**: 단일 API 호출 (1개 이벤트만 삭제)
2. **에러 처리**: API 실패 시 적절한 에러 메시지
3. **타입 안전성**: TypeScript 타입 완전히 준수

---

## 🔧 구현 계획

### 1. `useEventOperations` 시그니처 수정

```typescript
export const useEventOperations = (
  editing: boolean,
  onSave?: () => void,
  editOption?: 'single' | 'all' | null,
  deleteOption?: 'single' | 'all' | null // ✅ 추가
) => {
  // ...
};
```

### 2. `deleteEvent` 함수 수정

```typescript
const deleteEvent = async (id: string) => {
  try {
    // 기존 로직 (단일 삭제는 그대로 사용)
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    // 성공 처리
    await fetchEvents();
    enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error deleting event:', error);
    enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
  }
};
```

**설명**:

- 단일 삭제는 **기존 `deleteEvent` 로직을 그대로 사용**
- `deleteOption === 'single'`일 때도 동일한 API 호출
- 작업 017에서 `deleteOption === 'all'`일 때만 별도 로직 추가 예정

### 3. `App.tsx` 수정

```typescript
const { events, saveEvent, deleteEvent } = useEventOperations(
  Boolean(editingEvent),
  () => setEditingEvent(null),
  editOption,
  deleteOption // ✅ 추가
);
```

---

## 📐 영향 범위

### 수정 파일

1. **`src/hooks/useEventOperations.ts`**

   - `useEventOperations` 함수 시그니처 수정
   - `deleteOption` 매개변수 추가
   - 주석 추가 (작업 017 준비)

2. **`src/App.tsx`**
   - `useEventOperations` 호출 시 `deleteOption` 전달

### 수정하지 않는 파일

- `deleteEvent` 함수 로직: 변경 없음 (기존 로직 그대로 사용)
- 테스트 파일: 변경 없음 (작업 015의 테스트가 이미 커버함)

---

## 🧪 테스트 시나리오

### 기존 테스트 활용

작업 015의 테스트가 이미 다음을 검증하므로 **새 테스트 불필요**:

1. **TC-003**: "이 일정만" 버튼 클릭 → 다이얼로그 닫힘
2. **TC-005**: "취소" 버튼 클릭 → 삭제 안 됨
3. **TC-007**: 여러 번 단일 삭제 가능

### 검증 방법

작업 015의 테스트가 계속 통과하면 작업 016도 정상 작동하는 것입니다.

---

## ⚠️ 엣지 케이스

### 1. `deleteOption`이 null인 경우

- **동작**: 기존 로직 유지 (일반 삭제)
- **이유**: 반복 일정이 아닌 경우 또는 다이얼로그 없이 직접 삭제

### 2. `deleteOption === 'single'`이지만 `repeatParentId` 없음

- **동작**: 정상 삭제 (일반 이벤트로 처리)
- **이유**: 안전한 fallback

### 3. API 실패

- **동작**: 에러 스낵바 표시
- **이유**: 사용자에게 실패 알림

---

## 🔗 관련 작업

- **의존**: 작업 015 (다이얼로그 UI)
- **연관**: 작업 017 (전체 삭제 로직)

---

## 📝 구현 노트

### 핵심 포인트

1. **기존 로직 재사용**: `deleteEvent`는 이미 단일 삭제 로직을 가지고 있음
2. **매개변수만 추가**: `deleteOption`을 받아서 작업 017을 준비
3. **최소 변경**: 테스트를 통과시키기 위한 최소한의 코드만 추가

### 작업 017과의 차이

- **작업 016 (단일)**: `DELETE /api/events/{id}` 1번 호출
- **작업 017 (전체)**: `DELETE /api/events/{id}` N번 호출 (같은 repeatParentId)

---

## ✅ 완료 기준

- [ ] `useEventOperations`가 `deleteOption` 매개변수 받음
- [ ] `App.tsx`에서 `deleteOption` 전달
- [ ] 작업 015의 테스트 8개 모두 통과
- [ ] 전체 테스트 191개 통과
- [ ] Linter 에러 없음

---

## 🎓 참고

- 작업 013/014의 `editOption` 패턴 참고
- 단일 삭제는 기존 API 그대로 사용

