# 테스트 설계: 전체 수정 로직 구현 (작업 014)

**작성자**: @test-designer
**날짜**: 2025-10-30

---

## 📋 개요

**테스트 대상**: `useEventOperations` 훅의 `saveEvent` 함수 (전체 수정 로직)
**테스트 파일**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (기존 파일에 추가)
**테스트 프레임워크**: Vitest + React Testing Library

---

## 🎯 테스트 목표

1. **반복 이벤트 전체 수정**: `editOption === 'all'`일 때 같은 `repeatParentId`를 가진 모든 이벤트 수정
2. **날짜 유지**: 각 이벤트의 날짜는 원본 유지
3. **필드 일괄 변경**: title, time, description 등은 모두 동일하게 수정
4. **에러 처리**: 부분 실패 시 에러 메시지 표시
5. **엣지 케이스**: repeatParentId 없음, 단일 이벤트 그룹 등

---

## 📝 테스트 케이스 설계

### 테스트 그룹 1: 반복 이벤트 전체 수정 (핵심)

#### TC-001: editOption === 'all'일 때 같은 그룹의 모든 이벤트가 수정됨

```
설명: 전체 수정 시 같은 repeatParentId를 가진 모든 이벤트가 일괄 수정됨
입력:
  - editing: true
  - editOption: 'all'
  - eventData: {
      id: "1",
      title: "회의 (전체 수정)",
      date: "2025-01-15",
      repeatParentId: "parent-123"
    }
  - 같은 그룹 이벤트 (mock): 3개
    [
      { id: "1", date: "2025-01-15", repeatParentId: "parent-123" },
      { id: "2", date: "2025-01-22", repeatParentId: "parent-123" },
      { id: "3", date: "2025-01-29", repeatParentId: "parent-123" }
    ]

예상 결과:
  - 스낵바: "일정이 수정되었습니다."
  - 3개 이벤트 모두 수정됨

검증:
  - 스낵바 메시지 확인
  - 성공 메시지 표시
```

#### TC-002: 각 이벤트의 날짜는 원본 유지

```
설명: 전체 수정 시 각 이벤트의 날짜는 변경되지 않음
입력:
  - editing: true
  - editOption: 'all'
  - eventData: {
      id: "1",
      date: "2025-01-15",
      title: "수정된 제목",
      repeatParentId: "parent-123"
    }
  - 같은 그룹 이벤트: 3개 (날짜가 각각 다름)

예상 결과:
  - 각 이벤트의 날짜는 원본 유지
  - title, startTime 등은 모두 동일하게 수정

검증:
  - 결과적으로 정상 수정됨
```

---

### 테스트 그룹 2: repeatParentId 없는 경우

#### TC-003: repeatParentId가 없으면 기존 로직 수행

```
설명: repeatParentId가 없으면 전체 수정 로직 미적용
입력:
  - editing: true
  - editOption: 'all'
  - eventData: {
      id: "1",
      title: "개인 일정",
      // repeatParentId 없음
    }

예상 결과:
  - 전체 수정 로직 미적용
  - 기존 단일 수정 로직 수행
  - 스낵바: "일정이 수정되었습니다."

검증:
  - 정상적으로 수정됨
```

---

### 테스트 그룹 3: 단일 이벤트만 있는 그룹

#### TC-004: 같은 그룹에 1개만 있어도 정상 동작

```
설명: 같은 repeatParentId를 가진 이벤트가 1개만 있어도 정상 수정
입력:
  - editing: true
  - editOption: 'all'
  - eventData: {
      id: "1",
      repeatParentId: "parent-123"
    }
  - 같은 그룹 이벤트: 1개만

예상 결과:
  - 1개 이벤트 수정
  - 스낵바: "일정이 수정되었습니다."

검증:
  - 정상 동작
```

---

### 테스트 그룹 4: 에러 처리

#### TC-005: 전체 수정 중 API 실패 시 에러 처리

```
설명: 전체 수정 중 일부 실패하면 에러 메시지 표시
입력:
  - editing: true
  - editOption: 'all'
  - eventData: { id: "1", repeatParentId: "parent-123" }
  - Mock: API 실패 (status 500)

예상 결과:
  - console.error 호출
  - 스낵바: "일정 저장 실패"

검증:
  - 에러 메시지 확인
```

---

### 테스트 그룹 5: 통합 시나리오

#### TC-006: 전체 수정 후 단일 수정 가능

```
설명: 전체 수정 후 다시 단일 수정을 할 수 있음
시나리오:
  1. 전체 수정 (editOption: 'all')
  2. 동일 이벤트를 단일 수정 (editOption: 'single')

예상 결과:
  - 두 번 모두 정상 수정
  - 각각 스낵바 표시

검증:
  - 두 번째 수정도 정상 동작
```

---

## 🔧 Mock 설정

### events 상태 Mock

