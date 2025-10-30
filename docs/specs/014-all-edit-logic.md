# 명세: 전체 수정 로직 구현 (작업 014)

**작성자**: @spec-designer
**날짜**: 2025-10-30

---

## 📋 개요

**작업**: 반복 일정에서 "전체 반복 수정" 선택 시, 같은 `repeatParentId`를 가진 모든 이벤트를 일괄 수정하는 로직 구현
**목적**: 사용자가 반복 일정 전체를 한 번에 수정하고자 할 때, 동일한 반복 그룹의 모든 이벤트를 일괄 업데이트
**영향 범위**:

- `src/hooks/useEventOperations.ts` (수정)
- 새로운 API 호출 패턴 (GET → 필터링 → PUT 여러 번)

---

## 📝 요구사항

### 기능 요구사항

#### 1. 전체 수정 판단

**조건**:

- 사용자가 작업 012의 다이얼로그에서 "전체 반복" 선택
- `editOption === 'all'` 상태 확인

**동작**:

- 같은 `repeatParentId`를 가진 모든 이벤트 수정
- 각 이벤트의 날짜는 유지 (개별 날짜는 변경하지 않음)

#### 2. 같은 반복 그룹 이벤트 찾기

**핵심 로직**:

```typescript
// 1. 현재 이벤트의 repeatParentId 확인
const repeatParentId = (eventData as Event).repeatParentId;

// 2. 같은 repeatParentId를 가진 모든 이벤트 필터링
const relatedEvents = events.filter((event) => event.repeatParentId === repeatParentId);
```

#### 3. 모든 이벤트 일괄 수정

**수정 전략**:

- 각 이벤트마다 개별 PUT 요청
- 날짜(`date`)는 원본 유지
- 나머지 필드(title, time, description 등)는 사용자가 수정한 값으로 변경

**API 호출**:

```typescript
for (const relatedEvent of relatedEvents) {
  const updatedEvent = {
    ...relatedEvent, // 기존 이벤트 (날짜 포함)
    title: eventData.title, // 수정된 내용 적용
    startTime: eventData.startTime,
    endTime: eventData.endTime,
    description: eventData.description,
    location: eventData.location,
    category: eventData.category,
    repeat: eventData.repeat,
    notificationTime: eventData.notificationTime,
    // repeatParentId는 유지
  };

  await fetch(`/api/events/${relatedEvent.id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedEvent),
  });
}
```

#### 4. 에러 처리

**부분 실패 시**:

- 일부 이벤트 수정 성공, 일부 실패 가능
- 현재는 첫 번째 실패 시 throw (트랜잭션 개념)
- 에러 로그 및 스낵바 메시지

### 비기능 요구사항

- **성능**: 10개 이내 이벤트는 ~2초 내 완료
- **안정성**: 부분 실패 시 에러 처리
- **UX**: "일정이 수정되었습니다." 스낵바 표시 (전체 성공 시)

---

## 🎯 영향 범위

### 수정할 파일

#### 1. `src/hooks/useEventOperations.ts`

**변경 위치**: `saveEvent` 함수의 `editing === true` 블록

**변경 내용**:

```typescript
const saveEvent = async (eventData: Event | EventForm, editOption?: 'single' | 'all') => {
  try {
    if (editing) {
      // 단일 수정
      if (editOption === 'single' && (eventData as Event).repeatParentId) {
        const dataToSave = convertToSingleEvent(eventData);
        // ... PUT 호출
      }
      // 전체 수정 (NEW)
      else if (editOption === 'all' && (eventData as Event).repeatParentId) {
        await updateAllRelatedEvents(eventData as Event);
      }
      // 일반 수정 (기존)
      else {
        // ... 기존 로직
      }
    }
  }
}
```

**새로운 헬퍼 함수**:

```typescript
/**
 * 같은 repeatParentId를 가진 모든 이벤트를 일괄 수정
 */
