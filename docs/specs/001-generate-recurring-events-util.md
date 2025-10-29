# 작업 001: 반복 일정 생성 유틸 함수 기본 구조

## 1. 개요

### 목적

반복 일정(매일, 매주, 매월, 매년)을 자동으로 생성하는 유틸리티 함수를 구현하여, 사용자가 반복 패턴을 한 번 설정하면 여러 일정 인스턴스가 자동으로 생성되도록 한다.

### 사용자 시나리오

1. 사용자가 "매일" 반복 일정을 생성하면 → 다음 날부터 종료일까지 매일 일정이 생성됨
2. 사용자가 "매주" 반복 일정을 생성하면 → 다음 주 같은 요일부터 종료일까지 매주 일정이 생성됨
3. 사용자가 "매월" 반복 일정을 생성하면 → 다음 달 같은 날짜부터 종료일까지 매월 일정이 생성됨
4. 사용자가 "매년" 반복 일정을 생성하면 → 다음 해 같은 날짜부터 종료일까지 매년 일정이 생성됨

---

## 2. 요구사항

### 2.1 기능 요구사항

- [ ] `generateRecurringEvents()` 함수는 기준 이벤트를 받아 반복 인스턴스 배열을 반환한다
- [ ] 매일(daily) 반복: 1일씩 증가
- [ ] 매주(weekly) 반복: 7일씩 증가
- [ ] 매월(monthly) 반복: 1달씩 증가
- [ ] 매년(yearly) 반복: 1년씩 증가
- [ ] 모든 반복 인스턴스는 동일한 `repeatParentId`를 가진다
- [ ] `repeatParentId`는 UUID 또는 timestamp 기반으로 생성한다
- [ ] 반복 타입이 'none'이면 기준 이벤트만 반환한다

### 2.2 비기능 요구사항

- **성능**: 1년치 일정(최대 365개) 생성 시 1초 이내
- **호환성**: 기존 Event, EventForm 타입과 호환
- **타입 안전성**: TypeScript strict mode 준수

---

## 3. 영향 범위

### 3.1 새로 생성할 파일

- `src/utils/recurringEventUtils.ts` - 반복 일정 생성 유틸리티 함수

### 3.2 수정이 필요한 파일

- 없음 (이번 작업에서는 유틸 함수만 생성)

---

## 4. 데이터 구조

### 입력 타입

```typescript
interface EventForm {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}

interface RepeatInfo {
  type: RepeatType; // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number; // 현재는 1만 사용
  endDate?: string; // YYYY-MM-DD
  id?: string;
}
```

### 출력 타입

```typescript
interface Event extends EventForm {
  id: string; // 각 인스턴스마다 고유 ID
  repeatParentId?: string; // 같은 반복 그룹의 모든 인스턴스가 공유
}
```

---

## 5. API 명세

이번 작업은 클라이언트 유틸리티 함수이므로 서버 API 호출은 없음.

---

## 6. 함수 시그니처

### `generateRecurringEvents()`

```typescript
/**
 * 반복 일정 인스턴스들을 생성
 *
 * @param baseEvent - 기준 이벤트 (사용자가 입력한 원본 데이터)
 * @returns 생성된 이벤트 배열 (기준 이벤트 포함)
 *
 * @example
 * const baseEvent: EventForm = {
 *   title: '팀 미팅',
 *   date: '2025-01-01',
 *   repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' }
 * };
 *
 * const events = generateRecurringEvents(baseEvent);
 * // 결과: 5개 이벤트 (01-01, 01-02, 01-03, 01-04, 01-05)
 */
function generateRecurringEvents(baseEvent: EventForm): Event[]
```

### `getNextOccurrence()`

```typescript
/**
 * 현재 날짜로부터 다음 반복 날짜를 계산
 *
 * @param currentDate - 현재 날짜
 * @param repeatType - 반복 유형
 * @returns 다음 반복 날짜 (계산 가능한 경우) 또는 null
 *
 * @example
 * getNextOccurrence(new Date('2025-01-01'), 'daily')
 * // 결과: new Date('2025-01-02')
 */
function getNextOccurrence(
  currentDate: Date,
  repeatType: RepeatType
): Date | null
```

---

## 7. 알고리즘

### `generateRecurringEvents()` 흐름

```
1. 입력 검증
   - repeat.type이 'none'이면 → 기준 이벤트만 반환

2. repeatParentId 생성
   - crypto.randomUUID() 또는 Date.now().toString() 사용

3. 종료일 설정
   - endDate가 없으면 → MAX_DATE (2025-12-31) 사용
   - endDate > MAX_DATE이면 → MAX_DATE 사용
   - 그 외 → endDate 사용

4. 반복 생성 루프
   currentDate = new Date(baseEvent.date)
   events = []

   while (currentDate <= effectiveEndDate):
     - 새 이벤트 생성:
       - id: UUID 생성
       - date: currentDate를 YYYY-MM-DD로 변환
       - repeatParentId: 공통 ID
       - 나머지 필드: baseEvent에서 복사

     - events 배열에 추가

     - 다음 날짜 계산:
       currentDate = getNextOccurrence(currentDate, repeatType)

     - currentDate가 null이면 종료

5. events 배열 반환
```

