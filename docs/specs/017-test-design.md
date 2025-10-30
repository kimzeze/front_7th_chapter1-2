# 테스트 설계: 전체 삭제 로직 구현 (작업 017)

**작성자**: @test-designer
**날짜**: 2025-10-31

---

## 📋 개요

**테스트 대상**: `useEventOperations` 훅의 `deleteEvent` 함수 (전체 삭제 로직)
**테스트 파일**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (기존 파일에 추가)
**테스트 프레임워크**: Vitest + React Testing Library

---

## 🎯 테스트 목표

1. **반복 이벤트 전체 삭제**: `deleteOption === 'all'`일 때 같은 `repeatParentId`를 가진 모든 이벤트 삭제
2. **병렬 처리 확인**: Promise.all을 활용하여 모든 DELETE 요청 동시 실행
3. **에러 처리**: 부분 실패 시 에러 메시지 표시
4. **엣지 케이스**: repeatParentId 없음, 단일 이벤트 그룹 등

---

## 📝 테스트 케이스 설계

### 테스트 그룹 1: 반복 이벤트 전체 삭제 (핵심)

#### TC-001: deleteOption === 'all'일 때 같은 그룹의 모든 이벤트가 삭제됨

```
설명: 전체 삭제 시 같은 repeatParentId를 가진 모든 이벤트가 일괄 삭제됨
입력:
  - deleteOption: 'all'
  - id: "1"
  - 타겟 이벤트: { id: "1", repeatParentId: "parent-123" }
  - 같은 그룹 이벤트 (mock): 3개
    [
      { id: "1", date: "2025-01-15", repeatParentId: "parent-123" },
      { id: "2", date: "2025-01-22", repeatParentId: "parent-123" },
      { id: "3", date: "2025-01-29", repeatParentId: "parent-123" }
    ]

예상 결과:
  - DELETE /api/events/1 호출
  - DELETE /api/events/2 호출
  - DELETE /api/events/3 호출
  - 스낵바: "일정이 삭제되었습니다."
  - 3개 이벤트 모두 삭제됨

검증:
  - 스낵바 메시지 확인
  - 성공 메시지 표시
```

#### TC-002: 병렬 삭제 확인 (Promise.all)

```
설명: 전체 삭제 시 모든 DELETE 요청이 병렬로 실행됨
입력:
  - deleteOption: 'all'
  - 같은 그룹 이벤트: 4개

예상 결과:
  - 4개 DELETE 요청이 동시에 실행됨 (Promise.all)
  - 스낵바: "일정이 삭제되었습니다."

검증:
  - 성공 메시지 확인
```

---

### 테스트 그룹 2: repeatParentId 없는 경우

#### TC-003: repeatParentId가 없으면 에러 발생

```
설명: deleteOption === 'all'이지만 repeatParentId가 없으면 에러
입력:
  - deleteOption: 'all'
  - 타겟 이벤트: { id: "1" } (repeatParentId 없음)

예상 결과:
  - 에러 throw
  - console.error 호출
  - 스낵바: "일정 삭제 실패"

검증:
  - 에러 메시지 확인
```

---

### 테스트 그룹 3: 단일 이벤트만 있는 그룹

#### TC-004: 같은 그룹에 1개만 있어도 정상 동작

```
설명: 같은 repeatParentId를 가진 이벤트가 1개만 있어도 정상 삭제
입력:
  - deleteOption: 'all'
  - 타겟 이벤트: { id: "1", repeatParentId: "parent-123" }
  - 같은 그룹 이벤트: 1개만

예상 결과:
  - 1개 이벤트 삭제
  - 스낵바: "일정이 삭제되었습니다."

검증:
  - 정상 동작
```

---

### 테스트 그룹 4: 에러 처리

#### TC-005: 전체 삭제 중 API 실패 시 에러 처리

