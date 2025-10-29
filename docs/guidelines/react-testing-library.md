# React Testing Library 가이드

## 핵심 철학

> **"사용자가 소프트웨어를 사용하는 방식으로 테스트하라"**

- 구현 세부사항이 아닌 **사용자 행동** 테스트
- 접근성을 고려한 쿼리 사용
- 실제 사용자 상호작용 시뮬레이션

---

## 쿼리 우선순위

### 1순위: getByRole (가장 권장) ⭐

접근성 기반 쿼리. 스크린 리더가 읽는 방식과 동일.

```typescript
// 버튼
screen.getByRole('button', { name: '일정 추가' });

// 입력 필드
screen.getByRole('textbox', { name: '제목' });

// 체크박스
screen.getByRole('checkbox', { name: '반복 일정' });

// 선택 박스
screen.getByRole('combobox', { name: '카테고리' });
```

### 2순위: getByLabelText

폼 요소에 적합. label과 연결된 input 찾기.

```typescript
screen.getByLabelText('제목');
screen.getByLabelText('날짜');
```

### 3순위: getByPlaceholderText

Label이 없을 때.

```typescript
screen.getByPlaceholderText('검색어를 입력하세요');
```

### 4순위: getByText

화면에 표시되는 텍스트.

```typescript
screen.getByText('일정 관리');
screen.getByText(/저장 완료/i); // 정규식 가능
```

### 5순위: getByTestId (최후의 수단)

다른 방법이 없을 때만.

```typescript
screen.getByTestId('event-list');
```

---

## 쿼리 타입

### getBy\* - 요소가 반드시 존재

없으면 에러 발생. 존재를 확신할 때 사용.

```typescript
const button = screen.getByRole('button', { name: '추가' });
expect(button).toBeInTheDocument();
```

### queryBy\* - 요소가 없을 수도 있음

없으면 null 반환. 부재 확인할 때 사용.

```typescript
const error = screen.queryByText('에러');
expect(error).not.toBeInTheDocument(); // 없음을 확인
```

### findBy\* - 비동기 대기

요소가 나타날 때까지 기다림. (기본 1초)

```typescript
const message = await screen.findByText('저장 완료');
expect(message).toBeInTheDocument();
```

### 복수형: getAllBy*, queryAllBy*, findAllBy\*

여러 요소를 찾을 때.

```typescript
const events = screen.getAllByRole('article');
expect(events).toHaveLength(3);
```

---

## 사용자 이벤트

### userEvent 사용 (권장) ⭐

실제 사용자 행동을 시뮬레이션.

```typescript
import { userEvent } from '@testing-library/user-event';

it('사용자가 폼을 작성한다', async () => {
  const user = userEvent.setup();
  render(<EventForm />);

  // 입력
  await user.type(screen.getByLabelText('제목'), '회의');

  // 클릭
  await user.click(screen.getByRole('button', { name: '저장' }));

  // 선택
  await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

  // 체크
  await user.click(screen.getByRole('checkbox', { name: '반복' }));
});
```

### fireEvent (특수한 경우만)

userEvent로 불가능한 경우에만.

```typescript
import { fireEvent } from '@testing-library/react';

fireEvent.focus(element);
fireEvent.blur(element);
```

---

## 비동기 처리

### waitFor - 조건 대기

조건이 만족될 때까지 기다림.

```typescript
await waitFor(() => {
  expect(screen.getByText('완료')).toBeInTheDocument();
});
```

### waitForElementToBeRemoved - 제거 대기

요소가 사라질 때까지 기다림.

```typescript
const loading = screen.getByText('로딩 중');
await waitForElementToBeRemoved(loading);
```

---

## 자주 사용하는 Matcher

### 존재 확인

```typescript
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();
```

### 텍스트 확인

```typescript
expect(element).toHaveTextContent('회의');
expect(element).toContainHTML('<strong>');
```

### 속성 확인

```typescript
expect(button).toBeDisabled();
expect(button).toBeEnabled();
expect(input).toHaveValue('제목');
expect(checkbox).toBeChecked();
```

### 클래스/스타일

```typescript
expect(element).toHaveClass('active');
expect(element).toHaveStyle({ color: 'red' });
```

---

## 안티패턴

### ❌ 구현 세부사항 테스트

```typescript
// 나쁜 예: 내부 상태 테스트
expect(component.state.count).toBe(1);

// 좋은 예: 사용자가 보는 것 테스트
expect(screen.getByText('1')).toBeInTheDocument();
```

### ❌ className으로 선택

```typescript
// 나쁜 예
const element = container.querySelector('.event-item');

// 좋은 예
const element = screen.getByRole('article');
```

### ❌ 과도한 testId

```typescript
// 나쁜 예: testId 남용
<button data-testid="submit-btn">저장</button>

// 좋은 예: Role 사용
<button>저장</button>
screen.getByRole('button', { name: '저장' });
```

---

## 실전 팁

### 디버깅

```typescript
// 현재 화면 출력
screen.debug();

// 특정 요소 출력
screen.debug(screen.getByRole('button'));

// 역할 목록 보기
screen.logTestingPlaygroundURL();
```

### 복잡한 쿼리

