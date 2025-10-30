# 테스트 설계: 단일 수정 로직 구현 (작업 013)

**작성자**: @test-designer
**날짜**: 2025-10-30

---

## 📋 개요

**테스트 대상**: `useEventOperations` 훅의 `saveEvent` 함수 (단일 수정 로직)
**테스트 파일**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (기존 파일에 추가)
**테스트 프레임워크**: Vitest + React Testing Library

---

## 🎯 테스트 목표

1. **반복 이벤트 단일 수정**: `editOption === 'single'`일 때 `repeat.type = 'none'`, `repeatParentId` 제거
2. **단일 이벤트 수정**: `repeatParentId` 없는 경우 기존 로직 유지
3. **editOption null**: 명시적 옵션이 없으면 기존 로직 유지
4. **에러 처리**: API 실패 시 적절한 에러 메시지 표시

---

## 📝 테스트 케이스 설계

### 테스트 그룹 1: 반복 이벤트 단일 수정 (핵심)

#### TC-001: 반복 이벤트를 단일 수정하면 repeat.type이 'none'으로 변경됨

```
설명: editOption === 'single'일 때, 해당 이벤트의 repeat.type을 'none'으로 변경
입력:
  - editing: true
  - editOption: 'single'
  - eventData: {
      id: "event-123",
      title: "회의 (수정됨)",
      date: "2025-01-15",
      repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
      repeatParentId: "parent-123"
    }

예상 결과:
  - fetch(`/api/events/event-123`, { method: 'PUT' }) 호출 1회
  - 호출 body에 repeat.type === 'none' 포함
  - 호출 body에 repeatParentId 없음
  - fetchEvents() 호출 1회
  - 스낵바: "일정이 수정되었습니다."

검증:
  - API 호출 URL 확인
  - API 호출 body의 repeat.type === 'none' 확인
  - API 호출 body에 repeatParentId 속성 없음 확인
  - 스낵바 메시지 확인
```

#### TC-002: 단일 수정된 이벤트는 repeatParentId가 제거됨

```
설명: 단일 수정 시 repeatParentId가 API 호출 body에 포함되지 않아야 함
입력:
  - editing: true
  - editOption: 'single'
  - eventData: {
      id: "event-456",
      repeatParentId: "parent-abc",
      repeat: { type: 'monthly', interval: 1 }
    }

예상 결과:
  - API 호출 body에 repeatParentId 속성 없음
  - repeat.type === 'none'

검증:
  - fetch 호출 인자 확인
  - body에 repeatParentId 키가 없는지 확인
  - hasOwnProperty('repeatParentId') === false
```

---

### 테스트 그룹 2: 단일 이벤트 수정 (repeatParentId 없음)

#### TC-003: repeatParentId 없는 이벤트는 기존 로직 유지

```
설명: 단일 이벤트를 수정할 때는 repeat.type 변경 안 함
입력:
  - editing: true
  - editOption: 'single'
  - eventData: {
      id: "event-789",
      title: "개인 일정",
      repeat: { type: 'none', interval: 1 },
      // repeatParentId 없음
    }

예상 결과:
  - API 호출 body의 repeat.type === 'none' (변경 안 함)
  - 기존 로직 그대로 수행
  - 스낵바: "일정이 수정되었습니다."

검증:
  - API 호출 1회
  - repeat.type이 'none'으로 유지되는가?
  - 스낵바 메시지 확인
```

---

### 테스트 그룹 3: editOption이 null 또는 undefined인 경우

#### TC-004: editOption이 null이면 기존 로직 수행 (repeat.type 변경 안 함)

```
설명: 다이얼로그 없이 직접 수정하는 경우 (단일 이벤트 또는 작업 012 이전 동작)
입력:
  - editing: true
  - editOption: null 또는 undefined
  - eventData: {
      id: "event-111",
      repeat: { type: 'daily', interval: 1 },
      repeatParentId: "parent-xyz"
    }

예상 결과:
  - API 호출 body에 repeat.type === 'daily' (변경 안 함)
  - API 호출 body에 repeatParentId 포함됨
  - 기존 로직 그대로 수행

검증:
  - repeat.type이 변경되지 않았는가?
  - repeatParentId가 유지되는가?
```

---

### 테스트 그룹 4: editOption === 'all' (작업 014 대비)

#### TC-005: editOption === 'all'이면 현재는 기존 로직 수행

```
설명: 전체 수정 로직은 작업 014에서 구현, 현재는 단일 수정만 동작
입력:
  - editing: true
  - editOption: 'all'
  - eventData: {
      id: "event-222",
      repeat: { type: 'weekly', interval: 1 },
      repeatParentId: "parent-aaa"
    }

예상 결과:
  - 작업 013 범위: 기존 로직 수행 (단일 이벤트만 수정)
  - repeat.type 변경 안 함
  - repeatParentId 유지
  - 스낵바: "일정이 수정되었습니다."

검증:
  - API 호출 1회만 발생
  - repeat.type이 변경되지 않았는가?
  - (작업 014에서 추가 로직 구현 예정)
```

---

### 테스트 그룹 5: 에러 처리

#### TC-006: 단일 수정 중 API 실패 시 에러 처리

```
설명: 단일 수정 시 API 실패하면 에러 메시지 표시
입력:
  - editing: true
  - editOption: 'single'
  - eventData: { id: "event-333", repeatParentId: "parent-bbb", ... }
  - Mock: fetch 응답 { ok: false }

예상 결과:
  - console.error 호출
  - 스낵바: "일정 저장 실패"
  - fetchEvents() 호출 안 됨

검증:
  - 에러 메시지 확인
  - fetchEvents 미호출 확인
```