같은 `repeatParentId`를 가진 여러 이벤트를 mock으로 제공해야 합니다.

```typescript
// useEventOperations 훅 호출 전에 mock 이벤트 설정
const mockEvents = [
  {
    id: '1',
    title: '스탠드업',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '10:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
    repeatParentId: 'parent-123',
  },
  {
    id: '2',
    title: '스탠드업',
    date: '2025-01-22',
    startTime: '10:00',
    endTime: '10:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
    repeatParentId: 'parent-123',
  },
  {
    id: '3',
    title: '스탠드업',
    date: '2025-01-29',
    startTime: '10:00',
    endTime: '10:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
    repeatParentId: 'parent-123',
  },
];
```

### MSW Handler

여러 PUT 요청을 처리할 수 있도록 MSW 핸들러를 설정합니다.

```typescript
// setupMockHandlerUpdating은 이미 여러 PUT을 처리할 수 있어야 함
setupMockHandlerUpdating();
```

---

## ✅ 검증 포인트

### 기능 검증

- [ ] `editOption === 'all'`일 때 전체 수정 로직 실행
- [ ] 같은 `repeatParentId`를 가진 모든 이벤트 필터링
- [ ] 각 이벤트의 날짜 유지
- [ ] 나머지 필드는 모두 동일하게 수정

### 조건부 로직 검증

- [ ] `editOption === 'all'` && `repeatParentId` 있음 → 전체 수정
- [ ] `editOption === 'all'` && `repeatParentId` 없음 → 기존 로직
- [ ] `editOption === 'single'` → 단일 수정 (작업 013)
- [ ] `editOption === undefined` → 기존 로직

### UI 검증

- [ ] 스낵바 메시지: "일정이 수정되었습니다."
- [ ] 에러 메시지: "일정 저장 실패"

### 함수 호출 검증

- [ ] fetchEvents() 호출 (성공 시에만)
- [ ] console.error 호출 (에러 시에만)

---

## 📌 테스트 작성 순서

1. **TC-001**: 전체 수정 성공 (핵심 기능)
2. **TC-003**: repeatParentId 없음 (기존 로직 유지)
3. **TC-004**: 단일 이벤트 그룹
4. **TC-005**: 에러 처리
5. **TC-002, TC-006**: 추가 검증

---

## 🎯 테스트 체크리스트

- [ ] 모든 테스트 케이스 작성 (6개)
- [ ] Mock 설정 완료
- [ ] AAA 패턴 (Arrange, Act, Assert) 적용
- [ ] 명확한 테스트 설명
- [ ] 각 테스트는 한 가지만 검증
- [ ] describe 블록으로 그룹화

---

## 🔍 예상 테스트 코드 구조

```typescript
describe('작업 014: 전체 수정 로직 (editOption === "all")', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('반복 이벤트 전체 수정', () => {
    it('TC-001: editOption === "all"일 때 같은 그룹의 모든 이벤트가 수정된다', async () => {
      // Arrange
      setupMockHandlerUpdating();
      const { result } = renderHook(() => useEventOperations(true));
      await act(() => Promise.resolve(null));

      // 같은 그룹의 여러 이벤트가 이미 존재한다고 가정 (초기 fetch에서 가져옴)

      const eventData: Event = {
        id: '1',
        title: '회의 (전체 수정)',
        date: '2025-01-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '전체 수정됨',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
        repeatParentId: 'parent-123',
      };

      // Act
      await act(async () => {
        await result.current.saveEvent(eventData, 'all');
      });

      // Assert
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });

    it('TC-002: 각 이벤트의 날짜는 원본 유지된다', async () => {
      // 날짜 유지 확인 (간접적으로 성공 메시지로 검증)
    });
  });

  describe('repeatParentId 없는 경우', () => {
    it('TC-003: repeatParentId가 없으면 기존 로직 수행', async () => {
      // ...
    });
  });

  describe('에러 처리', () => {
    it('TC-005: API 실패 시 에러 메시지 표시', async () => {
      // ...
    });
  });
});
```

---

## 📊 테스트 커버리지 목표

- **라인 커버리지**: 100% (새로 추가된 로직)
- **분기 커버리지**: 100% (editOption === 'all' 조건 분기)
- **함수 커버리지**: 100% (updateAllRelatedEvents 함수)

---

## 🚀 성공 기준

1. ✅ 모든 테스트 작성 완료 (6개)
2. ✅ 모든 테스트 실패 (RED 단계)
3. ✅ 테스트 설명이 명확함
4. ✅ Mock 설정이 정확함
5. ✅ 검증 로직이 명확함

---

## 🔗 관련 문서

- `docs/specs/014-all-edit-logic.md` - 명세 문서
- `docs/specs/013-test-design.md` - 작업 013 테스트 설계 (참고)
- `docs/guidelines/react-testing-library.md` - 테스트 가이드라인