```typescript
// within으로 범위 좁히기
const form = screen.getByRole('form');
const submitButton = within(form).getByRole('button', { name: '제출' });
```

### 커스텀 렌더

```typescript
function renderWithProviders(ui: ReactElement) {
  return render(
    <Provider store={store}>
      <Router>{ui}</Router>
    </Provider>
  );
}
```

---

## 배열/리스트 검증 베스트 프랙티스

### 원칙: 패턴 검증 > 개별 값 검증

**❌ 안티패턴: 인덱스별 일일이 체크**

```typescript
// 나쁜 예: 깨지기 쉽고 의도 불명확
const result = generateMonthlyEvents(baseEvent);
expect(result[0].date).toBe('2025-01-30');
expect(result[1].date).toBe('2025-03-30');
expect(result[2].date).toBe('2025-04-30');
// ... 9줄 더

// 문제점:
// - 반복적
// - 개수 변경 시 모두 수정 필요
// - 검증 의도 불명확 (모든 날짜가 30일? 2월 제외?)
```

**✅ 베스트 프랙티스: 패턴으로 검증**

```typescript
// 좋은 예: 의도 명확, 변경에 강함
const result = generateMonthlyEvents(baseEvent);

// 1. 개수
expect(result).toHaveLength(11); // 2월 제외

// 2. 패턴 - 모든 날짜가 30일
result.forEach(event => {
  const day = event.date.split('-')[2];
  expect(day).toBe('30');
});

// 3. 제외 - 2월 없음
const months = result.map(e => e.date.split('-')[1]);
expect(months).not.toContain('02');
```

---

### 시나리오별 검증 패턴

#### 1. 날짜 배열 검증

```typescript
// 특정 일(day)이 모두 같은지
dates.forEach(date => {
  const day = date.split('-')[2];
  expect(day).toBe('15');
});

// 특정 월이 없는지
const months = dates.map(d => d.split('-')[1]);
expect(months).not.toContain('02');
expect(months).not.toContain('04');

// 연속된 월인지
const expectedMonths = ['01', '03', '05', '07'];
expect(months).toEqual(expectedMonths);

// 날짜 순서 확인
for (let i = 1; i < dates.length; i++) {
  const prev = new Date(dates[i - 1]);
  const curr = new Date(dates[i]);
  expect(curr.getTime()).toBeGreaterThan(prev.getTime());
}
```

#### 2. ID 중복 검증

```typescript
// 모든 ID가 고유한지
const ids = items.map(item => item.id);
const uniqueIds = new Set(ids);
expect(uniqueIds.size).toBe(ids.length);

// 특정 ID 포함/제외
expect(ids).toContain('expected-id');
expect(ids).not.toContain('deleted-id');
```

#### 3. 공통 속성 검증

```typescript
// 모든 아이템이 조건 만족
items.forEach(item => {
  expect(item.category).toBe('work');
  expect(item.status).toBe('active');
  expect(item.createdBy).toBeDefined();
});

// 특정 값 범위 확인
prices.forEach(price => {
  expect(price).toBeGreaterThanOrEqual(0);
  expect(price).toBeLessThanOrEqual(1000);
});
```

#### 4. 요일 패턴 검증

```typescript
// 매주 월요일 확인
result.forEach(event => {
  const date = new Date(event.date);
  expect(date.getDay()).toBe(1); // 0=일, 1=월
});

// 주말 제외 확인
result.forEach(event => {
  const day = new Date(event.date).getDay();
  expect(day).not.toBe(0); // 일요일
  expect(day).not.toBe(6); // 토요일
});
```

#### 5. 경계값 확인

```typescript
// 첫 번째와 마지막만 검증
expect(result[0]).toMatchObject({
  date: '2024-01-01',
  title: '첫 이벤트',
});

expect(result[result.length - 1]).toMatchObject({
  date: '2024-12-31',
  title: '마지막 이벤트',
});

// 중간값 샘플링 (필요시)
const middleIndex = Math.floor(result.length / 2);
expect(result[middleIndex].date).toMatch(/2024-06/);
```

---

### 검증 전략 선택 가이드

| 검증 목적 | 방법 | 예시 |
|---------|------|------|
| 개수 확인 | `toHaveLength()` | `expect(result).toHaveLength(12)` |
| 공통 패턴 | `forEach()` | `result.forEach(r => expect(r.day).toBe('30'))` |
| 포함/제외 | `map()` + `toContain()` | `expect(months).not.toContain('02')` |
| 경계값 | `[0]`, `[length-1]` | `expect(result[0].date).toBe('2024-01-01')` |
| 순서 | `for` 루프 비교 | `expect(curr > prev).toBe(true)` |
| 중복 | `Set` 비교 | `expect(new Set(ids).size).toBe(ids.length)` |

---

## 체크리스트

테스트 작성 시 확인:

- [ ] getByRole을 우선 사용했는가?
- [ ] userEvent를 사용했는가?
- [ ] 비동기 처리를 올바르게 했는가?
- [ ] 사용자 관점에서 작성했는가?
- [ ] 구현 세부사항을 테스트하지 않았는가?
- [ ] 배열 검증 시 패턴을 사용했는가? (인덱스별 체크 지양)
