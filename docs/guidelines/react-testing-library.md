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

## 체크리스트

테스트 작성 시 확인:

- [ ] getByRole을 우선 사용했는가?
- [ ] userEvent를 사용했는가?
- [ ] 비동기 처리를 올바르게 했는가?
- [ ] 사용자 관점에서 작성했는가?
- [ ] 구현 세부사항을 테스트하지 않았는가?