---

### 테스트 그룹 6: 통합 시나리오

#### TC-007: 반복 이벤트 단일 수정 후 다시 수정

```
설명: 단일 수정으로 분리된 이벤트를 다시 수정할 때 정상 동작
시나리오:
  1. 반복 이벤트를 단일 수정 (repeat.type = 'none', repeatParentId 제거)
  2. 해당 이벤트를 다시 수정
  3. 일반 단일 이벤트로 취급됨

입력 (2번째 수정):
  - editing: true
  - editOption: null (다이얼로그 없음)
  - eventData: {
      id: "event-123",
      repeat: { type: 'none', interval: 1 },
      // repeatParentId 없음
    }

예상 결과:
  - 기존 로직 수행
  - repeat.type === 'none' 유지
  - 스낵바: "일정이 수정되었습니다."

검증:
  - 정상적으로 수정되는가?
```

---

## 🔧 Mock 설정

### fetch Mock

```typescript
// 성공 케이스
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true }),
});

// 실패 케이스
mockFetch.mockResolvedValueOnce({
  ok: false,
  json: async () => ({}),
});
```

### API 호출 Body 검증

```typescript
// fetch 호출 후 body 검증
expect(mockFetch).toHaveBeenCalledWith(
  '/api/events/event-123',
  expect.objectContaining({
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: expect.any(String),
  })
);

// body 파싱 후 검증
const callArgs = mockFetch.mock.calls[0];
const body = JSON.parse(callArgs[1].body);
expect(body.repeat.type).toBe('none');
expect(body.repeatParentId).toBeUndefined();
```

---

## ✅ 검증 포인트

### API 호출 검증

- [ ] API 호출 URL: `/api/events/:id`
- [ ] API 호출 method: `PUT`
- [ ] API 호출 횟수: 1회 (단일 이벤트)
- [ ] API 호출 body:
  - [ ] `repeat.type === 'none'` (editOption === 'single'인 경우)
  - [ ] `repeatParentId` 속성 없음 (editOption === 'single'인 경우)

### 조건부 로직 검증

- [ ] `editOption === 'single'` → repeat.type 변경
- [ ] `editOption === null` → repeat.type 변경 안 함
- [ ] `repeatParentId` 없음 → 기존 로직 유지
- [ ] `editOption === 'all'` → 현재는 기존 로직 (작업 014 대비)

### UI 검증

- [ ] 스낵바 메시지: "일정이 수정되었습니다."
- [ ] 에러 메시지: "일정 저장 실패"

### 함수 호출 검증

- [ ] fetchEvents() 호출 (성공 시에만)
- [ ] console.error 호출 (에러 시에만)

---

## 📌 테스트 작성 순서

1. **TC-001**: 반복 이벤트 단일 수정 (핵심 기능)
2. **TC-002**: repeatParentId 제거 확인
3. **TC-003**: 단일 이벤트 수정 (기존 로직 유지)
4. **TC-004**: editOption null (기존 로직 유지)
5. **TC-006**: 에러 처리
6. **나머지**: 추가 엣지 케이스

---

## 🎯 테스트 체크리스트

- [ ] 모든 테스트 케이스 작성 (7개)
- [ ] Mock 설정 완료
- [ ] AAA 패턴 (Arrange, Act, Assert) 적용
- [ ] 명확한 테스트 설명
- [ ] 각 테스트는 한 가지만 검증
- [ ] describe 블록으로 그룹화
- [ ] 테스트 데이터 헬퍼 함수 활용

---

## 🔍 예상 테스트 코드 구조

```typescript
describe('작업 013: 단일 수정 로직', () => {
  describe('반복 이벤트 단일 수정', () => {
    it('TC-001: editOption === "single"일 때 repeat.type을 "none"으로 변경', async () => {
      // Arrange
      setupMockHandlerUpdating();
      const { result } = renderHook(() => useEventOperations(true, undefined, 'single'));

      // Act
      await act(async () => {
        await result.current.saveEvent({
          id: 'event-123',
          repeatParentId: 'parent-123',
          repeat: { type: 'weekly', interval: 1 },
          // ...
        });
      });

      // Assert
      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.repeat.type).toBe('none');
      expect(body.repeatParentId).toBeUndefined();
    });

    it('TC-002: repeatParentId가 제거됨', async () => {
      // ...
    });
  });

  describe('단일 이벤트 수정', () => {
    it('TC-003: repeatParentId 없는 경우 기존 로직 유지', async () => {
      // ...
    });
  });

  describe('editOption이 null인 경우', () => {
    it('TC-004: repeat.type 변경 안 함', async () => {
      // ...
    });
  });

  describe('에러 처리', () => {
    it('TC-006: API 실패 시 에러 메시지 표시', async () => {
      // ...
    });
  });
});
```

---

## 📊 테스트 커버리지 목표

- **라인 커버리지**: 100% (새로 추가된 로직)
- **분기 커버리지**: 100% (editOption 조건 분기)
- **함수 커버리지**: 100% (saveEvent 함수)

---

## 🚀 성공 기준

1. ✅ 모든 테스트 작성 완료 (7개)
2. ✅ 모든 테스트 실패 (RED 단계)
3. ✅ 테스트 설명이 명확함
4. ✅ Mock 설정이 정확함
5. ✅ 검증 로직이 명확함

---

## 🔗 관련 문서

- `docs/specs/013-single-edit-logic.md` - 명세 문서
- `docs/guidelines/react-testing-library.md` - 테스트 가이드라인
