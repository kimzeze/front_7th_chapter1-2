# 명세: repeatParentId 생성 및 할당 (작업 009)

## 📋 개요

**작업**: 반복 일정 생성 시 동일한 `repeatParentId`가 생성되고, 모든 인스턴스에 정확하게 할당되는지 검증
**목적**: 반복 그룹을 추적하여 수정/삭제 시 동일 그룹의 모든 이벤트를 함께 처리할 수 있도록 하기 위한 ID 검증
**영향 범위**: `src/utils/recurringEventUtils.ts`의 `generateRecurringEvents()` 함수 (이미 구현됨, 검증 필요)

---

## 📝 요구사항

### 기능 요구사항

1. **repeatParentId 생성**

   - 반복 이벤트마다 고유한 UUID 또는 timestamp 기반 ID 생성
   - 각 반복 그룹마다 하나의 ID 생성 (모두 다르지 않음)

2. **repeatParentId 할당**

   - 생성된 모든 반복 이벤트에 동일한 `repeatParentId` 할당
   - 단일 이벤트는 `repeatParentId` 없음 (optional)
   - 수정/삭제 시 이 ID로 같은 그룹 찾기 가능

3. **ID 고유성**
   - 서로 다른 반복 그룹은 서로 다른 `repeatParentId` 보유
   - 예: 1월 매주 반복과 2월 매월 반복은 각각 다른 ID

### 비기능 요구사항

- 성능: ID 생성은 ms 단위 이내
- 안정성: 모든 이벤트에 동일하게 할당되어야 함 (데이터 일관성)
- 호환성: UUID 표준 준수 (또는 timestamp 기반 구현)

---

## 🎯 영향 범위

### 확인할 파일

- `src/utils/recurringEventUtils.ts`
  - 함수: `generateRecurringEvents`
  - 확인 사항: `repeatParentId` 생성 및 할당

### 확인할 타입

```typescript
interface Event extends EventForm {
  id: string;
  repeatParentId?: string; // ← 확인 대상
}
```

---

## 📊 데이터 구조

### 입력값

```typescript
// 반복 이벤트 설정
{
  title: "스탠드업",
  date: "2025-01-15",
  repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' }
}
```

### 출력값 (생성될 이벤트들)

```typescript
// generateRecurringEvents() 반환값
[
  {
    id: "uuid-1",
    title: "스탠드업",
    date: "2025-01-15",
    repeatParentId: "parent-abc-123", // ← 동일
    ...
  },
  {
    id: "uuid-2",
    title: "스탠드업",
    date: "2025-01-22",
    repeatParentId: "parent-abc-123", // ← 동일
    ...
  },
  {
    id: "uuid-3",
    title: "스탠드업",
    date: "2025-01-29",
    repeatParentId: "parent-abc-123", // ← 동일
    ...
  },
  {
    id: "uuid-4",
    title: "스탠드업",
    date: "2025-02-05",
    repeatParentId: "parent-abc-123", // ← 동일
    ...
  }
]
```

---

## 🚨 엣지 케이스

### 1. 단일 이벤트 (repeat.type === 'none')

- 예상: `repeatParentId` 없음 (undefined 또는 제외)
- 이유: 반복이 없으므로 그룹 추적 불필요

### 2. 반복 이벤트 1개만 생성 (종료일 = 시작일)

- 예: 1월 15일만 생성
- 예상: `repeatParentId` 할당됨 (있을 수 있음)
- 이유: 반복 설정이므로 ID 할당

### 3. 많은 이벤트 생성 (365개)

- 예: 1년 매일 반복
- 예상: 모두 동일한 `repeatParentId` 보유
- 검증: 첫 이벤트와 마지막 이벤트의 ID가 동일

### 4. 서로 다른 반복 설정

- 예: 2개 반복 그룹 생성
- 예상: 각각 다른 `repeatParentId`

---

## ✅ 테스트 시나리오

### 시나리오 1: 4개 이벤트 반복 - 모두 동일 ID

```
입력: 매주 반복, 4주
예상: 4개 이벤트의 repeatParentId 동일
검증: events[0].repeatParentId === events[3].repeatParentId
```

### 시나리오 2: 단일 이벤트 - ID 없음

```
입력: repeat.type === 'none'
예상: repeatParentId 없음
검증: events[0].repeatParentId === undefined
```

### 시나리오 3: 2개 반복 그룹 - 각각 다른 ID

```
입력:
  - 그룹 1: 매주 반복 4주
  - 그룹 2: 매주 반복 4주
예상: 그룹 1의 ID ≠ 그룹 2의 ID
검증: group1Events[0].repeatParentId !== group2Events[0].repeatParentId
```

### 시나리오 4: ID 형식 검증

```
입력: 반복 이벤트 생성
예상: repeatParentId는 유효한 UUID 또는 timestamp 기반 ID
검증:
  - UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)
  - Timestamp: typeof id === 'string' && id.includes('-')
```

### 시나리오 5: 각 이벤트의 id는 고유

```
입력: 4개 이벤트 반복
예상: 각 이벤트의 id는 모두 다름 (repeatParentId는 같음)
검증:
  - ids = [uuid-1, uuid-2, uuid-3, uuid-4] (모두 다름)
  - parents = [parent-id, parent-id, parent-id, parent-id] (모두 같음)
```

---

## 📌 구현 체크리스트

- [x] `generateRecurringEvents()`에서 `repeatParentId` 생성 (이미 구현)
- [x] 모든 반복 이벤트에 동일한 ID 할당 (이미 구현)
- [ ] 단일 이벤트는 ID 없음 (확인 필요)
- [ ] 테스트 작성
- [ ] 테스트 통과
