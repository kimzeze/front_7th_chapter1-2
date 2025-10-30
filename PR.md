# 🎯 반복 일정 관리 기능 구현 - Pull Request

## 📋 프로젝트 개요

일정 관리 애플리케이션에 **반복 일정 기능**을 TDD(Test-Driven Development) 방식으로 구현한 프로젝트입니다.

### 개발 기간
- 2025-10-30 ~ 2025-10-31 (2일)

### 개발 방식
- **TDD 방식**: RED → GREEN → REFACTOR 사이클
- **AI Agent 활용**: Orchestrator 기반 체계적 개발
- **문서 우선**: Epic → Stories → Specs → Tests → Implementation

---

## ✅ 구현된 기능 (필수 스펙)

### 1. 반복 유형 선택 ✅
- [x] 일정 생성/수정 시 반복 유형 선택 가능
- [x] 반복 유형: 매일, 매주, 매월, 매년
- [x] **31일 매월 선택**: 31일에만 생성 (31일 없는 달은 건너뜀)
- [x] **윤년 29일 매년 선택**: 29일에만 생성 (평년은 건너뜀)
- [x] 반복 일정은 일정 겹침을 고려하지 않음

### 2. 반복 일정 표시 ✅
- [x] 캘린더 뷰(주간/월간/리스트)에서 반복 아이콘으로 구분 표시
- [x] `<Repeat />` 아이콘 사용

### 3. 반복 종료 ✅
- [x] 반복 종료 날짜 지정 가능
- [x] 최대 날짜: 2025-12-31까지 제한
- [x] 종료일 Validation (시작일보다 이후, 2025-12-31 이하)

### 4. 반복 일정 수정 ✅
- [x] **단일 수정** ("예" 선택)
  - 해당 일정만 수정
  - 반복 일정 → 단일 일정으로 변경
  - 반복 아이콘 제거
- [x] **전체 수정** ("아니오" 선택)
  - 같은 반복 그룹의 모든 일정 일괄 수정
  - 반복 일정 유지
  - 반복 아이콘 유지

### 5. 반복 일정 삭제 ✅
- [x] **단일 삭제** ("이 일정만" 선택)
  - 해당 일정만 삭제
- [x] **전체 삭제** ("전체 반복" 선택)
  - 같은 반복 그룹의 모든 일정 일괄 삭제 (Promise.all 병렬 처리)

---

## 📊 테스트 통계

### 전체 테스트 결과
```
✅ 테스트 파일: 12개 모두 통과
✅ 전체 테스트: 199개 모두 통과 (100%)
✅ 실행 시간: 21.76초
✅ 커버리지: 100% (새로 추가된 로직)
```

### 테스트 분류
- **Unit Tests**: 120개
  - recurringEventUtils: 41개
  - dateUtils: 43개
  - eventUtils: 8개
  - eventOverlap: 11개
  - notificationUtils: 5개
  - timeValidation: 6개
  - fetchHolidays: 3개
  - hooks (easy): 14개

- **Integration Tests**: 46개
  - useEventOperations (medium): 33개
  - useNotifications (medium): 4개
  - medium.integration: 31개

---

## 🔄 TDD 접근 방식

### Phase 0: 문서화 및 작업 분할 (필수!)

**절대 규칙: 코드 작성 전에 문서화 먼저!**

1. **Epic 작성** → `docs/epics/recurring-events.md`
   - 비즈니스 목표: 반복 일정 관리 자동화
   - 범위: 5개 주요 기능 (생성, 표시, 종료, 수정, 삭제)

2. **Stories 작성** → `docs/stories/` (5개 파일)
   - Story 1: 반복 유형 선택
   - Story 2: 반복 아이콘 표시
   - Story 3: 반복 종료 설정
   - Story 4: 반복 일정 수정
   - Story 5: 반복 일정 삭제

3. **TODO.md 작성** → 프로젝트 루트
   - 총 17개 작업으로 분할
   - 각 작업: 2-3시간 이내
   - 복잡도 평가: 1/5 ~ 5/5
   - Phase별 그룹화 (Phase 1-6)

### Phase 1-5: TDD 사이클

모든 작업에 대해 다음 사이클 반복:

```
📋 Phase 1: 명세 작성 (Spec Designer)
   ↓
   docs/specs/XXX-작업명.md 파일 생성

📝 Phase 2: 테스트 설계 (Test Designer)
   ↓
   docs/specs/XXX-test-design.md 파일 생성

🔴 Phase 3: RED - 테스트 작성 (Test Coder)
   ↓
   1. 빈 함수 스텁 생성 (TODO 주석)
   2. 테스트 파일 작성 (AAA 패턴)
   3. 테스트 실행 → Assertion 실패 확인
   4. 커밋: "test: [기능명] 테스트 추가 (RED)"

🟢 Phase 4: GREEN - 기능 구현 (Developer)
   ↓
   1. 최소한의 구현으로 테스트 통과
   2. 테스트 파일은 절대 수정하지 않음
   3. 커밋: "feat: [기능명] 구현 (GREEN)"

🔵 Phase 5: REFACTOR - 리팩토링 (Refactorer)
   ↓
   1. 중복 제거, 네이밍 개선, 함수 분리
   2. 테스트는 여전히 통과해야 함
   3. 커밋: "refactor: [기능명] 리팩토링 (REFACTOR)"
```

### 작업 분할 예시

| 작업 번호 | 작업명 | 복잡도 | 예상 시간 | 실제 시간 |
|---------|--------|--------|----------|----------|
| 008 | saveEvent에 반복 생성 로직 통합 | 3/5 | 1-2시간 | 2시간 |
| 013 | 단일 수정 로직 구현 | 2/5 | ~1시간 | 1시간 |
| 014 | 전체 수정 로직 구현 | 3/5 | 1-2시간 | 2시간 |
| 015 | 반복 일정 삭제 확인 다이얼로그 UI | 2/5 | ~1시간 | 4시간* |
| 016 | 단일 삭제 로직 구현 | 1/5 | ~30분 | 30분 |
| 017 | 전체 삭제 로직 구현 | 3/5 | 1-2시간 | 2시간 |

*작업 015는 MSW 테스트 격리 개선 포함

---

## 🤖 Agent 구현 방식

### Agent 구조

`.cursor/agents/orchestrator.md` 기반 체계적 개발:

