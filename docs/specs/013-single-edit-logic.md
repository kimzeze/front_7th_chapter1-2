# 명세: 단일 수정 로직 구현 (작업 013)

**작성자**: @spec-designer
**날짜**: 2025-10-30

---

## 📋 개요

**작업**: 반복 일정에서 "이 일정만 수정" 선택 시, 해당 이벤트만 수정하는 로직 구현
**목적**: 사용자가 반복 일정 중 하나의 일정만 수정하고자 할 때, 다른 반복 일정에 영향을 주지 않고 해당 일정만 독립적으로 수정
**영향 범위**:

- `src/hooks/useEventOperations.ts` (수정)
- `src/App.tsx` (수정 - editOption 전달)

---

## 📝 요구사항

### 기능 요구사항

#### 1. 단일 수정 판단

**조건**:

- 사용자가 작업 012의 다이얼로그에서 "이 일정만" 선택
- `editOption === 'single'` 상태 확인

**동작**:

- 선택된 이벤트만 수정
- 다른 반복 이벤트는 변경하지 않음

#### 2. repeat.type 변경

**핵심 로직**:

```typescript
// 단일 수정 시
eventData.repeat.type = 'none';
```

**이유**:

- 반복 그룹에서 분리되어야 함
- 더 이상 반복 일정이 아니므로 `repeat.type`을 `'none'`으로 설정

#### 3. repeatParentId 제거

**핵심 로직**:

```typescript
// 단일 수정 시
delete eventData.repeatParentId;
```

**이유**:

- 반복 그룹에서 독립됨
- `repeatParentId`가 있으면 여전히 그룹으로 취급될 수 있음

#### 4. 기존 수정 로직 활용

**API 호출**:

```typescript
PUT /api/events/:id
```

**동작**:

- 기존 `editing === true` 로직 활용
- 단일 이벤트만 수정 (기존 동작과 동일)

### 비기능 요구사항

- **성능**: 단일 API 호출로 즉시 완료 (~100ms)
- **안정성**: 다른 반복 이벤트에 영향 없음 (데이터 일관성)
- **UX**: 수정 후 스낵바 표시 "일정이 수정되었습니다."

---

## 🎯 영향 범위

### 수정할 파일

#### 1. `src/App.tsx`

**변경 위치**: Edit 버튼 핸들러, 다이얼로그 버튼

**변경 내용**:

```typescript
// 현재 (작업 012)
onClick={() => {
  if (editingEventForRepeat) {
    setEditOption('single');
    editEvent(editingEventForRepeat);
    setEditRepeatDialogOpen(false);
  }
}}

// 변경 후 (작업 013)
onClick={() => {
  if (editingEventForRepeat) {
    setEditOption('single');
    editEvent(editingEventForRepeat, 'single'); // ← editOption 전달
    setEditRepeatDialogOpen(false);
  }
}}
```

**또는 대안 (추천)**:

```typescript
// editEvent는 그대로 두고, saveEvent에서 editOption 참조
// App.tsx에서 editOption을 useEventOperations에 전달
const { events, saveEvent, deleteEvent } = useEventOperations(
  Boolean(editingEvent),
  () => setEditingEvent(null),
  editOption // ← 추가
);
```

#### 2. `src/hooks/useEventOperations.ts`

**변경 위치**: `saveEvent` 함수

**변경 내용**:

```typescript
// 현재
const saveEvent = async (eventData: Event | EventForm) => {
  try {
    if (editing) {
      // 기존 수정 로직
      const response = await fetch(`/api/events/${(eventData as Event).id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      // ...
    }
  }
}

// 변경 후
const saveEvent = async (eventData: Event | EventForm, editOption?: 'single' | 'all') => {
  try {
    if (editing) {
      // 단일 수정인 경우
      if (editOption === 'single' && (eventData as Event).repeatParentId) {
        // repeat.type을 'none'으로 변경
        const modifiedData = {
          ...eventData,
          repeat: { ...eventData.repeat, type: 'none' as const },
        };
        delete (modifiedData as any).repeatParentId;

        const response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modifiedData),
        });
        // ...
      } else {
        // 기존 수정 로직 (전체 수정 또는 단일 이벤트 수정)
        const response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        // ...
      }
    }
  }
}
```

---

## 📊 데이터 구조

### 입력값 (수정 전 이벤트)

```typescript
{
  id: "event-123",
  title: "스탠드업",
  date: "2025-01-15",
  startTime: "10:00",
  endTime: "11:00",
  description: "팀 미팅",
  location: "회의실 A",
  category: "업무",
  repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
  notificationTime: 10,
  repeatParentId: "parent-abc-123", // ← 반복 그룹 ID
}
```

### 수정된 이벤트 (API 전송)

```typescript
{
  id: "event-123",
  title: "스탠드업 (수정됨)", // ← 사용자가 수정한 내용
  date: "2025-01-15",
  startTime: "10:00",
  endTime: "11:00",
  description: "팀 미팅 (수정됨)",
  location: "회의실 B",
  category: "업무",
  repeat: { type: 'none', interval: 1 }, // ← type이 'none'으로 변경
  notificationTime: 10,
  // repeatParentId 제거됨 ← 반복 그룹에서 독립
}
```

---

## 🔧 API 명세

### PUT /api/events/:id (기존 API 사용)

**요청**:

```json
PUT /api/events/event-123
{
  "id": "event-123",
  "title": "스탠드업 (수정됨)",
  "repeat": { "type": "none", "interval": 1 },
  // repeatParentId 없음
}
```

**응답**:

```json
{
  "id": "event-123",
  "title": "스탠드업 (수정됨)",
  "repeat": { "type": "none", "interval": 1 }
}
```

**호출 횟수**: 1회 (단일 이벤트만)

---

## 🚨 엣지 케이스

### 1. 단일 이벤트 수정 (repeatParentId 없음)

**입력**:

- `editOption === 'single'`
- `repeatParentId === undefined`

**예상 결과**:

- 기존 로직 그대로 수행 (repeat.type 변경 불필요)
- 단일 이벤트 수정

### 2. 반복 이벤트 단일 수정 후 다시 수정

**입력**:

- 반복 그룹에서 분리된 이벤트를 다시 수정
- 이미 `repeat.type === 'none'`

**예상 결과**:

- 일반 단일 이벤트로 취급
- 기존 로직 그대로 수행

### 3. editOption === 'all'인 경우

**입력**:

- `editOption === 'all'`
- 전체 반복 수정 선택

**예상 결과**:

- 작업 013 범위 아님 (작업 014에서 처리)
- 현재는 기존 로직 수행 (단일 이벤트만 수정됨)

### 4. editOption === null (다이얼로그 없이 직접 수정)

**입력**:

- `editOption === null` 또는 `undefined`
- 단일 이벤트를 직접 수정 (다이얼로그 없음)

**예상 결과**:

- 기존 로직 그대로 수행
- repeat.type 변경 안 함

---

## ✅ 테스트 시나리오

### 시나리오 1: 반복 이벤트 단일 수정 (핵심)

```
입력:
  - editing: true
  - editOption: 'single'
  - eventData: {
      id: "event-123",
      title: "회의 (수정됨)",
      repeat: { type: 'weekly', ... },
      repeatParentId: "parent-123"
    }