```
설명: 전체 삭제 중 일부 실패하면 에러 메시지 표시
입력:
  - deleteOption: 'all'
  - 타겟 이벤트: { id: "1", repeatParentId: "parent-123" }
  - 같은 그룹 이벤트: 3개
  - Mock: 2번째 DELETE 실패 (status 500)

예상 결과:
  - Promise.all reject
  - console.error 호출
  - 스낵바: "일정 삭제 실패"

검증:
  - 에러 메시지 확인
```

---

### 테스트 그룹 5: deleteOption 조건 분기

#### TC-006: deleteOption === 'single'이면 단일 삭제만 수행

```
설명: deleteOption이 'single'이면 작업 016의 단일 삭제 로직 수행
입력:
  - deleteOption: 'single'
  - 타겟 이벤트: { id: "1", repeatParentId: "parent-123" }
  - 같은 그룹 이벤트: 3개

예상 결과:
  - DELETE /api/events/1만 호출 (1번만)
  - 스낵바: "일정이 삭제되었습니다."

검증:
  - API 호출 1회만 확인
```

#### TC-007: deleteOption === null이면 단일 삭제 수행 (기본 동작)

```
설명: deleteOption이 null이면 기존 단일 삭제 로직 수행
입력:
  - deleteOption: null
  - id: "1"

예상 결과:
  - DELETE /api/events/1만 호출
  - 스낵바: "일정이 삭제되었습니다."

검증:
  - 정상 동작
```

---

### 테스트 그룹 6: 통합 시나리오

#### TC-008: 전체 삭제 후 단일 삭제 가능

