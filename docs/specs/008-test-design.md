# 테스트 설계: saveEvent에 반복 생성 로직 통합 (작업 008)

## 📋 개요

**테스트 대상**: `useEventOperations` 훅의 `saveEvent` 함수
**테스트 파일**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (기존 파일에 추가)
**테스트 프레임워크**: Vitest + React Testing Library

---

## 🎯 테스트 목표

1. **반복 없는 이벤트**: 기존 로직 유지 (1개 이벤트만 저장)
2. **반복 있는 이벤트**: 여러 이벤트 생성 및 순차 저장
3. **에러 처리**: 부분 실패 시 에러 메시지 표시
4. **수정 모드**: 반복 생성 로직 미적용 (기존 로직 유지)

---

## 📝 테스트 케이스 설계

### 테스트 그룹 1: 단일 이벤트 (repeat.type === 'none')

#### TC-001: 단일 이벤트 저장 성공

```
설명: 반복 없는 이벤트를 저장하면 API에 1개만 저장
입력:
  - editing: false
  - eventData: {
      title: "회의",
      date: "2025-01-15",
      repeat: { type: 'none', interval: 1 }
    }
예상 결과:
  - fetch('/api/events', { method: 'POST' }) 호출 1회
  - fetchEvents() 호출 1회
  - snackbar: "일정이 추가되었습니다."
검증:
  - 스낵바 메시지 확인
  - API 호출 횟수 확인 (1회)
```

---

### 테스트 그룹 2: 반복 이벤트 (repeat.type !== 'none')

#### TC-002: 매주 반복 이벤트 저장 성공

```
설명: 매주 반복 설정된 이벤트를 저장하면 여러 이벤트가 생성되어 저장됨
입력:
  - editing: false
  - eventData: {
      title: "스탠드업",
      date: "2025-01-15",
      startTime: "10:00",
      endTime: "11:00",
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' }
    }
예상 결과:
  - generateRecurringEvents() 호출 → 4개 이벤트 반환
    [2025-01-15, 2025-01-22, 2025-01-29, 2025-02-05]
  - fetch('/api/events', { method: 'POST' }) 호출 4회
  - 각 이벤트는 동일한 repeatParentId 보유
  - fetchEvents() 호출 1회 (모든 저장 후)
  - snackbar: "일정이 추가되었습니다."
검증:
  - API 호출 횟수 확인 (4회)
  - 각 호출의 body에 repeatParentId 포함 확인
  - 호출 순서 확인 (1번째, 2번째, 3번째, 4번째 순차)
```

#### TC-003: 매월 반복 이벤트 저장 성공

```
설명: 매월 반복 설정된 이벤트를 저장하면 여러 이벤트가 생성되어 저장됨
입력:
  - editing: false
  - eventData: {
      title: "회의",
      date: "2025-01-15",
      repeat: { type: 'monthly', interval: 1, endDate: '2025-03-15' }
    }
예상 결과:
  - generateRecurringEvents() 호출 → 3개 이벤트 반환
    [2025-01-15, 2025-02-15, 2025-03-15]
  - fetch('/api/events', { method: 'POST' }) 호출 3회
  - 각 이벤트는 동일한 repeatParentId 보유
  - snackbar: "일정이 추가되었습니다."
검증:
  - API 호출 횟수 확인 (3회)
```

#### TC-004: 매년 반복 이벤트 저장 성공

```
설명: 매년 반복 설정된 이벤트를 저장하면 여러 이벤트가 생성되어 저장됨
입력:
  - editing: false
  - eventData: {
      title: "기념일",
      date: "2025-01-01",
      repeat: { type: 'yearly', interval: 1, endDate: '2025-12-31' }
    }
예상 결과:
  - generateRecurringEvents() 호출 → 1개 이벤트 반환
    (2025-12-31이 MAX_DATE이므로 2025-01-01만 해당)
  - fetch('/api/events', { method: 'POST' }) 호출 1회
  - snackbar: "일정이 추가되었습니다."
검증:
  - API 호출 횟수 확인 (1회)
```

---

### 테스트 그룹 3: 에러 처리

#### TC-005: 반복 이벤트 저장 중 부분 실패

```
설명: 4개 이벤트 중 2번째 저장이 실패하면 에러 처리
입력:
  - editing: false
  - eventData: {
      title: "회의",
      date: "2025-01-15",
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' }
    }
  - Mock: fetch 호출 4회 중 2번째만 실패 (status 500)
예상 결과:
  - fetch 호출 2회 성공
  - fetch 호출 시점에 에러 발생
  - fetchEvents() 호출 안 됨
  - snackbar: "일정 저장 실패"
  - console.error로 에러 로깅
검증:
  - 에러 메시지 확인
  - fetchEvents() 미호출 확인
  - console.error 호출 확인
```