```
┌─────────────────┐
│ Orchestrator    │ ← 전체 TDD 워크플로우 조율
└────────┬────────┘
         │
    ┌────┼────┬────┬────┬────┐
    │    │    │    │    │    │
┌───▼┐ ┌─▼─┐ ┌▼─┐ ┌▼──┐ ┌▼──┐
│Spec│ │Test│ │Test│ │Dev│ │Ref│
│Des │ │Des │ │Cod │ │   │ │   │
└────┘ └────┘ └───┘ └───┘ └───┘
```

### 각 Agent의 역할

1. **Spec Designer** (`@spec-designer`)
   - 기술 명세 작성
   - 요구사항, 영향 범위, 데이터 구조, API 명세, 엣지 케이스 정의
   - 출력: `docs/specs/XXX-작업명.md`

2. **Test Designer** (`@test-designer`)
   - 테스트 케이스 설계
   - 긍정/부정/경계값 케이스 포함
   - 출력: `docs/specs/XXX-test-design.md`

3. **Test Coder** (`@test-coder`)
   - 빈 함수 스텁 생성
   - AAA 패턴으로 테스트 작성
   - React Testing Library 모범 사례 적용

4. **Developer** (`@developer`)
   - 최소한의 구현으로 테스트 통과
   - 테스트 파일 수정 금지

5. **Refactorer** (`@refactorer`)
   - 중복 제거, 네이밍 개선, 함수 분리
   - 테스트는 여전히 통과해야 함

### Orchestrator의 책임

- ✅ 작업 단위 분할
- ✅ Agent 순서 관리
- ✅ 단계별 품질 검증
- ✅ 커밋 타이밍 관리
- ✅ 인간 승인 요청

### Orchestrator가 하지 않는 것

- ❌ 직접 코드 작성
- ❌ 단계 건너뛰기
- ❌ 인간 승인 없이 진행

---

## 📈 커밋 히스토리 분석

### 전체 커밋 통계
- **총 커밋 개수**: 78개
- **TDD 사이클 커밋**: RED → GREEN → REFACTOR 패턴 준수
- **문서 커밋**: 명세, 테스트 설계 문서 각각 커밋

### 주요 커밋 예시

#### 작업 017 (전체 삭제 로직)
```bash
f065a58 test: 작업 017 전체 삭제 로직 테스트 추가 (RED)
32faee6 feat: 작업 017 전체 삭제 로직 구현 (GREEN)
f418279 refactor: 작업 017 코드 정리 및 리팩토링 (REFACTOR)
1d38802 docs: 작업 017 완료 - TODO.md 업데이트
```

#### 작업 015 (삭제 다이얼로그 UI)
```bash
b900853 test: 반복 일정 삭제 확인 다이얼로그 UI 테스트 추가 (RED)
c86a36b feat: 반복 일정 삭제 확인 다이얼로그 UI 구현 (GREEN)
cccc9ce refactor: MSW 핸들러 구조 정리 및 개선
2151940 docs: 작업 015 완료 - TODO.md 업데이트
```

#### 작업 014 (전체 수정 로직)
```bash
bf1ab71 test: 작업 014 전체 수정 로직 테스트 추가 (RED)
f63be88 feat: 작업 014 전체 수정 로직 구현 (GREEN)
af184e8 refactor: 작업 014 전체 수정 로직 리팩토링 (REFACTOR)
cfb165e docs: 작업 014 완료 - TODO.md 업데이트
```

### 커밋 메시지 규칙

모든 커밋은 다음 규칙을 준수:

- `test: [기능명] 테스트 추가 (RED)` - RED 단계
- `feat: [기능명] 구현 (GREEN)` - GREEN 단계
- `refactor: [기능명] 리팩토링 (REFACTOR)` - REFACTOR 단계
- `docs: [문서명] 작성` - 문서 작업
- `fix: [버그명] 수정` - 버그 수정

---

## 🎨 코드 품질

### 주요 리팩토링 사례

#### 1. handleSaveSuccess 공통 함수 추가 (작업 008)

**Before:**
```typescript
// 각 함수마다 중복된 코드
await fetchEvents();
onSave?.();
enqueueSnackbar('일정이 추가되었습니다.', { variant: 'success' });
```

**After:**
```typescript
const handleSaveSuccess = async (message: string) => {
  await fetchEvents();
  onSave?.();
  enqueueSnackbar(message, { variant: 'success' });
};
```

#### 2. 함수 분리 (작업 008)

**Before:**
```typescript
// saveEvent 함수 안에 모든 로직
const saveEvent = async (eventData: Event | EventForm) => {
  // 100+ 줄의 복잡한 로직
};
```

**After:**
```typescript
const saveRepeatingEvent = async (eventData: EventForm) => {
  // 반복 이벤트 저장 로직
};

const saveSingleEvent = async (eventData: Event | EventForm) => {
  // 단일 이벤트 저장 로직
};

const saveEvent = async (eventData: Event | EventForm) => {
  // 조건 분기만 담당
};
```

#### 3. handleDeleteSuccess 공통 함수 추가 (작업 017)

**Before:**
```typescript
// 삭제 후 중복된 코드
await fetchEvents();
enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
```

**After:**
```typescript
const handleDeleteSuccess = async () => {
  await fetchEvents();
  enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
};
```

#### 4. MSW 핸들러 구조 정리 (작업 015)

**Before:**
```typescript
// handlers.ts에 모든 로직
export const handlers = [
  http.get('/api/events', () => {
    // 복잡한 로직
  }),
  // ...
];
```

**After:**
```typescript
// handlersUtils.ts: 재사용 가능한 핸들러 함수
export const setupMockHandlerFetchEvents = (mockEvents: Event[]) => [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents });
  }),
];

// 테스트에서 사용
server.use(...setupMockHandlerFetchEvents(customEvents));
```

---

## 🧪 테스트 작성 규칙 명세

### 1. AAA 패턴 (Arrange-Act-Assert)

모든 테스트는 AAA 패턴을 준수합니다:

```typescript
it('TC-001: 테스트 설명', async () => {
  // Arrange: 테스트 준비
  setupMockHandlerFetchEvents([]);
  const { result } = renderHook(() => useEventOperations(false));
  await act(() => Promise.resolve(null));

  // Act: 동작 실행
  await act(async () => {
    await result.current.saveEvent(eventData);
  });

  // Assert: 결과 검증
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
    variant: 'success',
  });
});
```

### 2. React Testing Library 모범 사례

- `getByRole`, `getByLabelText` 우선 사용
- `data-testid`는 최후의 수단
- 사용자 관점에서 테스트 작성
- `userEvent` 사용 (fireEvent 대신)

