# 명세: 전체 삭제 로직 구현 (작업 017)

**작성자**: @spec-designer
**날짜**: 2025-10-31

---

## 📋 개요

**작업**: 반복 일정에서 "전체 반복 삭제" 선택 시, 같은 `repeatParentId`를 가진 모든 이벤트를 일괄 삭제하는 로직 구현
**목적**: 사용자가 반복 일정 전체를 한 번에 삭제하고자 할 때, 동일한 반복 그룹의 모든 이벤트를 일괄 삭제
**영향 범위**:

- `src/hooks/useEventOperations.ts` (수정)
- 새로운 API 호출 패턴 (GET → 필터링 → DELETE 여러 번)

---

## 📝 요구사항

### 기능 요구사항

#### 1. 전체 삭제 판단

**조건**:

- 사용자가 작업 015의 다이얼로그에서 "전체 반복" 선택
- `deleteOption === 'all'` 상태 확인
- 삭제할 이벤트에 `repeatParentId`가 존재

**동작**:

- 같은 `repeatParentId`를 가진 모든 이벤트 삭제

#### 2. 같은 반복 그룹 이벤트 찾기

**핵심 로직**:

```typescript
// 1. 현재 이벤트의 repeatParentId 확인
const targetEvent = events.find((e) => e.id === id);
const repeatParentId = targetEvent?.repeatParentId;

// 2. 같은 repeatParentId를 가진 모든 이벤트 필터링
const relatedEvents = events.filter((event) => event.repeatParentId === repeatParentId);
```

#### 3. 모든 이벤트 일괄 삭제

**삭제 전략**:

- **순차 삭제**: 각 이벤트마다 개별 DELETE 요청 (for...of)
- **OR 병렬 삭제**: Promise.all을 활용하여 모든 DELETE를 동시에 실행 (더 빠름)

**API 호출 (병렬 방식 권장)**:

