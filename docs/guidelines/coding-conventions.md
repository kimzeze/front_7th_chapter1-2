# 코딩 컨벤션

## 네이밍 규칙

### 변수

**camelCase, 명사형**

```typescript
// ✅ 좋은 예
const eventList = [];
const selectedItem = null;
const isLoading = false;
const hasError = true;

// ❌ 나쁜 예
const EventList = []; // PascalCase 사용
const list = []; // 불명확
const flag = true; // 의미 불명
```

### 함수

**camelCase, 동사형**

```typescript
// ✅ API 함수
const fetchEvents = async () => {};
const createEvent = async () => {};
const updateEvent = async () => {};
const deleteEvent = async () => {};

// ✅ 일반 함수
const generateId = () => crypto.randomUUID();
const formatDate = (date: Date) => date.toISOString();
const calculateTotal = (items: Item[]) => {};

// ✅ 이벤트 핸들러
const handleSubmit = () => {};
const handleDelete = () => {};
const handleChange = (e: Event) => {};

// ✅ 변환 함수
const convertToEvent = (data: EventForm) => {};
const parseDate = (dateString: string) => {};
```

### 컴포넌트

**PascalCase, 명사형**

```typescript
// ✅ 좋은 예
function EventList() {}
function UserProfile() {}
function CalendarView() {}

// ❌ 나쁜 예
function eventList() {} // camelCase
function HandleSubmit() {} // 동사형
```

### 타입/인터페이스

**PascalCase**

```typescript
// ✅ Props는 Interface
interface EventFormProps {
  onSubmit: (data: EventForm) => void;
  initialData?: Event;
}

// ✅ 나머지는 Type
type EventStatus = 'pending' | 'completed';
type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly';
```

### 상수

**UPPER_SNAKE_CASE**

```typescript
const API_URL = 'http://localhost:3000';
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 10;
```

---

## 함수 작성 규칙

### 컴포넌트: function 키워드

```typescript
// ✅ 컴포넌트
export default function EventList() {
  return <div>...</div>;
}

export function EventItem({ event }: Props) {
  return <article>...</article>;
}
```

### 일반 함수: 화살표 함수

```typescript
// ✅ 유틸 함수
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// ✅ 이벤트 핸들러
const handleClick = () => {
  console.log('clicked');
};
```

---

## 파일 네이밍

### 컴포넌트

**PascalCase.tsx**

```
EventList.tsx
UserProfile.tsx
CalendarView.tsx
```

### 유틸/훅/타입

**camelCase.ts**

```
dateUtils.ts
useFetchData.ts
eventTypes.ts
formatDate.ts
```

### 폴더

**kebab-case**

```
user-profile/
event-list/
calendar-view/
```

---

## Import 순서

```typescript
// 1. React 내장
import { useState, useEffect } from 'react';

// 2. 외부 패키지
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

// 3. 내부 모듈 (절대 경로)
import { Event, EventForm } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { useEventOperations } from '@/hooks/useEventOperations';

// 4. 상대 경로
import { EventItem } from './EventItem';
import styles from './EventList.module.css';
```

---

## Props 순서

```typescript
interface ComponentProps {
  // 1. 필수 props
  id: string;
  title: string;

  // 2. 선택적 props
  description?: string;
  className?: string;

  // 3. 콜백 함수
  onSubmit?: () => void;
  onDelete?: (id: string) => void;

  // 4. 스타일 관련
  style?: CSSProperties;

  // 5. 기타
  children?: ReactNode;
}
```

---

## 코드 스타일

### 배열/객체

```typescript
// ✅ 복수형 사용
events.map((event) => {});
users.filter((user) => {});

// ✅ 단수형 사용
const event = events[0];
const user = users.find((u) => u.id === id);
```

### 조건부 렌더링

```typescript
// ✅ 단순한 경우
{isLoading && <Loading />}

// ✅ 양방향 조건
{isLoading ? <Loading /> : <Content />}

// ✅ Early Return (컴포넌트)
function EventList({ events }: Props) {
  if (!events) return <Loading />;
  if (events.length === 0) return <EmptyState />;

  return <div>{events.map(...)}</div>;
}
```

### 버튼 타입 명시

```tsx
// ✅ 항상 type 속성
<button type="button">클릭</button>
<button type="submit">제출</button>
<button type="reset">초기화</button>

// ❌ type 없음
<button>클릭</button>
```

---

## 주석 규칙

### JSDoc (export된 함수/변수)

```typescript
/**
 * 반복 일정 이벤트 목록을 생성합니다
 * @param baseEvent 기본 이벤트 정보
 * @returns 생성된 이벤트 배열
 */
export const generateRecurringEvents = (baseEvent: Event): Event[] => {
  // ...
};
```

### 일반 주석 (내부 함수)

```typescript
// 날짜를 YYYY-MM-DD 형식으로 포맷
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
```

### 복잡한 로직 설명

```typescript
// 31일이 없는 달은 건너뛰기
// (2월, 4월, 6월, 9월, 11월)
if (day === 31 && MONTHS_WITHOUT_31.includes(month)) {
  continue;
}
```

---

## 타입 사용

### any 금지

```typescript
// ❌ any 사용
function process(data: any) {}

// ✅ 구체적인 타입
function process(data: Event | EventForm) {}

// ✅ 제네릭 사용
function process<T>(data: T) {}
```

### 타입 vs 인터페이스

```typescript
// ✅ Props는 Interface
interface EventListProps {
  events: Event[];
}

// ✅ 나머지는 Type
type EventStatus = 'pending' | 'completed';
type FilterFn = (event: Event) => boolean;
```

---

## 매직 넘버 제거

```typescript
// ❌ 매직 넘버
if (events.length > 100) {
}
setTimeout(callback, 3000);

// ✅ 상수로 추출
const MAX_EVENTS = 100;
const DEBOUNCE_DELAY = 3000;

if (events.length > MAX_EVENTS) {
}
setTimeout(callback, DEBOUNCE_DELAY);
```

---

## 체크리스트

코드 작성 시:

- [ ] 네이밍이 명확한가?
- [ ] 함수가 한 가지 일만 하는가?
- [ ] 매직 넘버를 제거했는가?
- [ ] 타입이 명확한가? (any 없음)
- [ ] 주석이 필요한 부분에 달았는가?
- [ ] Import 순서가 올바른가?