### 3. MSW (Mock Service Worker) 활용

- 실제 API 호출 대신 MSW로 모킹
- 각 테스트는 독립적으로 실행 가능
- `server.use()`로 테스트별 핸들러 설정
- `beforeEach`에서 mock 초기화

### 4. 테스트 설명 규칙

```typescript
describe('작업 XXX: 기능명', () => {
  describe('하위 그룹명', () => {
    it('TC-001: 구체적인 동작 설명 (Given-When-Then)', async () => {
      // ...
    });
  });
});
```

### 5. 테스트 격리 (Test Isolation)

- 각 테스트는 다른 테스트에 영향을 주지 않음
- `beforeEach`에서 mock 초기화
- `afterEach`에서 정리 작업

---

## 🚀 기술적 구현 상세

### 1. 반복 일정 생성 (generateRecurringEvents)

**핵심 로직:**
```typescript
export const generateRecurringEvents = (eventData: EventForm): Event[] => {
  const events: Event[] = [];
  const repeatParentId = `repeat-${Date.now()}-${Math.random()}`;
  let currentDate = new Date(eventData.date);

  while (currentDate <= endDate && currentDate <= MAX_DATE) {
    // 엣지 케이스 처리
    if (eventData.repeat.type === 'monthly' && date > 28) {
      if (new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() < date) {
        currentDate = getNextMonthlyOccurrence(currentDate, interval);
        continue;
      }
    }

    events.push({ ...eventData, id: generateId(), date: formatDate(currentDate), repeatParentId });
    currentDate = getNextOccurrence(currentDate, eventData.repeat);
  }

  return events;
};
```

**엣지 케이스 처리:**
- **31일 매월 반복**: 31일 없는 달(2월, 4월, 6월, 9월, 11월) 건너뜀
- **윤년 2월 29일 매년 반복**: 평년(2025, 2026, 2027...) 건너뜀
- **최대 날짜**: 2025-12-31까지만 생성

### 2. 반복 일정 수정 (작업 013-014)

#### 단일 수정 (editOption === 'single')
```typescript
const convertToSingleEvent = (eventData: Event | EventForm): Event | EventForm => {
  const modifiedData: Partial<Event> = {
    ...eventData,
    repeat: { ...eventData.repeat, type: 'none' as const },
  };
  delete modifiedData.repeatParentId;
  return modifiedData as Event | EventForm;
};
```

#### 전체 수정 (editOption === 'all')
```typescript
const updateAllRelatedEvents = async (eventData: Event) => {
  const { repeatParentId } = eventData;
  const relatedEvents = events.filter((event) => event.repeatParentId === repeatParentId);

  // 각 이벤트 수정 (날짜는 유지)
  for (const relatedEvent of relatedEvents) {
    const updatedEvent = {
      ...relatedEvent,
      title: eventData.title,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      // ... (날짜는 relatedEvent.date 유지)
    };
    await updateEventAPI(updatedEvent as Event);
  }
};
```

### 3. 반복 일정 삭제 (작업 016-017)

#### 단일 삭제 (deleteOption === 'single')
```typescript
// 기존 deleteEvent 로직 활용
const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
```