#### TC-006: 반복 이벤트 저장 중 API 비정상 응답

```
설명: API 응답이 비정상 (response.ok === false)인 경우 에러 처리
입력:
  - editing: false
  - eventData: { repeat: { type: 'weekly', ... } }
  - Mock: fetch 호출 1회 성공, 2회째부터 response.ok = false
예상 결과:
  - "Failed to save event" 에러 발생
  - snackbar: "일정 저장 실패"
검증:
  - 에러 메시지 확인
```

---

### 테스트 그룹 4: 수정 모드 (editing === true)

#### TC-007: 수정 모드에서 반복 설정은 무시

```
설명: 기존 이벤트를 수정할 때는 반복 생성 로직 미적용
입력:
  - editing: true
  - eventData: {
      id: "event-123",
      title: "회의 (수정됨)",
      date: "2025-01-15",
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' }
    }
예상 결과:
  - generateRecurringEvents() 호출 안 됨
  - fetch(`/api/events/event-123`, { method: 'PUT' }) 호출 1회
  - snackbar: "일정이 수정되었습니다."
검증:
  - API 호출 경로 확인 (PUT으로 시작)
  - generateRecurringEvents 미호출 확인
  - snackbar 메시지 확인
```

---

### 테스트 그룹 5: Edge Cases

#### TC-008: 반복 종료일이 시작일보다 이전

```
설명: generateRecurringEvents()가 빈 배열 반환하면 API 호출 없음
입력:
  - editing: false
  - eventData: {
      date: "2025-01-15",
      repeat: { type: 'weekly', interval: 1, endDate: '2025-01-08' }
    }
예상 결과:
  - generateRecurringEvents() 호출 → [] 반환
  - fetch 호출 안 됨
  - fetchEvents() 호출 안 됨
  - snackbar: "일정이 추가되었습니다." (또는 "일정이 추가되었습니다" 중복 호출 검토)
검증:
  - fetch 호출 횟수 0회 확인
```

#### TC-009: 많은 수의 반복 이벤트 (성능)

```
설명: 많은 이벤트 생성 시에도 모두 저장 완료
입력:
  - editing: false
  - eventData: {
      date: "2025-01-01",
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' }
    }
예상 결과:
  - generateRecurringEvents() → 31개 이벤트
  - fetch 호출 31회
  - snackbar: "일정이 추가되었습니다."
검증:
  - API 호출 횟수 확인 (31회)
  - 모두 완료 후 snackbar 표시
```

---

## 🔧 Mock 설정

### fetch Mock

```typescript
// 기본: 모두 성공
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true }),
});

// 실패 시뮬레이션
mockFetch.mockImplementationOnce(async () => ({
  ok: false,
  json: async () => ({}),
}));
```

### generateRecurringEvents Mock

```typescript
// 테스트 케이스별로 반환값 설정
const mockGenerateRecurringEvents = vi.fn().mockReturnValue([
  /* 테스트용 이벤트들 */
]);
```

---

## ✅ 검증 포인트

### API 호출 검증

- [ ] API 호출 횟수 확인
- [ ] API 호출 순서 확인 (순차적)
- [ ] 각 호출의 method 확인 (POST/PUT)
- [ ] 각 호출의 body에 repeatParentId 포함 확인
- [ ] 에러 시 부분 저장 방지

### 함수 호출 검증

- [ ] generateRecurringEvents 호출 확인 (조건부)
- [ ] fetchEvents 호출 확인 (성공 시에만)
- [ ] console.error 호출 확인 (에러 시에만)

### UI 검증

- [ ] 스낵바 메시지 확인
- [ ] 성공 메시지: "일정이 추가되었습니다."
- [ ] 실패 메시지: "일정 저장 실패"

### 데이터 검증

- [ ] 각 이벤트의 repeatParentId 동일 확인
- [ ] 각 이벤트의 id 고유성 확인
- [ ] 각 이벤트의 날짜 순서 확인

---

## 📌 테스트 작성 순서

1. **TC-001**: 단일 이벤트 (기본, 통과 쉬움)
2. **TC-002**: 매주 반복 (핵심 기능)
3. **TC-007**: 수정 모드 (에러 방지)
4. **TC-005**: 부분 실패 (에러 처리)
5. **나머지**: 추가 엣지 케이스

---

## 🎯 테스트 체크리스트

- [ ] 모든 테스트 케이스 작성
- [ ] Mock 설정 완료
- [ ] AAA 패턴 (Arrange, Act, Assert) 적용
- [ ] 명확한 테스트 설명
- [ ] 각 테스트는 한 가지만 검증
- [ ] 반복되는 코드는 헬퍼 함수화
