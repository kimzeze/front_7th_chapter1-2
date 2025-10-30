# 명세: saveEvent에 반복 생성 로직 통합 (작업 008)

## 📋 개요

**작업**: 반복 일정이 설정된 경우, 개별 이벤트를 생성하는 로직 구현
**목적**: 사용자가 반복 일정을 설정하고 저장할 때, `generateRecurringEvents()` 함수로 여러 이벤트 인스턴스를 생성하여 개별적으로 API에 저장
**영향 범위**: `src/hooks/useEventOperations.ts`의 `saveEvent` 함수 수정

---

## 📝 요구사항

### 기능 요구사항

1. **반복 생성 로직 통합**

   - `saveEvent` 함수가 호출될 때, 단일 저장 모드가 아닌 경우:
   - `repeat.type !== 'none'` 검사
   - 조건 만족 시 `generateRecurringEvents(eventData)` 호출
   - 반환된 이벤트 배열의 모든 이벤트를 순차적으로 API에 저장

2. **순차 저장 처리**

   - 여러 이벤트를 모두 저장하기 전에 모든 저장 작업이 완료될 때까지 대기
   - 하나라도 실패하면 에러 처리
   - 성공 시 모든 이벤트를 포함한 `fetchEvents()` 호출

3. **기존 수정 모드 유지**
   - 기존 이벤트 수정 시 (`editing === true`): 반복 생성 로직 미적용
   - 단일 이벤트 수정만 수행

### 비기능 요구사항

- 성능: 10개 이내의 이벤트는 ~1초 내 완료
- 안정성: 부분 실패 시에도 완전히 실패해야 함 (트랜잭션 개념)
- UX: 저장 중 스낵바 표시, 완료 후 성공 메시지 표시

---

## 🎯 영향 범위

### 수정할 파일

- `src/hooks/useEventOperations.ts`
  - 함수: `saveEvent`
  - 변경 사항: 반복 생성 로직 추가

### 필요한 import

- `generateRecurringEvents` from `../utils/recurringEventUtils`

### 기존 코드 활용

- `generateRecurringEvents()`: 이미 구현됨 (작업 001-004 완료)
- API 엔드포인트: `/api/events` (POST), 이미 작동 중
- 스낵바: 이미 구현됨

---

## 📊 데이터 구조

### 입력값 (eventData)

```typescript
// 현재 saveEvent 함수의 매개변수
eventData: Event | EventForm;

// EventForm 타입 (반복 정보 포함)
interface EventForm {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  repeat: RepeatInfo; // { type, interval, endDate, id }
  // ...
}

// RepeatInfo 타입
interface RepeatInfo {
  type: RepeatType; // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number;
  endDate?: string; // YYYY-MM-DD
  id?: string;
}
```

### 출력값 (생성될 이벤트들)

```typescript
// generateRecurringEvents() 반환값
Event[] // 예: [
        //   { ...baseEvent, id: 'uuid1', date: '2025-01-15', repeatParentId: 'parent1' },
        //   { ...baseEvent, id: 'uuid2', date: '2025-01-22', repeatParentId: 'parent1' },
        //   { ...baseEvent, id: 'uuid3', date: '2025-01-29', repeatParentId: 'parent1' },
        // ]
```

---

## 🔧 API 명세

### 기존 API (변경 없음)

**POST /api/events**

```json
Request:
{
  "title": "일정명",
  "date": "2025-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "repeat": { "type": "none", "interval": 1 },
  ...
}

Response:
{
  "id": "event-uuid",
  "title": "일정명",
  ...
}
```

**PUT /api/events/:id**

```json
Request: 같음 (수정할 이벤트 데이터)
Response: 같음
```

---

## 🚨 엣지 케이스

### 1. 반복 없음 (repeat.type === 'none')

- 현재 동작: 단일 이벤트만 저장
- 예상 결과: ✅ 변경 없음 (기존 로직 유지)

### 2. 반복 있음 (repeat.type !== 'none')

- 현재 동작: 단일 이벤트만 저장 → ❌ 버그
- 예상 결과: ✅ 여러 이벤트 생성 및 저장

### 3. 수정 모드 (editing === true)

- 현재 동작: 단일 이벤트 수정
- 예상 결과: ✅ 변경 없음 (반복 생성 로직 미적용)
- 이유: 반복 일정 수정은 별도 작업 (작업 012-014)에서 처리

### 4. API 저장 실패 (부분 실패)

- 예: 첫 3개 저장 성공, 4번째 실패
- 현재 동작: 부분 저장됨 → ❌ 데이터 불일치
- 예상 결과: ✅ 모든 저장 시도 후 하나라도 실패하면 롤백 또는 완전 실패

### 5. 반복 일정 개수가 많은 경우

- 예: 1년 매일 반복 (365개 이벤트)
- 예상 결과: ✅ 모두 저장 (성능 최적화는 작업 범위 아님)

---

## ✅ 테스트 시나리오

### 시나리오 1: 반복 없는 단일 이벤트 저장

- **입력**: `repeat.type === 'none'`인 EventForm
- **예상**: 단일 이벤트 1개 저장, API 호출 1회
- **검증**: snackbar 메시지 "일정이 추가되었습니다."

### 시나리오 2: 반복 일정 저장 (매주 3회)

- **입력**:
  - date: '2025-01-15' (수요일)
  - repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' }
- **예상**:
  - 생성될 이벤트: 2025-01-15, 01-22, 01-29, 02-05 (4개)
  - 각 이벤트는 같은 `repeatParentId` 보유
  - API 호출: 4회
- **검증**:
  - 모두 저장됨
  - `fetchEvents()` 호출 후 4개 이벤트 로드
  - snackbar 메시지 "일정이 추가되었습니다."

### 시나리오 3: 반복 일정 저장 중 API 오류 (2개 중 1개 실패)

- **입력**: 2개 이벤트 생성되는 반복 설정
- **예상**:
  - 1번째 저장 성공
  - 2번째 저장 실패
  - snackbar 에러 메시지 "일정 저장 실패"
- **검증**: 로그에 에러 기록

### 시나리오 4: 수정 모드 (editing === true)

- **입력**:
  - editing: true
  - repeat.type !== 'none'인 이벤트
- **예상**:
  - 반복 생성 로직 미적용
  - 단일 이벤트만 수정 (PUT /api/events/:id)
  - API 호출: 1회
- **검증**: snackbar 메시지 "일정이 수정되었습니다."

---

## 🔄 구현 흐름

```
saveEvent 함수 호출
  ↓
editing === false 확인
  ├─ true (수정 모드) → 기존 로직: PUT 호출
  └─ false (신규 생성)
     ↓
     repeat.type === 'none' 확인
     ├─ true (단일 이벤트) → 기존 로직: 1개 POST 호출
     └─ false (반복 이벤트)
        ↓
        generateRecurringEvents(eventData) 호출
        ↓
        events 배열 받음
        ↓
        모든 events에 대해 순차적으로 POST 호출
        ↓
        모두 성공 → fetchEvents() → snackbar 성공 메시지
        실패 → snackbar 에러 메시지
```

---

## 📌 구현 체크리스트

- [ ] `saveEvent` 함수 수정
- [ ] `generateRecurringEvents` import 추가
- [ ] `editing === false && repeat.type !== 'none'` 조건 추가
- [ ] 여러 이벤트 순차 저장 로직 구현
- [ ] 에러 처리 (하나 실패 시 모두 실패)
- [ ] 테스트 작성 및 통과
- [ ] 린트 통과