```
설명: 전체 삭제 후 다른 반복 이벤트를 단일 삭제할 수 있음
시나리오:
  1. 그룹 A의 전체 삭제 (deleteOption: 'all')
  2. 그룹 B의 단일 삭제 (deleteOption: 'single')

예상 결과:
  - 두 번 모두 정상 삭제
  - 각각 스낵바 표시

검증:
  - 두 번째 삭제도 정상 동작
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

여러 DELETE 요청을 처리할 수 있도록 MSW 핸들러를 설정합니다.

```typescript
// setupMockHandlerDeletion은 이미 여러 DELETE를 처리할 수 있어야 함
setupMockHandlerDeletion();
```

---

## ✅ 검증 포인트

### 기능 검증

- [ ] `deleteOption === 'all'`일 때 전체 삭제 로직 실행
- [ ] 같은 `repeatParentId`를 가진 모든 이벤트 필터링
- [ ] 모든 이벤트 삭제 (Promise.all 활용)

### 조건부 로직 검증

- [ ] `deleteOption === 'all'` && `repeatParentId` 있음 → 전체 삭제
- [ ] `deleteOption === 'all'` && `repeatParentId` 없음 → 에러
- [ ] `deleteOption === 'single'` → 단일 삭제 (작업 016)
- [ ] `deleteOption === null` → 단일 삭제 (기본 동작)

### UI 검증

- [ ] 스낵바 메시지: "일정이 삭제되었습니다."
- [ ] 에러 메시지: "일정 삭제 실패"

### 함수 호출 검증

- [ ] fetchEvents() 호출 (성공 시에만)
- [ ] console.error 호출 (에러 시에만)

---

## 📌 테스트 작성 순서

1. **TC-001**: 전체 삭제 성공 (핵심 기능)
2. **TC-004**: 단일 이벤트 그룹
3. **TC-005**: 에러 처리
4. **TC-003**: repeatParentId 없음
5. **TC-006, TC-007**: 조건 분기 검증
6. **TC-002, TC-008**: 추가 검증

---

## 🎯 테스트 체크리스트

- [ ] 모든 테스트 케이스 작성 (8개)
- [ ] Mock 설정 완료
- [ ] AAA 패턴 (Arrange, Act, Assert) 적용
- [ ] 명확한 테스트 설명
- [ ] 각 테스트는 한 가지만 검증
- [ ] describe 블록으로 그룹화

---

## 🔍 예상 테스트 코드 구조

```typescript
describe('작업 017: 전체 삭제 로직 (deleteOption === "all")', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('반복 이벤트 전체 삭제', () => {
    it('TC-001: deleteOption === "all"일 때 같은 그룹의 모든 이벤트가 삭제된다', async () => {
      // Arrange
      setupMockHandlerDeletion();
      const { result } = renderHook(() => useEventOperations(true));
      await act(() => Promise.resolve(null));

      // 같은 그룹의 여러 이벤트가 이미 존재한다고 가정
      // (초기 fetch에서 가져옴, repeatParentId: 'parent-123')

      // Act: 첫 번째 이벤트를 삭제하면 전체가 삭제됨
      await act(async () => {
        await result.current.deleteEvent('1'); // deleteOption은 이미 'all'로 설정됨
      });

      // Assert
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
        variant: 'info',
      });
    });

    it('TC-002: 병렬 삭제 확인 (Promise.all)', async () => {
      // 성공 메시지 확인으로 간접 검증
    });
  });

  describe('repeatParentId 없는 경우', () => {
    it('TC-003: repeatParentId가 없으면 에러 발생', async () => {
      // ...
    });
  });

  describe('단일 이벤트만 있는 그룹', () => {
    it('TC-004: 같은 그룹에 1개만 있어도 정상 동작', async () => {
      // ...
    });
  });

  describe('에러 처리', () => {
    it('TC-005: API 실패 시 에러 메시지 표시', async () => {
      // ...
    });
  });

  describe('deleteOption 조건 분기', () => {
    it('TC-006: deleteOption === "single"이면 단일 삭제만 수행', async () => {
      // ...
    });

    it('TC-007: deleteOption === null이면 단일 삭제 수행 (기본 동작)', async () => {
      // ...
    });
  });

  describe('통합 시나리오', () => {
    it('TC-008: 전체 삭제 후 단일 삭제 가능', async () => {
      // ...
    });
  });
});
```

---

## 📊 테스트 커버리지 목표

- **라인 커버리지**: 100% (새로 추가된 로직)
- **분기 커버리지**: 100% (deleteOption === 'all' 조건 분기)
- **함수 커버리지**: 100% (deleteAllRelatedEvents 함수)

---

## 🚀 성공 기준

1. ✅ 모든 테스트 작성 완료 (8개)
2. ✅ 모든 테스트 실패 (RED 단계)
3. ✅ 테스트 설명이 명확함
4. ✅ Mock 설정이 정확함
5. ✅ 검증 로직이 명확함

---

## 🔗 관련 문서

- `docs/specs/017-delete-all-related-events.md` - 명세 문서
- `docs/specs/014-test-design.md` - 작업 014 테스트 설계 (유사 패턴 참고)
- `docs/specs/016-test-design.md` - 작업 016 테스트 설계 (단일 삭제)
- `docs/guidelines/react-testing-library.md` - 테스트 가이드라인

---

## 💡 참고사항

### 작업 014와의 차이점

| 항목           | 작업 014 (전체 수정)           | 작업 017 (전체 삭제)           |
| -------------- | ------------------------------ | ------------------------------ |
| HTTP Method    | PUT                            | DELETE                         |
| API 호출       | 순차 (for...of)                | 병렬 (Promise.all) 권장        |
| 테스트 개수    | 6개                            | 8개                            |
| 날짜 유지 검증 | 필요 (TC-002)                  | 불필요 (삭제이므로)            |
| 에러 처리      | 부분 실패                      | 부분 실패 (Promise.all reject) |

### 작업 016과의 관계

- **작업 016**: 단일 삭제 (`deleteOption === 'single'` 또는 `null`)
- **작업 017**: 전체 삭제 (`deleteOption === 'all'`)
- 두 작업은 `deleteEvent` 함수 내에서 조건 분기로 구분됨