```typescript
// 같은 repeatParentId를 가진 모든 이벤트 삭제
await Promise.all(
  relatedEvents.map(async (relatedEvent) => {
    const response = await fetch(`/api/events/${relatedEvent.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete event ${relatedEvent.id}`);
    }
  })
);
```

#### 4. 에러 처리

**부분 실패 시**:

- 일부 이벤트 삭제 성공, 일부 실패 가능
- Promise.all 사용 시 하나라도 실패하면 전체 실패
- 에러 로그 및 스낵바 메시지

### 비기능 요구사항

- **성능**: 10개 이내 이벤트는 ~2초 내 완료 (병렬 처리)
- **안정성**: 부분 실패 시 에러 처리
- **UX**: "일정이 삭제되었습니다." 스낵바 표시 (전체 성공 시)

---

## 🎯 영향 범위

### 수정할 파일

#### 1. `src/hooks/useEventOperations.ts`

**변경 위치**: `deleteEvent` 함수

**변경 내용**:

```typescript
const deleteEvent = async (id: string) => {
  try {
    // 작업 017: deleteOption 확인
    if (deleteOption === 'all') {
      // 전체 삭제 로직
      await deleteAllRelatedEvents(id);
    } else {
      // 작업 016: 단일 삭제 (기존 로직)
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
  }
};
```

**새로운 헬퍼 함수**:

```typescript
/**
 * 같은 repeatParentId를 가진 모든 이벤트를 일괄 삭제
 */
const deleteAllRelatedEvents = async (id: string) => {
  // 1. 타겟 이벤트 찾기
  const targetEvent = events.find((e) => e.id === id);
  if (!targetEvent || !targetEvent.repeatParentId) {
    throw new Error('Target event not found or not a repeating event');
  }

  const { repeatParentId } = targetEvent;

  // 2. 같은 반복 그룹의 모든 이벤트 찾기
  const relatedEvents = events.filter((event) => event.repeatParentId === repeatParentId);

  // 3. 모든 이벤트 병렬 삭제
  await Promise.all(
    relatedEvents.map(async (relatedEvent) => {
      const response = await fetch(`/api/events/${relatedEvent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete event ${relatedEvent.id}`);
      }
    })
  );

  // 4. 성공 후 UI 업데이트
  await fetchEvents();
  enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
};
```

---

## 📊 데이터 구조

### 입력값 (삭제할 이벤트 ID)

```typescript
id: "event-123"
```

### 타겟 이벤트 (삭제 요청한 이벤트)

```typescript
{
  id: "event-123",
  title: "스탠드업",
  date: "2025-01-15",
  startTime: "10:00",
  endTime: "10:30",
  repeatParentId: "parent-abc-123", // ← 이 값으로 그룹 검색
}
```

### 같은 그룹의 다른 이벤트들 (DB에서 가져옴)

```typescript
[
  {
    id: 'event-123',
    date: '2025-01-15',
    repeatParentId: 'parent-abc-123',
    // ...
  },
  {
    id: 'event-124',
    date: '2025-01-22',
    repeatParentId: 'parent-abc-123',
    // ...
  },
  {
    id: 'event-125',
    date: '2025-01-29',
    repeatParentId: 'parent-abc-123',
    // ...
  },
];
```

### API 호출

```typescript
// 병렬 호출
DELETE /api/events/event-123
DELETE /api/events/event-124
DELETE /api/events/event-125
```

---

## 🔧 API 명세

### DELETE /api/events/:id (기존 API 사용, 여러 번 호출)

**요청 1**:

```
DELETE /api/events/event-123
```

**요청 2**:

```
DELETE /api/events/event-124
```

**요청 3**:

```
DELETE /api/events/event-125
```

**호출 횟수**: 같은 그룹의 이벤트 개수만큼 (예: 4개 이벤트 → 4번 DELETE)

**병렬 처리**: Promise.all 사용하여 동시 실행

---

## 🚨 엣지 케이스

### 1. repeatParentId가 없는 경우

**입력**:

- `deleteOption === 'all'`
- `repeatParentId === undefined`

**예상 결과**:

- 에러 throw (or 단일 삭제로 fallback)
- "Target event not found or not a repeating event"

### 2. 같은 그룹에 이벤트가 1개만 있는 경우

**입력**:

- `deleteOption === 'all'`
- `repeatParentId === 'parent-123'`
- 같은 그룹 이벤트: 1개

**예상 결과**:

- 1개 이벤트만 삭제
- 정상 동작

### 3. 타겟 이벤트가 events 배열에 없는 경우

**입력**:

- `id === 'event-999'` (존재하지 않음)

**예상 결과**:

- 에러 throw
- 스낵바: "일정 삭제 실패"

### 4. API 호출 중 일부 실패

**입력**:

- 4개 이벤트 중 2번째 삭제 실패

**예상 결과**:

- Promise.all이 reject됨
- 에러 throw
- 스낵바: "일정 삭제 실패"
- console.error 로깅

### 5. deleteOption === null 또는 'single'

**입력**:

- `deleteOption === null` 또는 `'single'`

**예상 결과**:

- 기존 단일 삭제 로직 수행 (작업 016)
- 1개 이벤트만 삭제

---

## ✅ 테스트 시나리오

### 시나리오 1: 반복 이벤트 전체 삭제 (핵심)

```
입력:
  - deleteOption: 'all'
  - id: "event-123"
  - targetEvent.repeatParentId: "parent-123"
  - 같은 그룹 이벤트: 3개 (event-123, event-124, event-125)

예상 결과:
  - DELETE /api/events/event-123 호출
  - DELETE /api/events/event-124 호출
  - DELETE /api/events/event-125 호출
  - fetchEvents() 호출
  - 스낵바: "일정이 삭제되었습니다."

검증:
  - API 호출 3회 확인
  - events 배열에서 3개 이벤트 모두 제거됨
```

### 시나리오 2: repeatParentId 없는 경우

**이 케이스는 UI 단계에서 막힘 (다이얼로그가 안 뜸)**

- 단일 이벤트는 deleteOption이 null이므로 단일 삭제 로직 수행

### 시나리오 3: 부분 실패

```
입력:
  - deleteOption: 'all'
  - 같은 그룹 이벤트: 3개
  - Mock: 2번째 DELETE 실패

예상 결과:
  - Promise.all reject
  - 에러 throw
  - fetchEvents() 호출 안 됨
  - 스낵바: "일정 삭제 실패"

검증:
  - 에러 처리 확인
```

### 시나리오 4: 단일 이벤트만 있는 그룹

```
입력:
  - deleteOption: 'all'
  - 같은 그룹 이벤트: 1개

예상 결과:
  - API 호출 1회
  - 정상 삭제
  - 스낵바: "일정이 삭제되었습니다."

검증:
  - 정상 동작
```

### 시나리오 5: deleteOption === 'single'

```
입력:
  - deleteOption: 'single'
  - id: "event-123"

예상 결과:
  - 단일 삭제 로직 수행 (작업 016)
  - API 호출 1회
  - 스낵바: "일정이 삭제되었습니다."

검증:
  - 1개 이벤트만 삭제
```

---

## 🔄 구현 흐름

```
사용자가 반복 이벤트 Delete 클릭
  ↓
repeatParentId 확인
  ↓
다이얼로그 표시 (작업 015)
  ↓
"전체 반복" 버튼 클릭
  ↓
deleteOption = 'all' 설정
  ↓
deleteEvent(id) 호출
  ↓
deleteOption === 'all' 확인
  ↓
deleteAllRelatedEvents(id) 호출
  ↓
1. 타겟 이벤트 찾기 (events.find)
  ↓
2. repeatParentId 추출
  ↓
3. 같은 repeatParentId를 가진 모든 이벤트 필터링
  ↓
4. Promise.all로 모든 이벤트 병렬 삭제
   - DELETE /api/events/:id (여러 번)
  ↓
5. 모든 DELETE 성공 시:
   - fetchEvents() → UI 업데이트
   - 스낵바: "일정이 삭제되었습니다."
  ↓
6. 하나라도 실패 시:
   - 에러 throw
   - 스낵바: "일정 삭제 실패"
```

---

## 📌 구현 체크리스트

- [ ] `deleteAllRelatedEvents` 헬퍼 함수 추가
- [ ] `deleteEvent` 함수에 `deleteOption === 'all'` 조건 분기 추가
- [ ] 타겟 이벤트 찾기 (events.find)
- [ ] 같은 `repeatParentId`를 가진 이벤트 필터링
- [ ] Promise.all을 활용한 병렬 DELETE 호출
- [ ] 에러 처리 (부분 실패)
- [ ] fetchEvents 및 스낵바 메시지
- [ ] 테스트 작성 및 통과
- [ ] 린트 통과

---

## 🎯 성공 기준

1. ✅ "전체 반복" 선택 시 모든 관련 이벤트 삭제됨
2. ✅ Promise.all을 활용하여 병렬 처리
3. ✅ 스낵바 메시지 정상 표시
4. ✅ 모든 테스트 통과
5. ✅ 린트 에러 없음
6. ✅ 단일 삭제 로직 (작업 016)과 분리됨

---

## 🔗 관련 작업

- **작업 015**: 반복 일정 삭제 확인 다이얼로그 UI (선행 작업)
- **작업 016**: 단일 삭제 로직 구현 (선행 작업)
- **작업 014**: 전체 수정 로직 구현 (유사 패턴 참고)

---

## 💡 참고사항

### 작업 014와의 차이점

| 항목           | 작업 014 (전체 수정)       | 작업 017 (전체 삭제)     |
| -------------- | -------------------------- | ------------------------ |
| HTTP Method    | PUT                        | DELETE                   |
| API 호출       | 순차 (for...of)            | 병렬 (Promise.all) 권장  |
| 데이터 변환    | 날짜 유지, 나머지 필드 수정 | 없음 (단순 삭제)         |
| 복잡도         | 3/5                        | 3/5                      |
| 예상 시간      | 1-2시간                    | 1-2시간                  |

### Promise.all vs for...of

**Promise.all (권장)**:
- 장점: 빠름 (병렬 실행)
- 단점: 하나라도 실패하면 전체 실패

**for...of**:
- 장점: 순차 실행, 디버깅 쉬움
- 단점: 느림

→ **작업 017에서는 Promise.all 사용 권장** (삭제는 순서가 중요하지 않음)
