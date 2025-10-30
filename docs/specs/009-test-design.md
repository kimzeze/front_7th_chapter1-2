# 테스트 설계: repeatParentId 생성 및 할당 (작업 009)

## 📋 개요

**테스트 대상**: `generateRecurringEvents()` 함수
**테스트 파일**: `src/__tests__/unit/recurringEventUtils.spec.ts` (기존 파일에 추가)
**테스트 프레임워크**: Vitest

---

## 🎯 테스트 목표

1. **repeatParentId 동일성**: 같은 반복 그룹의 모든 이벤트가 동일한 ID를 가짐
2. **단일 이벤트**: 반복 없는 이벤트는 `repeatParentId` 없음
3. **ID 고유성**: 서로 다른 반복 그룹은 다른 ID
4. **각 이벤트 고유성**: 각 이벤트의 `id`는 고유하지만 `repeatParentId`는 같음
5. **ID 형식**: 유효한 UUID 또는 timestamp 기반 ID

---

## 📝 테스트 케이스 설계

### 테스트 그룹 1: repeatParentId 동일성

#### TC-001: 4개 반복 이벤트 - 모두 동일한 repeatParentId

```
설명: 매주 반복 4주 설정 시, 생성된 4개 이벤트가 모두 동일한 repeatParentId 보유
입력:
  - date: "2025-01-15"
  - repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' }
예상 결과:
  - 4개 이벤트 생성
  - events[0].repeatParentId === events[1].repeatParentId
  - events[0].repeatParentId === events[2].repeatParentId
  - events[0].repeatParentId === events[3].repeatParentId
검증:
  - 모든 repeatParentId가 동일
  - 값이 undefined가 아님 (존재함)
```

#### TC-002: 3개 반복 이벤트 - 모두 동일한 repeatParentId

```
설명: 매월 반복 3개월 설정 시, 3개 이벤트가 모두 동일한 repeatParentId 보유
입력:
  - date: "2025-01-15"
  - repeat: { type: 'monthly', interval: 1, endDate: '2025-03-15' }
예상 결과:
  - 3개 이벤트 생성
  - events[0].repeatParentId === events[2].repeatParentId
검증:
  - 모든 repeatParentId가 동일
```

#### TC-003: 매일 반복 31개 - 모두 동일한 repeatParentId

```
설명: 매일 반복 31일 설정 시, 31개 이벤트가 모두 동일한 repeatParentId 보유
입력:
  - date: "2025-01-01"
  - repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' }
예상 결과:
  - 31개 이벤트 생성
  - events[0].repeatParentId === events[30].repeatParentId
검증:
  - 첫 이벤트와 마지막 이벤트의 repeatParentId가 동일
```

---

### 테스트 그룹 2: 단일 이벤트 (repeat.type === 'none')

#### TC-004: 단일 이벤트 - repeatParentId 없음

```
설명: 반복 없는 이벤트는 repeatParentId가 없음
입력:
  - date: "2025-01-15"
  - repeat: { type: 'none', interval: 1 }
예상 결과:
  - 1개 이벤트 생성
  - events[0].repeatParentId === undefined
검증:
  - repeatParentId가 undefined
```

---

### 테스트 그룹 3: ID 고유성

#### TC-005: 2개 반복 그룹 - 서로 다른 repeatParentId

```
설명: 서로 다른 반복 이벤트 2개를 생성하면 각각 다른 repeatParentId 보유
입력:
  - 그룹 1: generateRecurringEvents({ date: "2025-01-15", repeat: { type: 'weekly', endDate: '2025-02-05' } })
  - 그룹 2: generateRecurringEvents({ date: "2025-03-15", repeat: { type: 'weekly', endDate: '2025-04-05' } })
예상 결과:
  - group1Events[0].repeatParentId !== group2Events[0].repeatParentId
검증:
  - 2개 그룹의 repeatParentId가 다름
```

---

### 테스트 그룹 4: 각 이벤트 id 고유성

#### TC-006: 각 이벤트의 id는 고유하지만 repeatParentId는 동일

```
설명: 반복 이벤트에서 각 이벤트의 id는 모두 다르지만 repeatParentId는 모두 같음
입력:
  - date: "2025-01-15"
  - repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' }
예상 결과:
  - 4개 이벤트 생성
  - ids: [uuid-1, uuid-2, uuid-3, uuid-4] (모두 다름)
  - repeatParentIds: [parent-id, parent-id, parent-id, parent-id] (모두 같음)
검증:
  - 모든 id가 고유 (Set 크기 = 4)
  - 모든 repeatParentId가 동일
```

