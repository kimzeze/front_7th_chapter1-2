# 테스트 설계: 주간/월간 뷰에 반복 아이콘 추가 (작업 010)

## 📋 개요

**테스트 대상**: `renderWeekView()`, `renderMonthView()` 함수의 반복 아이콘 렌더링
**테스트 파일**: `src/__tests__/medium.integration.spec.tsx` (기존 파일에 추가)
**테스트 프레임워크**: Vitest + React Testing Library

---

## 🎯 테스트 목표

1. **반복 아이콘 표시**: `repeat.type !== 'none'`인 경우 Repeat 아이콘 렌더링
2. **아이콘 미표시**: `repeat.type === 'none'`인 경우 아이콘 없음
3. **주간 뷰**: 주간 뷰에서 반복 아이콘 표시
4. **월간 뷰**: 월간 뷰에서 반복 아이콘 표시
5. **혼합 케이스**: 알림 + 반복 아이콘 함께 표시

---

## 📝 테스트 케이스 설계

### 테스트 그룹 1: 반복 없는 이벤트

#### TC-001: 단일 이벤트 - 반복 아이콘 없음

```
설명: repeat.type === 'none'인 이벤트는 반복 아이콘 표시 안 함
입력:
  - 이벤트: { title: "회의", repeat: { type: 'none' } }
  - 뷰: week 또는 month
예상 결과:
  - Repeat 아이콘 렌더링 안 됨
  - 이벤트 제목은 표시됨
검증:
  - queryByTestId('repeat-icon') === null
  - getByText('회의') 있음
```

---

### 테스트 그룹 2: 주간 뷰에서 반복 아이콘

#### TC-002: 주간 뷰 - 매주 반복 아이콘 표시

```
설명: 주간 뷰에서 매주 반복 이벤트에 반복 아이콘 표시
입력:
  - 이벤트: { title: "스탠드업", repeat: { type: 'weekly' } }
  - 뷰: week
예상 결과:
  - Repeat 아이콘 렌더링됨
  - 주간 뷰 셀에 표시
검증:
  - getByTestId('repeat-icon') 존재
  - week-view 내에 있음
  - 이벤트 제목 앞에 위치
```

#### TC-003: 주간 뷰 - 매월 반복 아이콘 표시

```
설명: 주간 뷰에서 매월 반복 이벤트에 반복 아이콘 표시
입력:
  - 이벤트: { title: "미팅", repeat: { type: 'monthly' } }
  - 뷰: week
예상 결과:
  - Repeat 아이콘 렌더링됨
검증:
  - getByTestId('repeat-icon') 존재
  - week-view 내에 있음
```

#### TC-004: 주간 뷰 - 매일 반복 아이콘 표시

```
설명: 주간 뷰에서 매일 반복 이벤트에 반복 아이콘 표시
입력:
  - 이벤트: { title: "운동", repeat: { type: 'daily' } }
  - 뷰: week
예상 결과:
  - Repeat 아이콘 렌더링됨
검증:
  - getByTestId('repeat-icon') 존재
```

#### TC-005: 주간 뷰 - 매년 반복 아이콘 표시

```
설명: 주간 뷰에서 매년 반복 이벤트에 반복 아이콘 표시
입력:
  - 이벤트: { title: "기념일", repeat: { type: 'yearly' } }
  - 뷰: week
예상 결과:
  - Repeat 아이콘 렌더링됨
검증:
  - getByTestId('repeat-icon') 존재
```

---

### 테스트 그룹 3: 월간 뷰에서 반복 아이콘

#### TC-006: 월간 뷰 - 매주 반복 아이콘 표시

```
설명: 월간 뷰에서 매주 반복 이벤트에 반복 아이콘 표시
입력:
  - 이벤트: { title: "회의", repeat: { type: 'weekly' } }
  - 뷰: month
예상 결과:
  - Repeat 아이콘 렌더링됨
  - 월간 뷰 셀에 표시
검증:
  - getByTestId('repeat-icon') 존재
  - month-view 내에 있음
```

#### TC-007: 월간 뷰 - 매월 반복 아이콘 표시

```
설명: 월간 뷰에서 매월 반복 이벤트에 반복 아이콘 표시
입력:
  - 이벤트: { title: "리뷰", repeat: { type: 'monthly' } }
  - 뷰: month
예상 결과:
  - Repeat 아이콘 렌더링됨
검증:
  - getByTestId('repeat-icon') 존재
```

#### TC-008: 월간 뷰 - 여러 이벤트 중 반복 아이콘 분별

```
설명: 월간 뷰에서 여러 이벤트 중 반복 이벤트에만 아이콘 표시
입력:
  - 이벤트 1: { title: "단일 이벤트", repeat: { type: 'none' } }
  - 이벤트 2: { title: "반복 이벤트", repeat: { type: 'daily' } }
  - 뷰: month
예상 결과:
  - 이벤트 2에만 Repeat 아이콘
  - 이벤트 1에는 아이콘 없음
검증:
  - within(eventBox2).getByTestId('repeat-icon') 존재
  - within(eventBox1).queryByTestId('repeat-icon') === null
```

---

### 테스트 그룹 4: 혼합 케이스