const updateAllRelatedEvents = async (eventData: Event) => {
  const { repeatParentId } = eventData;

  // 같은 반복 그룹의 모든 이벤트 찾기
  const relatedEvents = events.filter((event) => event.repeatParentId === repeatParentId);

  // 각 이벤트 수정 (날짜는 유지)
  for (const relatedEvent of relatedEvents) {
    const updatedEvent = {
      ...relatedEvent,
      title: eventData.title,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      description: eventData.description,
      location: eventData.location,
      category: eventData.category,
      repeat: eventData.repeat,
      notificationTime: eventData.notificationTime,
    };

    const response = await fetch(`/api/events/${relatedEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });

    if (!response.ok) {
      throw new Error(`Failed to update event ${relatedEvent.id}`);
    }
  }

  await handleSaveSuccess('일정이 수정되었습니다.');
};
```

---

## 📊 데이터 구조

### 입력값 (수정할 이벤트)

```typescript
{
  id: "event-123",
  title: "스탠드업 (수정됨)", // ← 사용자가 수정
  date: "2025-01-15",
  startTime: "10:30",          // ← 사용자가 수정
  endTime: "11:00",
  description: "팀 미팅 (수정)",
  location: "회의실 B",
  category: "업무",
  repeat: { type: 'weekly', interval: 1 },
  notificationTime: 15,
  repeatParentId: "parent-abc-123",
}
```

### 같은 그룹의 다른 이벤트들 (DB에서 가져옴)

```typescript
[
  {
    id: 'event-123',
    date: '2025-01-15', // ← 유지
    repeatParentId: 'parent-abc-123',
    // ...
  },
  {
    id: 'event-124',
    date: '2025-01-22', // ← 유지
    repeatParentId: 'parent-abc-123',
    // ...
  },
  {
    id: 'event-125',
    date: '2025-01-29', // ← 유지
    repeatParentId: 'parent-abc-123',
    // ...
  },
];
```

### 수정 후 (API로 전송)

```typescript
// event-123에 대한 PUT
{
  id: "event-123",
  title: "스탠드업 (수정됨)",
  date: "2025-01-15",        // 원본 날짜 유지
  startTime: "10:30",
  endTime: "11:00",
  description: "팀 미팅 (수정)",
  location: "회의실 B",
  repeatParentId: "parent-abc-123",
}

// event-124에 대한 PUT
{
  id: "event-124",
  title: "스탠드업 (수정됨)",  // 동일하게 수정
  date: "2025-01-22",          // 원본 날짜 유지
  startTime: "10:30",          // 동일하게 수정
  endTime: "11:00",
  description: "팀 미팅 (수정)",
  location: "회의실 B",
  repeatParentId: "parent-abc-123",
}

// event-125에 대한 PUT (동일 패턴)
```

---

## 🔧 API 명세

### PUT /api/events/:id (기존 API 사용, 여러 번 호출)

**요청 1**:

```json
PUT /api/events/event-123
{
  "id": "event-123",
  "title": "스탠드업 (수정됨)",
  "date": "2025-01-15",
  "startTime": "10:30",
  ...
}
```

**요청 2**:

```json
PUT /api/events/event-124
{
  "id": "event-124",
  "title": "스탠드업 (수정됨)",
  "date": "2025-01-22",
  ...
}
```

**호출 횟수**: 같은 그룹의 이벤트 개수만큼 (예: 4개 이벤트 → 4번 PUT)

---

## 🚨 엣지 케이스

### 1. repeatParentId가 없는 경우

**입력**:

- `editOption === 'all'`
- `repeatParentId === undefined`

**예상 결과**:

- 전체 수정 로직 미적용
- 기존 로직 수행 (단일 이벤트 수정)

### 2. 같은 그룹에 이벤트가 1개만 있는 경우

**입력**:

- `editOption === 'all'`
- `repeatParentId === 'parent-123'`
- 같은 그룹 이벤트: 1개

**예상 결과**:

- 1개 이벤트만 수정
- 정상 동작

### 3. 일부 이벤트가 이미 삭제된 경우

**입력**:

- DB에 있던 4개 중 1개가 삭제됨
- 현재 `events` 상태에는 3개만 존재

**예상 결과**:

- 현재 `events`에 있는 3개만 수정
- 삭제된 이벤트는 무시

### 4. API 호출 중 일부 실패

**입력**:

- 4개 이벤트 중 2번째 수정 실패

**예상 결과**:

- 에러 throw
- 스낵바: "일정 저장 실패"
- console.error 로깅

### 5. 날짜가 다른 이벤트들

**입력**:

- event-123: 2025-01-15
- event-124: 2025-01-22
- event-125: 2025-01-29

**예상 결과**:

- 각 이벤트의 날짜는 유지
- 나머지 필드만 수정됨

---

## ✅ 테스트 시나리오

### 시나리오 1: 반복 이벤트 전체 수정 (핵심)

```
입력:
  - editing: true
  - editOption: 'all'
  - eventData: {
      id: "event-123",
      title: "회의 (전체 수정)",
      repeatParentId: "parent-123"
    }
  - 같은 그룹 이벤트: 3개 (event-123, event-124, event-125)

예상 결과:
  - PUT /api/events/event-123 호출
  - PUT /api/events/event-124 호출
  - PUT /api/events/event-125 호출
  - 각 이벤트의 날짜는 원본 유지
  - 스낵바: "일정이 수정되었습니다."

검증:
  - API 호출 3회 확인
  - 각 이벤트의 title이 "회의 (전체 수정)"으로 변경
  - 각 이벤트의 날짜는 변경되지 않음
```

### 시나리오 2: repeatParentId 없는 경우

```
입력:
  - editing: true
  - editOption: 'all'
  - eventData: { id: "event-456", repeatParentId: undefined }

예상 결과:
  - 전체 수정 로직 미적용
  - 기존 단일 수정 로직 수행
  - API 호출 1회

검증:
  - API 호출 1회만 발생
```

### 시나리오 3: 부분 실패

```
입력:
  - editing: true
  - editOption: 'all'
  - 같은 그룹 이벤트: 3개
  - Mock: 2번째 PUT 실패

예상 결과:
  - 1번째 PUT 성공
  - 2번째 PUT 실패 → 에러 throw
  - fetchEvents() 호출 안 됨
  - 스낵바: "일정 저장 실패"

검증:
  - 에러 처리 확인
```

### 시나리오 4: 단일 이벤트만 있는 그룹

```
입력:
  - editing: true
  - editOption: 'all'
  - 같은 그룹 이벤트: 1개

예상 결과:
  - API 호출 1회
  - 정상 수정
  - 스낵바: "일정이 수정되었습니다."

검증:
  - 정상 동작
```

---

## 🔄 구현 흐름

```
사용자가 반복 이벤트 Edit 클릭
  ↓
repeatParentId 확인
  ↓
다이얼로그 표시
  ↓
"전체 반복" 클릭
  ↓
editOption = 'all' 설정
  ↓
editEvent(event) 호출 → 수정 폼 열림
  ↓
사용자가 수정 후 "일정 추가" 클릭
  ↓
saveEvent(eventData, 'all') 호출
  ↓
editing === true && editOption === 'all' 확인
  ↓
updateAllRelatedEvents(eventData) 호출
  ↓
1. events 배열에서 같은 repeatParentId 필터링
  ↓
2. 각 이벤트에 대해:
   - 날짜는 원본 유지
   - 나머지 필드는 수정된 값으로 변경
   - PUT /api/events/:id 호출
  ↓
3. 모든 PUT 성공 시:
   - fetchEvents() → UI 업데이트
   - 스낵바: "일정이 수정되었습니다."
  ↓
4. 하나라도 실패 시:
   - 에러 throw
   - 스낵바: "일정 저장 실패"
```

---

## 📌 구현 체크리스트

- [ ] `updateAllRelatedEvents` 헬퍼 함수 추가
- [ ] `saveEvent` 함수에 `editOption === 'all'` 조건 분기 추가
- [ ] 같은 `repeatParentId`를 가진 이벤트 필터링
- [ ] 각 이벤트 날짜 유지하며 수정
- [ ] 순차적 PUT 호출
- [ ] 에러 처리 (부분 실패)
- [ ] 테스트 작성 및 통과
- [ ] 린트 통과

---

## 🎯 성공 기준

1. ✅ "전체 반복" 선택 시 모든 관련 이벤트 수정됨
2. ✅ 각 이벤트의 날짜는 유지됨
3. ✅ title, time, description 등은 모두 동일하게 수정됨
4. ✅ `repeatParentId` 유지됨
5. ✅ 스낵바 메시지 정상 표시
6. ✅ 모든 테스트 통과
7. ✅ 린트 에러 없음

---

## 🔗 관련 작업

- **작업 012**: 반복 일정 수정 확인 다이얼로그 UI (선행 작업)
- **작업 013**: 단일 수정 로직 구현 (선행 작업)
- **작업 015**: 반복 일정 삭제 확인 다이얼로그 UI (유사 패턴)