예상 결과:
  - API 호출: PUT /api/events/event-123
  - Body: {
      ...eventData,
      repeat: { type: 'none', ... },
      // repeatParentId 없음
    }
  - 스낵바: "일정이 수정되었습니다."

검증:
  - repeatParentId가 제거되었는가?
  - repeat.type이 'none'으로 변경되었는가?
  - API 호출 1회만 발생했는가?
```

### 시나리오 2: 단일 이벤트 수정 (repeatParentId 없음)

```
입력:
  - editing: true
  - editOption: 'single'
  - eventData: {
      id: "event-456",
      title: "회의",
      repeat: { type: 'none', ... },
      // repeatParentId 없음
    }

예상 결과:
  - 기존 로직 그대로 수행
  - repeat.type 변경 안 함
  - 스낵바: "일정이 수정되었습니다."

검증:
  - API 호출 1회
  - repeat.type이 여전히 'none'인가?
```

### 시나리오 3: editOption이 null인 경우

```
입력:
  - editing: true
  - editOption: null
  - eventData: { repeatParentId: "parent-123", ... }

예상 결과:
  - 기존 로직 그대로 수행
  - repeat.type 변경 안 함
  - repeatParentId 유지

검증:
  - API Body에 repeatParentId가 여전히 있는가?
  - repeat.type이 변경되지 않았는가?
```

### 시나리오 4: API 실패

```
입력:
  - editing: true
  - editOption: 'single'
  - API 응답: 500 에러

예상 결과:
  - console.error 로깅
  - 스낵바: "일정 저장 실패"

검증:
  - 에러 처리가 올바른가?
```

---

## 🔄 구현 흐름

```
사용자가 반복 이벤트 Edit 클릭
  ↓
repeatParentId 확인
  ├─ 있음 (반복 이벤트)
  │   ↓
  │  다이얼로그 표시 (작업 012)
  │   ↓
  │  "이 일정만" 클릭
  │   ↓
  │  editOption = 'single' 설정
  │   ↓
  │  editEvent(event) 호출 → 수정 폼 열림
  │   ↓
  │  사용자가 수정 후 "일정 추가" 클릭
  │   ↓
  │  saveEvent(eventData) 호출
  │   ↓
  │  editing === true && editOption === 'single' 확인
  │   ↓
  │  repeat.type = 'none' 설정
  │  repeatParentId 제거
  │   ↓
  │  PUT /api/events/:id 호출
  │   ↓
  │  fetchEvents() → UI 업데이트
  │   ↓
  │  스낵바: "일정이 수정되었습니다."
  │
  └─ 없음 (단일 이벤트)
      ↓
     editEvent(event) 직접 호출 (다이얼로그 없음)
```

---

## 📌 구현 체크리스트

- [ ] `useEventOperations`에 `editOption` 파라미터 추가
- [ ] `saveEvent` 함수에 `editOption` 파라미터 추가
- [ ] `editOption === 'single'` 조건 분기 추가
- [ ] `repeat.type = 'none'` 변경 로직
- [ ] `repeatParentId` 제거 로직
- [ ] 기존 로직 유지 (단일 이벤트, editOption === null)
- [ ] 테스트 작성 및 통과
- [ ] 린트 통과
- [ ] 실제 동작 확인 (수동 테스트)

---

## 🎯 성공 기준

1. ✅ "이 일정만" 선택 시 해당 이벤트만 수정됨
2. ✅ 수정된 이벤트의 `repeat.type === 'none'`
3. ✅ 수정된 이벤트의 `repeatParentId`가 제거됨
4. ✅ 다른 반복 이벤트는 영향 없음
5. ✅ 스낵바 메시지 정상 표시
6. ✅ 모든 테스트 통과
7. ✅ 린트 에러 없음

---

## 🔗 관련 작업

- **작업 012**: 반복 일정 수정 확인 다이얼로그 UI (선행 작업)
- **작업 014**: 전체 수정 로직 구현 (후속 작업)
- **작업 015**: 반복 일정 삭제 확인 다이얼로그 UI (유사 패턴)