---

### 테스트 그룹 5: ID 형식 검증

#### TC-007: repeatParentId 형식 검증

```
설명: repeatParentId는 유효한 UUID 또는 timestamp 기반 ID 형식
입력:
  - date: "2025-01-15"
  - repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' }
예상 결과:
  - repeatParentId는 다음 중 하나:
    - UUID 형식: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)
    - 또는 Timestamp 형식: /^\d+-[a-z0-9]+$/.test(id)
검증:
  - 정규식 매칭 성공
```

---

### 테스트 그룹 6: Edge Cases

#### TC-008: 1개만 생성되는 반복 (종료일 = 시작일)

```
설명: 시작일과 종료일이 같으면 1개 이벤트만 생성되며 repeatParentId 할당
입력:
  - date: "2025-01-15"
  - repeat: { type: 'weekly', interval: 1, endDate: '2025-01-15' }
예상 결과:
  - 1개 이벤트 생성
  - events[0].repeatParentId가 정의됨 (undefined가 아님)
검증:
  - repeatParentId 존재
```

#### TC-009: 빈 배열 반환 (종료일이 시작일보다 이전)

```
설명: 종료일이 시작일보다 이전이면 빈 배열 반환
입력:
  - date: "2025-01-15"
  - repeat: { type: 'weekly', interval: 1, endDate: '2025-01-08' }
예상 결과:
  - 빈 배열 []
  - repeatParentId 검증 불필요
검증:
  - 배열 길이 = 0
```

---

## 🔧 테스트 작성 전략

### AAA 패턴 (Arrange, Act, Assert)

```typescript
it('4개 반복 이벤트 - 모두 동일한 repeatParentId', () => {
  // Arrange
  const eventForm: EventForm = {
    title: '스탠드업',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
    notificationTime: 10,
  };

  // Act
  const events = generateRecurringEvents(eventForm);

  // Assert
  expect(events).toHaveLength(4);
  expect(events[0].repeatParentId).toBe(events[1].repeatParentId);
  expect(events[0].repeatParentId).toBe(events[2].repeatParentId);
  expect(events[0].repeatParentId).toBe(events[3].repeatParentId);
});
```

### 헬퍼 함수

```typescript
// repeatParentId가 유효한 UUID 형식인지 검증
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
}

// repeatParentId가 timestamp 기반 형식인지 검증
function isValidTimestampId(id: string): boolean {
  return /^\d+-[a-z0-9]+$/.test(id);
}

// repeatParentId 형식이 유효한지 검증
function isValidRepeatParentId(id: string): boolean {
  return isValidUUID(id) || isValidTimestampId(id);
}
```

---

## ✅ 검증 포인트

### repeatParentId 검증

- [ ] 반복 이벤트에서 모두 동일
- [ ] 단일 이벤트에서는 없음 (undefined)
- [ ] 서로 다른 그룹은 다름
- [ ] 유효한 형식

### 이벤트 검증

- [ ] 각 이벤트의 id는 고유
- [ ] 각 이벤트의 repeatParentId는 동일 (반복일 경우)
- [ ] 날짜가 올바름
- [ ] 데이터는 원본과 동일

### Edge Cases

- [ ] 빈 배열 처리
- [ ] 1개만 생성
- [ ] 많은 이벤트 (31개)

---

## 📌 테스트 작성 순서

1. **TC-001**: 4개 반복 - 기본 케이스 (쉬움)
2. **TC-004**: 단일 이벤트 - 엣지 케이스 (쉬움)
3. **TC-006**: id 고유성 + repeatParentId 동일 (중요)
4. **TC-005**: 2개 그룹 - ID 고유성 (중요)
5. **TC-007**: ID 형식 - 검증
6. **나머지**: 추가 엣지 케이스

---

## 🎯 테스트 체크리스트

- [ ] 모든 테스트 케이스 작성
- [ ] AAA 패턴 적용
- [ ] 명확한 테스트 설명
- [ ] 헬퍼 함수 작성
- [ ] 각 테스트는 한 가지만 검증
- [ ] 테스트 간 독립성 보장