### `getNextOccurrence()` 로직

```typescript
switch (repeatType) {
  case 'daily':
    return new Date(current.getTime() + 24 * 60 * 60 * 1000)

  case 'weekly':
    return new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000)

  case 'monthly':
    const next = new Date(current)
    next.setMonth(next.getMonth() + 1)
    return next

  case 'yearly':
    const next = new Date(current)
    next.setFullYear(next.getFullYear() + 1)
    return next

  default:
    return null
}
```

---

## 8. 엣지 케이스

### 8.1 작업 001에서 처리하는 케이스

- **반복 없음**: repeat.type === 'none' → 기준 이벤트만 반환
- **종료일 없음**: endDate가 undefined → 2025-12-31까지 생성
- **종료일 초과**: endDate > 2025-12-31 → 2025-12-31까지만 생성
- **시작일 = 종료일**: 기준 이벤트 하나만 반환

### 8.2 다음 작업(002, 003)에서 처리할 케이스

- **31일 매월 반복**: 31일이 없는 달 건너뛰기 (작업 002)
- **윤년 2월 29일 매년 반복**: 평년 건너뛰기 (작업 003)

작업 001에서는 **기본적인 날짜 계산만** 구현하고, 엣지 케이스는 이후 작업에서 추가합니다.

---

## 9. 구현 계획

### Phase 1: 기본 구조

1. `src/utils/recurringEventUtils.ts` 파일 생성
2. 필요한 타입 import (Event, EventForm, RepeatType)
3. 상수 정의 (MAX_DATE)

### Phase 2: 핵심 함수

4. `getNextOccurrence()` 구현
5. `generateRecurringEvents()` 구현
6. repeatParentId 생성 로직

---

## 10. 테스트 시나리오 (간략)

### 기본 케이스

- [ ] 매일 반복: 2025-01-01 ~ 2025-01-05 (5개)
- [ ] 매주 반복: 2025-01-01 ~ 2025-01-31 (5개: 01-01, 01-08, 01-15, 01-22, 01-29)
- [ ] 매월 반복: 2025-01-01 ~ 2025-04-01 (4개: 01-01, 02-01, 03-01, 04-01)
- [ ] 매년 반복: 2025-01-01 ~ 2027-01-01 (3개: 2025, 2026, 2027) - 하지만 MAX_DATE 제한으로 2025만

### 엣지 케이스

- [ ] repeat.type === 'none' → 1개만 반환
- [ ] endDate 없음 → 2025-12-31까지 생성
- [ ] endDate > 2025-12-31 → 2025-12-31까지만
- [ ] 시작일 = 종료일 → 1개만

### repeatParentId

- [ ] 모든 인스턴스가 동일한 repeatParentId를 가짐
- [ ] repeatParentId가 null이 아님

---

## 11. 예시

### 예시 1: 매일 반복

**입력**:
```typescript
const baseEvent: EventForm = {
  title: '운동',
  date: '2025-01-01',
  startTime: '07:00',
  endTime: '08:00',
  description: '아침 운동',
  location: '헬스장',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-01-03'
  },
  notificationTime: 10
};
```

**출력**:
```typescript
[
  {
    id: 'uuid-1',
    date: '2025-01-01',
    title: '운동',
    // ... 나머지 필드
    repeatParentId: 'parent-abc'
  },
  {
    id: 'uuid-2',
    date: '2025-01-02',
    title: '운동',
    // ... 나머지 필드
    repeatParentId: 'parent-abc'
  },
  {
    id: 'uuid-3',
    date: '2025-01-03',
    title: '운동',
    // ... 나머지 필드
    repeatParentId: 'parent-abc'
  }
]
```

### 예시 2: 매주 반복

**입력**:
```typescript
const baseEvent: EventForm = {
  title: '팀 회의',
  date: '2025-01-06', // 월요일
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-01-27'
  },
  // ...
};
```

**출력**: 4개 (01-06, 01-13, 01-20, 01-27)

### 예시 3: repeat.type === 'none'

**입력**:
```typescript
const baseEvent: EventForm = {
  title: '일회성 이벤트',
  date: '2025-01-01',
  repeat: {
    type: 'none',
    interval: 0
  },
  // ...
};
```

**출력**: 1개 (원본 이벤트만)

---

## 12. 주의사항

### 날짜 형식

- 입력: `'YYYY-MM-DD'` 문자열
- 내부 계산: `Date` 객체
- 출력: `'YYYY-MM-DD'` 문자열

### ID 생성

- `crypto.randomUUID()` 사용 (브라우저 환경)
- fallback: `Date.now().toString() + Math.random()`

### 타임존

- 현재는 로컬 타임존 사용
- `Date` 객체의 날짜만 사용 (시간은 무시)

---

## 13. 다음 작업과의 관계

- **작업 002**: 31일 매월 반복 엣지 케이스 추가
- **작업 003**: 윤년 2월 29일 엣지 케이스 추가
- **작업 004**: 종료일 로직은 이미 작업 001에 포함됨

작업 001은 **기본 골격**을 만들고, 002-004에서 엣지 케이스를 점진적으로 추가합니다.