#### TC-009: 알림 + 반복 아이콘 함께 표시

```
설명: 알림과 반복 둘 다 있는 경우 순서대로 표시
입력:
  - 이벤트: {
      title: "중요 회의",
      repeat: { type: 'weekly' },
      isNotified: true
    }
  - 뷰: week 또는 month
예상 결과:
  - 알림 아이콘 (🔔) 먼저
  - 반복 아이콘 (🔁) 나중
  - 제목
검증:
  - getByTestId('notification-icon') 존재
  - getByTestId('repeat-icon') 존재
  - 순서: notification-icon < repeat-icon < title (DOM 순서)
```

#### TC-010: 반복만 있고 알림은 없는 경우

```
설명: 반복은 있지만 알림은 없는 경우 반복 아이콘만 표시
입력:
  - 이벤트: {
      title: "회의",
      repeat: { type: 'weekly' },
      isNotified: false
    }
  - 뷰: week 또는 month
예상 결과:
  - 반복 아이콘 표시
  - 알림 아이콘 없음
검증:
  - getByTestId('repeat-icon') 존재
  - queryByTestId('notification-icon') === null
```

---

### 테스트 그룹 5: Edge Cases

#### TC-011: 반복 타입이 모두 다른 여러 이벤트

```
설명: 여러 반복 타입 이벤트가 함께 표시될 때 모두 아이콘 표시
입력:
  - 이벤트 1: { title: "일일", repeat: { type: 'daily' } }
  - 이벤트 2: { title: "주간", repeat: { type: 'weekly' } }
  - 이벤트 3: { title: "월간", repeat: { type: 'monthly' } }
  - 이벤트 4: { title: "연간", repeat: { type: 'yearly' } }
예상 결과:
  - 4개 모두 Repeat 아이콘 표시
검증:
  - getAllByTestId('repeat-icon').length >= 4
```

#### TC-012: repeat 필드가 없는 경우 (방어 로직)

```
설명: repeat 필드가 없거나 undefined인 경우 에러 없이 처리
입력:
  - 이벤트: { title: "회의", repeat: undefined }
예상 결과:
  - 에러 발생 없음
  - 아이콘 표시 안 함
검증:
  - 렌더링 성공
  - queryByTestId('repeat-icon') === null
```

---

## 🔧 테스트 작성 전략

### TestID 설정

```typescript
// App.tsx에서 추가할 testId
{
  event.repeat?.type !== 'none' && <Repeat data-testid="repeat-icon" fontSize="small" />;
}

{
  isNotified && <Notifications data-testid="notification-icon" fontSize="small" />;
}
```

### 기본 구조 (AAA 패턴)

```typescript
it('TC-002: 주간 뷰에서 매주 반복 이벤트에 반복 아이콘 표시', async () => {
  // Arrange: 반복 이벤트 생성
  const weeklyEvent = {
    id: '1',
    title: '스탠드업',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    repeat: { type: 'weekly', interval: 1 },
    // ...
  };

  // 반복 이벤트 저장 (또는 mock 설정)

  // Act: 주간 뷰로 전환
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: /week/i }));

  // Assert: 반복 아이콘 존재 확인
  const repeatIcon = screen.getByTestId('repeat-icon');
  expect(repeatIcon).toBeInTheDocument();

  // 주간 뷰 내에 있는지 확인
  const weekView = screen.getByTestId('week-view');
  expect(within(weekView).getByTestId('repeat-icon')).toBeInTheDocument();
});
```

---

## ✅ 검증 포인트

### 아이콘 렌더링

- [ ] repeat.type !== 'none'일 때 아이콘 있음
- [ ] repeat.type === 'none'일 때 아이콘 없음
- [ ] 4가지 반복 타입 모두 아이콘 표시

### 뷰별 렌더링

- [ ] 주간 뷰에서 반복 아이콘 표시
- [ ] 월간 뷰에서 반복 아이콘 표시
- [ ] 뷰 전환 후에도 정상 작동

### 혼합 케이스

- [ ] 알림 아이콘과 함께 표시 (올바른 순서)
- [ ] 반복만 있을 때 정상 표시
- [ ] 여러 이벤트 함께 표시 (분별 확인)

### 안정성

- [ ] repeat 필드 없을 때 에러 없음
- [ ] repeat.type이 예상치 못한 값이어도 안전
- [ ] undefined/null 처리

---

## 📌 테스트 작성 순서

1. **TC-001**: 반복 아이콘 없음 (기본, 쉬움)
2. **TC-002**: 주간 뷰 + 반복 (핵심)
3. **TC-006**: 월간 뷰 + 반복 (핵심)
4. **TC-009**: 알림 + 반복 (혼합)
5. **TC-012**: 방어 로직 (안정성)
6. **나머지**: 추가 케이스

---

## 🎯 테스트 체크리스트

- [ ] 모든 테스트 케이스 작성
- [ ] testId 설정 (App.tsx에 추가)
- [ ] AAA 패턴 적용
- [ ] 명확한 테스트 설명
- [ ] 뷰 전환 로직 포함
- [ ] 여러 이벤트 함께 테스트
- [ ] 방어 로직 검증