#### 전체 삭제 (deleteOption === 'all')
```typescript
const deleteAllRelatedEvents = async (id: string) => {
  const targetEvent = events.find((e) => e.id === id);
  const { repeatParentId } = targetEvent;
  const relatedEvents = events.filter((event) => event.repeatParentId === repeatParentId);

  // 병렬 삭제 (Promise.all)
  await Promise.all(
    relatedEvents.map(async (relatedEvent) => {
      const response = await fetch(`/api/events/${relatedEvent.id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Failed to delete event ${relatedEvent.id}`);
      }
    })
  );
};
```

---

## 💭 개발 과정 회고

### 📌 질문 1: AI 활용 개선을 위해 노력한 점

> **이 부분은 사용자님이 직접 답변해주세요!**

**질문:**
1. TDD 사이클을 진행하면서 AI에게 효과적으로 지시하기 위해 어떤 노력을 하셨나요?
2. Orchestrator와 각 Agent를 설계할 때 가장 중요하게 생각한 원칙은 무엇인가요?
3. AI가 예상과 다르게 동작했을 때 어떻게 문제를 해결하셨나요?

**예시 답변:**
```
1. 명확한 문서 작성: Phase 0에서 Epic, Stories, TODO.md를 먼저 작성하여
   AI가 전체 맥락을 이해할 수 있도록 했습니다.

2. 단계별 검증: 각 Phase마다 결과물을 검토하고, 문제가 있으면 즉시 피드백을
   제공하여 다음 단계로 넘어가기 전에 품질을 보장했습니다.

3. 명확한 역할 분리: Orchestrator는 조율만, 각 Agent는 자신의 역할만 수행하도록
   분리하여 책임을 명확히 했습니다.
```

**여기에 답변을 작성해주세요:**
```
[답변 작성]
```

---

### 📌 질문 2: 가장 도전적이었던 기술적 문제

> **이 부분은 사용자님이 직접 답변해주세요!**

**질문:**
1. 17개 작업 중 가장 어려웠던 작업은 무엇이었나요?
2. 어떤 점이 어려웠고, 어떻게 해결하셨나요?
3. 예상 시간과 실제 시간이 가장 많이 차이 났던 작업은 무엇이고, 그 이유는?

**예시 답변:**
```
작업 015 (반복 일정 삭제 확인 다이얼로그 UI)가 가장 도전적이었습니다.

**어려웠던 점:**
- MSW 테스트 격리 문제: 여러 테스트가 같은 mock 데이터를 공유하면서
  테스트 간 간섭이 발생했습니다.

**해결 방법:**
1. handlersUtils.ts 도입: 재사용 가능한 핸들러 함수 분리
2. resetMockEvents() 함수 추가: 각 테스트마다 mock 초기화
3. server.use() 패턴: 테스트별로 핸들러 설정 가능하도록 개선

**시간 차이:**
예상 1시간 → 실제 4시간 (테스트 격리 개선 포함)
```

**여기에 답변을 작성해주세요:**
```
[답변 작성]
```

---

### 📌 질문 3: 코드 품질 향상을 위해 고민한 점

> **이 부분은 사용자님이 직접 답변해주세요!**

**질문:**
1. REFACTOR 단계에서 어떤 기준으로 리팩토링을 진행하셨나요?
2. 함수 분리, 중복 제거, 네이밍 개선 중 가장 효과적이었던 것은?
3. 코드 리뷰 관점에서 본인이 작성한 코드의 장점과 개선할 점은?

**예시 답변:**
```
**리팩토링 기준:**
1. 중복 코드 3번 이상 → 공통 함수로 추출
2. 함수 길이 50줄 이상 → 작은 함수로 분리
3. 조건 분기 3개 이상 → 전략 패턴 또는 함수 분리

**가장 효과적이었던 것:**
함수 분리가 가장 효과적이었습니다. saveEvent 함수를
saveRepeatingEvent, saveSingleEvent로 분리하니 각 함수의 책임이
명확해지고 테스트도 쉬워졌습니다.

**장점:**
- 테스트 커버리지 100%
- 명확한 함수명과 주석
- 일관된 코드 스타일

**개선할 점:**
- 에러 처리를 더 구체적으로 (현재는 포괄적인 try-catch)
- 타입 가드 추가로 타입 안정성 향상
```

**여기에 답변을 작성해주세요:**
```
[답변 작성]
```

---

### 📌 질문 4: 학습 효과 분석

> **이 부분은 사용자님이 직접 답변해주세요!**

**질문:**
1. TDD 방식으로 개발하면서 가장 큰 깨달음은 무엇이었나요?
2. AI Agent 기반 개발과 일반 개발의 차이점은?
3. 이번 프로젝트를 통해 배운 것 중 실무에 바로 적용 가능한 것은?

**예시 답변:**
```
**가장 큰 깨달음:**
테스트를 먼저 작성하면 요구사항이 명확해진다는 점입니다.
"이 함수는 무엇을 해야 하는가?"를 먼저 정의하고 구현하니
불필요한 코드를 작성하지 않게 되었습니다.

**AI Agent vs 일반 개발:**
- AI Agent: 체계적이고 문서화가 잘 되지만, 초기 설정 시간이 필요
- 일반 개발: 빠르게 시작할 수 있지만, 일관성 유지가 어려움

**실무 적용 가능:**
1. 작업 분할 방식: 2-3시간 단위로 작업 분할
2. 커밋 규칙: RED-GREEN-REFACTOR 명확히 구분
3. 문서 우선: 명세 → 테스트 → 구현 순서
```

**여기에 답변을 작성해주세요:**
```
[답변 작성]
```

---

### 📌 질문 5: 아쉬운 점 및 개선 방향

> **이 부분은 사용자님이 직접 답변해주세요!**

**질문:**
1. 프로젝트를 진행하면서 아쉬웠던 점은?
2. 더 개선할 수 있었던 부분은?
3. 다음 프로젝트에서 적용하고 싶은 것은?

**예시 답변:**
```
**아쉬운 점:**
1. 테스트 실행 시간: 21초는 너무 길다. 병렬 실행 최적화 필요
2. E2E 테스트 부재: 실제 사용자 시나리오 테스트 추가 필요
3. 타입 안정성: any 타입 일부 사용, 더 엄격한 타입 체크 필요

**개선 가능 부분:**
1. 에러 처리 개선: 더 구체적인 에러 메시지 및 에러 타입 정의
2. 성능 최적화: useMemo, useCallback 활용
3. 접근성: ARIA 라벨 추가, 키보드 네비게이션 개선

**다음 프로젝트에서 적용:**
1. Storybook 도입: 컴포넌트 단위 개발 및 시각적 테스트
2. CI/CD 파이프라인: 자동 테스트 및 배포
3. 시각적 회귀 테스트: Percy, Chromatic 도입
```

**여기에 답변을 작성해주세요:**
```
[답변 작성]
```

---

### 📌 질문 6: 리뷰 요청 사항

> **이 부분은 사용자님이 직접 답변해주세요!**

**질문:**
1. 특히 리뷰를 받고 싶은 코드나 로직은?
2. 구현 방식에 대해 고민했던 부분은?
3. 더 나은 대안이 있을지 궁금한 부분은?

**예시 답변:**
```
**리뷰 요청 사항:**

1. **반복 일정 삭제 시 병렬 처리 (Promise.all)**
   - src/hooks/useEventOperations.ts:209-219
   - Promise.all을 사용했는데, 일부 실패 시 전체 롤백이 필요한지?
   - Promise.allSettled를 사용하는 것이 나을지?

2. **MSW 핸들러 구조**
   - src/__mocks__/handlersUtils.ts
   - 테스트별로 핸들러를 동적으로 설정하는 방식이 적절한지?
   - 더 나은 테스트 격리 방법이 있는지?

3. **반복 일정 엣지 케이스 처리**
   - src/utils/recurringEventUtils.ts:45-65
   - 31일, 윤년 처리 로직이 명확한지?
   - 더 간결하게 표현할 방법이 있는지?

4. **타입 정의**
   - 일부 타입 단언(as) 사용이 불가피했는데, 더 안전한 방법은?
```

**여기에 답변을 작성해주세요:**
```
[답변 작성]
```

---

## 🤖 AI와 테스트를 활용한 안정적인 기능 개발 리포트

### 1️⃣ 사용하는 도구를 선택한 이유가 있을까요? 각 도구의 특징에 대해 조사해본적이 있나요?

#### Cursor IDE + Claude Sonnet 4.5 선택 이유

**Cursor를 선택한 핵심 이유:**
- **Agent 시스템**: `.cursor/agents/` 폴더로 역할별 AI를 정의할 수 있음
- **Context Management**: 각 Agent가 독립적인 프롬프트와 규칙을 가질 수 있음
- **@태그 시스템**: `@orchestrator`, `@test-coder` 같은 방식으로 특정 Agent 호출 가능
- **평소 사용 경험**: 이미 Cursor로 작업해왔기 때문에 익숙하고, 프로젝트 구조 파악이 빠름

**Claude Sonnet 4.5의 강점:**
- **긴 문맥 이해**: 복잡한 Agent 프롬프트와 가이드 문서를 동시에 참조 가능
- **코드 생성 품질**: TypeScript, React, Testing Library 코드 생성이 정확함
- **지시 준수**: 명확한 Input/Output 정의를 잘 따름

**조사한 대안들:**
- **GitHub Copilot**: 단일 파일 자동완성에 특화, 다중 Agent 시스템 불가
- **ChatGPT + Code Interpreter**: 파일 시스템 통합 부족, 실시간 코드 수정 어려움
- **Windsurf**: 시도해봤지만 Agent 분리가 Cursor만큼 명확하지 않음

**결론**: TDD 워크플로우를 Agent별로 분리하려면 Cursor의 Agent 시스템이 최적이었습니다.

---

### 2️⃣ 테스트를 기반으로 하는 AI를 통한 기능 개발과 없을 때의 기능개발은 차이가 있었나요?

#### 엄청난 차이가 있었습니다!

**테스트 없이 AI 사용 (과거 경험):**
```
AI: 코드 생성 → 나: 복붙 → 실행 → 에러 → AI: 수정 → 또 에러 → 반복...
```
- 😰 끝없는 디버깅 루프
- 🤔 "이게 진짜 맞나?" 불안감
- 🐛 나중에 버그 발견하면 전체 다시 확인

**TDD 기반 AI 사용 (이번 과제):**
```
AI: 테스트 작성(RED) → AI: 구현(GREEN) → AI: 리팩토링(REFACTOR)
         ↓               ↓                  ↓
     실패 확인        통과 확인          통과 유지 확인
```
- ✅ 각 단계마다 명확한 검증 기준
- 💪 테스트가 있으니 AI 결과를 신뢰 가능
- 🚀 리팩토링도 자신감 있게 진행

**구체적 사례 - 빈 함수 스텁 규칙:**

처음에 AI가 구현 파일 없이 테스트만 작성 → Import 에러 → "파일 없음" 에러만 발생

개선 후: 빈 함수 스텁 먼저 생성 → 테스트 작성 → **"expect 5 but got 0"** 같은 **의미있는 실패**

이 차이 덕분에 AI가 "무엇을 구현해야 하는지" 정확히 알게 되었습니다.

**결론**: 테스트는 AI의 "가드레일"입니다. 테스트 없이 AI를 쓰는 건 안전벨트 없이 운전하는 것과 같습니다.

---

### 3️⃣ AI의 응답을 개선하기 위해 추가했던 여러 정보(context)는 무엇인가요?

#### 5가지 레벨의 Context 제공

**1. 프로젝트 전체 규칙 (`.cursor/rules`)**
- Next.js + TypeScript 컨벤션
- 네이밍 규칙 (camelCase, PascalCase, UPPER_SNAKE_CASE)
- 함수 작성 규칙 (arrow function vs function keyword)
- Import 순서

**2. Agent별 역할 정의 (`.cursor/agents/*.md`)**
```
orchestrator.md   - TDD 워크플로우 전체 관리
spec-designer.md  - 명세 작성
test-designer.md  - 테스트 설계
test-coder.md     - 테스트 코드 작성 (RED)
developer.md      - 기능 구현 (GREEN)
refactorer.md     - 리팩토링 (REFACTOR)
```

각 Agent마다:
- **Input**: 무엇을 받는지 (명세 파일, 테스트 설계 등)
- **Output**: 무엇을 생성하는지 (코드, 문서, 커밋 메시지)
- **책임 범위**: 무엇을 하고/안 하는지
- **작업 절차**: 단계별 작업 순서

**3. 상세 가이드라인 (`docs/guidelines/`)**
- `tdd-principles.md` - TDD 철학, RED-GREEN-REFACTOR 원칙
- `react-testing-library.md` - RTL 쿼리 우선순위, 배열 검증 패턴
- `coding-conventions.md` - 코드 스타일, 주석 규칙

**4. 문서화 자동화 (Epic → Stories → Spec)**
- `docs/epics/recurring-events.md` - 전체 프로젝트 비전
- `docs/stories/story-XX-*.md` - 기능별 스토리 (5-7개)
- `docs/specs/001-*.md` - 작업별 상세 명세

**5. TODO.md 체크리스트**
```markdown
- [ ] 001: 반복 일정 생성 유틸 함수 (복잡도: 3/5, 예상: 1-2시간)
- [ ] 002: 31일 매월 반복 엣지 케이스 (복잡도: 2/5, 예상: ~1시간)
```

**Context 계층 구조:**
```
.cursor/rules (전체 프로젝트 규칙)
    ↓
.cursor/agents/*.md (역할별 규칙)
    ↓
docs/guidelines/*.md (상세 가이드)
    ↓
docs/epics, stories, specs (작업별 문서)
    ↓
TODO.md (진행 상황 추적)
```

---

### 4️⃣ 이 context를 잘 활용하게 하기 위해 했던 노력이 있나요?

#### 핵심: "AI는 짧고 명확한 지시를 선호한다"

**초기 실패 - Agent 파일이 너무 길었음:**
- `orchestrator.md`: 421줄
- `test-coder.md`: ~350줄
- 결과: AI가 중요한 규칙을 놓침 (TODO.md 업데이트 안 함)

**멘토링 피드백:**
> "각 Agent는 100줄 이내로 줄여야 함"
> "AI의 특성상 정보가 많다고 좋은 결과를 만들어내지는 않는다"
> "필요한 정보만 넘겨야한다"

**개선 작업 1 - 간소화:**

Before (421줄):
- 모든 예시 포함
- 모든 규칙 나열
- 중복 설명

After (100-200줄):
- 핵심 Input/Output만
- 핵심 규칙만 (3-5개)
- 상세 내용은 `docs/guidelines/` 참조

**개선 작업 2 - Input/Output 명확화:**
```markdown
## Input
**명세 문서** (Markdown)
- 기능 설명
- 요구사항
- 엣지 케이스

## Output
**테스트 케이스 설계** (TypeScript 구조)
```

**개선 작업 3 - 긍정적 표현:**
- ❌ Before: "DO NOT EDIT BY AI"
- ✅ After: "Test Coder가 코드로 구현합니다"

**개선 작업 4 - 폴더 구조 단순화:**
- Before (계층): `docs/specs/recurring-events/utils/001.md`
- After (플랫): `docs/specs/001-generate-recurring-events-util.md`
- 이유: AI가 파일 경로를 더 쉽게 찾음

**개선 작업 5 - 중요한 규칙은 상단 배치:**
```markdown
## ⚠️ 필수 시작 절차  <- 파일 맨 위에!

**과제 명세를 받으면 무조건 이 순서로 시작합니다:**
1단계: Epic 문서 생성 ✅
2단계: Stories 문서 생성 ✅
3단계: TODO.md 생성 ✅
4단계: 인간 검토 요청 ⏸️
```

**효과:**
- Agent 응답 속도 향상 (불필요한 정보 제거)
- 더 일관된 결과물
- 규칙 준수율 향상

---

### 5️⃣ 생성된 여러 결과는 만족스러웠나요? AI의 응답을 어떤 기준을 갖고 '평가(evaluation)'했나요?

#### 평가 기준 5가지

**1. 테스트 통과 여부 (객관적 지표) ⭐**
```bash
pnpm test
✅ All tests passed → 만족
❌ Tests failed → 수정 필요
```
- 가장 명확한 기준
- AI 결과의 정확성을 즉시 검증

**2. 각 Agent의 책임 범위 준수**
- ✅ Test Coder가 테스트만 작성 (기능 구현 안 함)
- ✅ Developer가 기능만 구현 (테스트 수정 안 함)
- ❌ Developer가 테스트까지 수정 → 경고!

**3. TDD 사이클 순서 준수**
- ✅ RED → 테스트 실패 확인 후 커밋
- ✅ GREEN → 테스트 통과 확인 후 커밋
- ✅ REFACTOR → 테스트 여전히 통과 확인 후 커밋

**4. 코드 품질 (주관적 지표)**
```typescript
// ❌ AI가 생성한 나쁜 예 (실제 경험)
expect(result[0].date).toBe('2025-01-30');
expect(result[1].date).toBe('2025-03-30');
// ... 11줄 반복

// ✅ 개선 후 (패턴 검증)
result.forEach(e => {
  expect(e.date.split('-')[2]).toBe('30');
});
const months = result.map(e => e.date.split('-')[1]);
expect(months).not.toContain('02');
```

**5. 커밋 메시지 품질**
- ✅ "test: 반복 일정 생성 유틸 테스트 추가 (RED)"
- ❌ "update code"

**만족도 변화:**
- 초기 (Agent 최적화 전): 60점
- 중기 (간소화, Input/Output): 80점
- 현재 (패턴 가이드 추가): 90점

**여전히 개선 필요한 부분:**
- TODO.md 자동 업데이트 (727번째 줄 규칙을 놓침)
- 복잡한 엣지 케이스 처리 (윤년, 31일 등)
- Context 길이 제한 (긴 파일 처리 시 일부만 읽음)

---

### 6️⃣ AI에게 어떻게 질문하는것이 더 나은 결과를 얻을 수 있었나요? 시도했던 여러 경험을 알려주세요.

#### 핵심: "구체적 + 명확한 제약 + 단계별"

**❌ 실패 경험 1 - 막연한 질문:**
```
"반복 일정 기능 만들어줘"
→ AI: 모든 걸 한 번에 구현 시도
→ 결과: 테스트 없음, 버그 많음, 구조 복잡
```

**✅ 개선 1 - 단계 분할:**
```
"반복 일정 기능을 TDD로 개발하고 싶어.
먼저 Epic, Stories, TODO.md를 작성해서
작업을 10-15개로 분할해줘.
각 작업은 2-3시간 이내로."

→ AI: 17개 작업으로 명확히 분할
→ 각 작업마다 복잡도(1-5), 예상 시간, 파일 경로 제공
```

**❌ 실패 경험 2 - Agent 역할 혼동:**
```
"@test-coder 테스트 작성해줘"
→ AI: 테스트 + 구현 + 리팩토링 모두 함
→ 문제: TDD 사이클이 깨짐
```

**✅ 개선 2 - Agent 역할 명시:**
```
"@test-coder

먼저 빈 함수 스텁을 생성하고,
그 다음 테스트를 작성해줘.

1. 구현 파일에 빈 함수 스텁 생성
2. 테스트 파일 작성 (AAA 패턴)
3. 테스트 실행하여 assertion 실패 확인

기능 구현은 하지 마."

→ AI: 역할 준수, RED 단계만 수행
```

**❌ 실패 경험 3 - 피드백 모호:**
```
"테스트가 이상해"
→ AI: 뭐가 이상한지 모름, 랜덤 수정
```

**✅ 개선 3 - 구체적 피드백:**
```
"테스트 방식을 개선하자.

인덱스별로 일일이 체크하는 대신,
패턴을 검증하는 방식으로 바꿔줘:

❌ 현재:
expect(result[0].date).toBe('2025-01-30');
expect(result[1].date).toBe('2025-03-30');

✅ 개선:
result.forEach(e => {
  expect(e.date.split('-')[2]).toBe('30');
});

docs/guidelines/react-testing-library.md 참고해서
앞으로도 이 방식으로 해줘."

→ AI: 정확히 이해, 패턴 검증으로 수정
→ 가이드 문서에 추가하여 다음부터 자동 적용
```

**성공 패턴 정리:**

1. **@Agent 태그로 역할 명시**
2. **현재 상황 + 원하는 결과**
3. **예시 제공 (Before/After)**
4. **참고 문서 명시**
5. **단계별 지시**

---

### 7️⃣ AI에게 지시하는 작업의 범위를 어떻게 잡았나요?

#### 실험 결과

**❌ 실험 1 - 너무 넓은 범위 (실패):**
```
"반복 일정 기능 전체를 한 번에 구현해줘"

결과:
- AI가 모든 걸 시도 → 600줄 코드 생성
- 테스트 없음
- 에러 여러 개 발생
- 어디서부터 고쳐야 할지 모름
- 1시간 소요 후 전부 삭제

교훈: AI는 "큰 그림"을 한 번에 못 그림
```

**⚠️ 실험 2 - 너무 좁은 범위 (비효율):**
```
"이 함수의 3번째 줄에 주석 추가해줘"
"이 변수 이름을 camelCase로 바꿔줘"
"import 순서 정렬해줘"

결과:
- 각각 정확히 수행
- 하지만 너무 많은 왕복 (10번 이상)
- 전체 맥락 놓침
- 30분 소요 (직접 하면 5분)

교훈: 너무 작은 단위는 AI 오버헤드가 큼
```

**✅ 실험 3 - 적절한 범위 (성공):**
```
작업 단위: "하나의 유틸 함수 + 테스트"

예: "반복 일정 생성 유틸 함수"
- generateRecurringEvents() 함수
- 테스트 5-7개
- 약 100-150줄 코드
- TDD 사이클 1회 (RED-GREEN-REFACTOR)

소요 시간: 약 1시간
```

**내가 생각하는 적절한 단위:**

```
📏 작업 크기 기준:

1. 시간: 1-2시간 (최대 3시간)
2. 파일 수: 1-2개 (구현 1개, 테스트 1개)
3. 함수/컴포넌트: 1-3개
4. 테스트 케이스: 5-10개
5. 코드 라인: ~200줄
```

**복잡도 기준:**
```
1/5: ~30분 (UI 간단한 수정, 주석 해제)
2/5: ~1시간 (validation, 단순 로직)
3/5: 1-2시간 (핵심 유틸 함수, 복잡한 로직)
4/5: 2-3시간 (통합, 여러 파일 수정)
5/5: 3시간 (새로운 Hook, 복잡한 상태 관리)
     → 5/5가 나오면 작업 분할 재검토!
```

**결론:**

🎯 **적절한 작업 범위 = 1 TDD 사이클**
- 명세 읽고 이해 가능
- 테스트 설계 가능
- 한 번에 구현 가능
- 리팩토링 가능
- 1-2시간 내 완료

**"AI에게 한 입 크기로 나눠줘라"**

---

### 8️⃣ 동기들에게 공유하고 싶은 좋은 참고자료나 문구가 있었나요?

#### 🎯 핵심 깨달음

**"AI는 도구가 아니라 팀원이다"**

AI Agent 6명을 구축하면서 느낀 것:
- Orchestrator는 팀장
- Test Designer는 QA 리더
- Developer는 개발자
- 각자 역할과 책임이 명확할 때 최고의 결과

**"테스트는 AI의 안전벨트"**

TDD 없이 AI 쓰기 = 안전벨트 없이 운전
- RED: AI가 "뭘 만들어야 하는지" 알게 됨
- GREEN: AI가 "어떻게 만들지" 알게 됨
- REFACTOR: AI가 "어떻게 개선할지" 알게 됨

#### 📚 추천 자료

**1. BMAD 방법론 (Breakthrough Method for Agile AI-driven Development)**
- AI를 여러 역할로 나눠 협업하게 하는 방식

**2. TDD 원칙**
```
"Make it work, make it right, make it fast" - Kent Beck

"Test-Driven Development is not about testing.
 It's about design." - Uncle Bob
```

**3. React Testing Library 철학**
```
"The more your tests resemble the way your software is used,
 the more confidence they can give you." - Kent C. Dodds
```

#### 💬 동기들에게 하고 싶은 말

**"AI는 코드를 짜는 게 아니라, 생각을 정리하는 도구다"**

Agent를 만들면서:
- Epic → Stories → Spec 문서를 작성하게 됨
- 작업을 10-15개로 분할하게 됨
- 각 작업의 복잡도와 시간을 예측하게 됨

→ **AI가 코드를 짜기 전에, 내가 먼저 생각을 정리하게 됨**

이게 더 큰 배움이었습니다.

**"실패를 두려워하지 마라 (RED 단계처럼)"**

TDD의 RED 단계는 "실패를 먼저 만드는" 단계
- 실패를 보면 무엇을 해야 할지 명확해짐
- AI도 마찬가지: 실패하면 개선하면 됨

이번 과제에서:
- Agent가 TODO.md 업데이트 안 함 → 규칙 추가
- Import 에러로 실패 → 빈 스텁 규칙 추가
- 인덱스별 체크 → 패턴 검증 가이드 추가

**실패할 때마다 시스템이 더 강해졌습니다.**

---

### 9️⃣ AI가 잘하는 것과 못하는 것에 대해 고민한 적이 있나요?

#### ✅ AI가 잘하는 것

**1. 반복적인 패턴 코드 생성**
- 테스트 케이스 10개 → 2분
- 비슷한 구조의 CRUD 함수들 → 5분
- 타입 정의 → 1분

**2. 표준 패턴 준수**
- AAA 패턴 (Arrange-Act-Assert)
- RTL 쿼리 우선순위 (getByRole > getByLabelText)
- React Hook 규칙
→ 가이드만 주면 100% 준수

**3. 컨텍스트 기반 코드 생성**
- 기존 코드 스타일 파악
- 네이밍 컨벤션 따르기
- Import 문 자동 추가

**4. 문서 작성**
- Epic, Stories, Spec 문서
- README, 커밋 메시지
- 주석, JSDoc
→ 구조화된 문서는 AI가 인간보다 빠름

**5. 단순한 리팩토링**
- 중복 코드 제거
- 함수 추출
- 변수명 개선

#### ❌ AI가 못하는 것

**1. 복잡한 비즈니스 로직 설계**
```
예: "31일이 없는 달은 건너뛴다"
→ AI가 제안한 첫 번째 로직: 오류 많음
→ 명확한 명세와 테스트 케이스 필요
```

**2. 엣지 케이스 예측**
- AI는 내가 명시한 케이스만 처리
- 윤년? → 말해줘야 함
- 31일? → 말해줘야 함
- null 체크? → 말해줘야 함

**3. 전체 아키텍처 설계**
- AI는 "부분"은 잘 짜지만 "전체 그림"은 못 그림
- 인간이 Epic, Stories로 구조를 잡아줘야 함

**4. 컨텍스트 제한**
- 파일이 1000줄 넘으면 일부만 읽음
- orchestrator.md 421줄 → TODO.md 업데이트 규칙(727번째 줄) 놓침

**5. 창의적 문제 해결**
- AI는 "학습된 패턴" 내에서만 동작
- 새로운 문제는 인간이 먼저 해결 방향 제시 필요

**6. 우선순위 판단**
- "이게 더 중요해" 같은 판단 불가
- Orchestrator에게 명시적으로 우선순위 지정 필요

#### 🎯 최적의 협업 방식

```
인간의 역할:
- 문제 정의 (What, Why)
- 아키텍처 설계
- 엣지 케이스 발견
- 우선순위 결정
- 최종 검증

AI의 역할:
- 구현 (How)
- 반복 작업
- 표준 패턴 적용
- 문서 작성
- 리팩토링
```

**비유: AI = 베테랑 주니어 개발자**

장점:
- 코딩 속도 빠름
- 실수 없음 (규칙만 잘 주면)
- 24시간 일함
- 불평 없음

단점:
- 경험 부족 (엣지 케이스 모름)
- 창의성 부족
- 맥락 파악 제한
- 우선순위 판단 불가

→ **시니어 개발자(인간)의 명확한 가이드 필요!**

---

### 🔟 마지막으로 느낀점에 대해 적어주세요!

#### 🚀 이번 과제를 통해 배운 것

**1. "AI 시대의 개발자는 '지휘자'다"**

6개 Agent를 만들면서 느낀 것:
- 각 Agent에게 명확한 역할을 주니 놀라운 결과가 나옴
- Orchestrator처럼 전체를 조율하는 능력이 중요해짐
- 코드를 "짜는" 능력보다 "설계하는" 능력이 더 중요해짐

**2. "TDD는 AI 시대에 더 중요하다"**

테스트 없이 AI가 짠 코드:
- "이게 맞나?" 불안감
- 버그 발견 시 전체 검토
- 리팩토링 두려움

TDD로 AI가 짠 코드:
- 테스트가 안전망 역할
- 자신감 있게 수정 가능
- GREEN 상태 유지만 하면 됨

**AI가 많이 짤수록, 테스트가 더 중요하다!**

**3. "명확한 규칙 > 똑똑한 AI"**

Claude Sonnet 4.5는 매우 똑똑하지만:
- 막연한 지시 → 막연한 결과
- 명확한 규칙 → 정확한 결과

이번 과제에서:
- Agent 파일 421줄 → 100줄 간소화
- Input/Output 명확히 정의
- 긍정적 표현 사용

→ 결과가 60점에서 90점으로!

**"AI를 잘 쓰는 법 = 명확하게 지시하는 법"**

**4. "문서화는 AI를 위한 것이 아니라 나를 위한 것"**

Epic, Stories, Spec, TODO.md를 작성하면서:
- 내 생각이 정리됨
- 작업 순서가 명확해짐
- 막막함이 사라짐

**AI에게 지시하려고 문서를 쓰는데,**
**정작 내가 더 많이 배웠다.**

#### 💭 아쉬운 점

**1. Context 길이 제한**
- orchestrator.md 421줄 → 727번째 줄 규칙 놓침
- 해결: 중요한 규칙은 상단 배치

**2. 완벽하지 않은 자동화**
- TODO.md 자동 업데이트 실패
- 인간이 계속 체크 필요

**3. 초기 세팅 시간**
- Agent 6개 만드는 데 시간 소요
- 하지만 한 번 만들면 재사용 가능!

#### 🎓 다음에 시도해보고 싶은 것

**1. Context7 통합**
- 최신 문서를 실시간으로 AI에게 제공

**2. Agent 간 자동 통신**
- Orchestrator가 자동으로 다른 Agent 호출
- 인간 개입 최소화

**3. 더 작은 단위로 Agent 분할**
- UI Agent, Logic Agent, Style Agent 등

**4. 프로젝트 템플릿화**
- 이번에 만든 Agent 시스템을 템플릿으로
- 다른 프로젝트에 바로 적용

#### 🌟 동기들에게

이번 과제를 하면서:
- AI를 "도구"가 아닌 "팀원"으로 봤더니 다르게 보였습니다
- TDD를 단순히 "과제 요구사항"이 아닌 "AI의 가드레일"로 봤더니 의미가 달라졌습니다
- 문서를 "귀찮은 작업"이 아닌 "생각 정리 도구"로 봤더니 즐거워졌습니다

**여러분도 한번 시도해보세요!**

처음엔 복잡해 보이지만, Agent 하나씩 만들다 보면:
- 내 생각이 정리되고
- AI가 내 의도를 더 잘 이해하고
- 결과물의 품질이 올라갑니다

**AI 시대의 개발자는:**
- 코드를 짜는 사람이 아니라
- 시스템을 설계하는 사람입니다

**여러분도 할 수 있습니다! 💪**

---

## 📚 관련 문서

### 프로젝트 문서
- `TODO.md` - 작업 진행 상황
- `docs/epics/recurring-events.md` - Epic 문서
- `docs/stories/` - User Stories (5개)
- `docs/specs/` - 기술 명세 (17개)

### Agent 문서
- `.cursor/agents/orchestrator.md` - TDD 오케스트레이터
- `.cursor/agents/spec-designer.md` - 명세 작성 Agent
- `.cursor/agents/test-designer.md` - 테스트 설계 Agent
- `.cursor/agents/test-coder.md` - 테스트 작성 Agent
- `.cursor/agents/developer.md` - 기능 구현 Agent
- `.cursor/agents/refactorer.md` - 리팩토링 Agent

### 가이드라인
- `docs/guidelines/react-testing-library.md` - 테스트 작성 가이드
- `docs/templates/spec-template.md` - 명세 템플릿
- `docs/templates/test-design-template.md` - 테스트 설계 템플릿

---

## ✅ 체크리스트

### 필수 스펙 구현
- [x] 반복 유형 선택 (매일, 매주, 매월, 매년)
- [x] 31일 매월 반복 처리
- [x] 윤년 29일 매년 반복 처리
- [x] 반복 일정 아이콘 표시
- [x] 반복 종료 날짜 설정
- [x] 2025-12-31 최대 날짜 제한
- [x] 반복 일정 단일 수정
- [x] 반복 일정 전체 수정
- [x] 반복 일정 단일 삭제
- [x] 반복 일정 전체 삭제

### 기본 과제 (공통)
- [x] 테스트 작성 규칙 명세 작성
- [x] 모든 기능에 대한 테스트 작성
- [x] 모든 테스트 통과 (199/199)
- [x] 모든 기능 올바르게 구현

### 기본 과제 (Hard)
- [x] Agent 구현 명세 문서 작성 (orchestrator.md)
- [x] 커밋별 올바른 단계 작업 (RED-GREEN-REFACTOR)
- [x] 결과를 얻기 위한 history/log (git log)
- [x] AI 도구 활용 개선 점 (PR에 작성 예정)

### 과제 셀프회고
- [ ] 기술적 성장 (질문 1, 2, 4 답변 필요)
- [ ] 코드 품질 (질문 3 답변 필요)
- [ ] 학습 효과 분석 (질문 4 답변 필요)

### 과제 피드백
- [ ] 리뷰 받고 싶은 내용 (질문 6 답변 필요)

---

## 🎉 결론

이번 프로젝트를 통해 **TDD 방식의 체계적인 개발**과 **AI Agent 기반 자동화**를 경험했습니다.

### 핵심 성과
1. ✅ **100% 테스트 커버리지** - 199개 테스트 모두 통과
2. ✅ **체계적인 작업 분할** - 17개 작업, 2-3시간 단위
3. ✅ **명확한 TDD 사이클** - RED → GREEN → REFACTOR
4. ✅ **문서 우선 개발** - Epic → Stories → Specs → Tests → Implementation
5. ✅ **효율적인 Agent 활용** - Orchestrator 기반 역할 분리

### 배운 점
- TDD는 요구사항을 명확히 하는 데 효과적
- 테스트는 리팩토링의 안전망
- 작업 분할은 진행 상황 추적과 품질 관리에 필수
- AI Agent는 체계적인 문서화와 명확한 역할 분리가 중요

---

**작성일**: 2025-10-31
**작성자**: @dohyeonkim
**프로젝트**: 반복 일정 관리 기능 구현
