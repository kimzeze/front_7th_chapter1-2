# 작업 006: 반복 종료일 Validation 추가

## 1. 개요

### 목적

반복 종료일 입력 시 유효성 검증을 추가하여 잘못된 날짜 입력을 방지한다.

### 사용자 시나리오

1. 사용자가 반복 일정을 설정하고 종료일을 입력
2. 종료일이 시작일보다 이전인 경우 → **에러 메시지 표시**
3. 종료일이 2025-12-31보다 이후인 경우 → **에러 메시지 표시**
4. 유효한 종료일인 경우 → 정상 진행

### 배경

작업 005에서 UI를 활성화했지만, 입력 검증이 없어 사용자가 잘못된 날짜를 입력할 수 있습니다.

---

## 2. 요구사항

### 2.1 기능 요구사항

- [ ] 반복 종료일이 시작일보다 이전이면 에러 메시지 표시
- [ ] 반복 종료일이 2025-12-31보다 이후면 에러 메시지 표시
- [ ] 에러가 있으면 일정 저장 버튼 비활성화 (선택사항)
- [ ] 에러 메시지는 TextField 아래에 표시
- [ ] 입력값이 변경되면 실시간으로 검증

### 2.2 비기능 요구사항

- **UX**: 사용자 친화적인 에러 메시지
- **성능**: 입력 시마다 검증하지만 성능 저하 없음
- **기존 기능 유지**: 시작 시간/종료 시간 validation과 일관성 유지

---

## 3. 영향 범위

### 3.1 수정이 필요한 파일

- `src/hooks/useEventForm.ts`
  - repeatEndDate 검증 로직 추가
  - repeatEndDateError state 추가
  - handleRepeatEndDateChange 함수 추가

- `src/App.tsx`
  - TextField에 error, helperText props 추가
  - handleRepeatEndDateChange 연결

### 3.2 참고할 기존 코드

`src/hooks/useEventForm.ts`에 이미 시간 validation이 구현되어 있음:
```typescript
const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
  startTimeError: null,
  endTimeError: null,
});

const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
  const newStartTime = e.target.value;
  setStartTime(newStartTime);
  setTimeError(getTimeErrorMessage(newStartTime, endTime));
};
```

---

## 4. 구현 방법

### 4.1 useEventForm.ts 수정

#### 1. state 추가

```typescript
const [repeatEndDateError, setRepeatEndDateError] = useState<string | null>(null);
```

#### 2. validation 함수 추가

```typescript
const validateRepeatEndDate = (endDate: string, startDate: string): string | null => {
  if (!endDate) {
    return null; // 종료일은 선택사항이므로 빈 값은 허용
  }

  const end = new Date(endDate);
  const start = new Date(startDate);
  const maxDate = new Date('2025-12-31');

  // 1. 시작일보다 이전 체크
  if (end < start) {
    return '종료일은 시작일 이후여야 합니다.';
  }

  // 2. MAX_DATE 초과 체크
  if (end > maxDate) {
    return '종료일은 2025-12-31 이하여야 합니다.';
  }

  return null;
};
```

#### 3. handler 함수 추가

```typescript
const handleRepeatEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
  const newEndDate = e.target.value;
  setRepeatEndDate(newEndDate);

  const error = validateRepeatEndDate(newEndDate, date);
  setRepeatEndDateError(error);
};
```

#### 4. return에 추가

```typescript
return {
  // ... 기존 항목들
  repeatEndDateError,
  handleRepeatEndDateChange,
};
```

### 4.2 App.tsx 수정

#### 1. useEventForm에서 가져오기

```typescript
const {
  // ... 기존 항목들
  repeatEndDateError,
  handleRepeatEndDateChange,
} = useEventForm();
```

#### 2. TextField 수정

```typescript
<TextField
  size="small"
  type="date"
  value={repeatEndDate}
  onChange={handleRepeatEndDateChange}
  error={Boolean(repeatEndDateError)}
  helperText={repeatEndDateError}
/>
```

---

## 5. 검증 규칙

### 5.1 종료일 < 시작일

**입력**:
- 시작일: 2025-01-15
- 종료일: 2025-01-10

**결과**: "종료일은 시작일 이후여야 합니다."

### 5.2 종료일 > 2025-12-31

**입력**:
- 시작일: 2025-01-01
- 종료일: 2026-01-01

**결과**: "종료일은 2025-12-31 이하여야 합니다."

### 5.3 종료일 = 시작일 (유효)

**입력**:
- 시작일: 2025-01-15
- 종료일: 2025-01-15

**결과**: 에러 없음 (1개만 생성되지만 유효한 입력)

### 5.4 종료일 빈 값 (유효)

**입력**:
- 시작일: 2025-01-01
- 종료일: (빈 칸)

**결과**: 에러 없음 (MAX_DATE까지 생성)

### 5.5 유효한 범위

**입력**:
- 시작일: 2025-01-01
- 종료일: 2025-12-31

**결과**: 에러 없음

---

## 6. 테스트 시나리오

### 6.1 단위 테스트 (useEventForm.spec.ts)

- [ ] 종료일이 시작일보다 이전: 에러 메시지 반환
- [ ] 종료일이 2025-12-31 초과: 에러 메시지 반환
- [ ] 종료일이 빈 값: 에러 없음
- [ ] 종료일이 유효: 에러 없음
- [ ] 시작일 변경 시 종료일 재검증

### 6.2 통합 테스트 (medium.integration.spec.tsx)

- [ ] 잘못된 종료일 입력 시 에러 메시지 표시
- [ ] 유효한 종료일 입력 시 에러 메시지 사라짐
- [ ] 에러 상태에서 TextField에 error 속성 적용

---

## 7. UI 예시

### 정상 상태

```
┌─────────────────────────────┐
│ 반복 종료일                  │
│ [2025-12-31             ]  │
└─────────────────────────────┘
```

### 에러 상태 (시작일보다 이전)

```
┌─────────────────────────────┐
│ 반복 종료일                  │
│ [2025-01-01             ]  │ (빨간색 테두리)
│ ⚠️ 종료일은 시작일 이후여야 합니다.
└─────────────────────────────┘
```

### 에러 상태 (MAX_DATE 초과)

```
┌─────────────────────────────┐
│ 반복 종료일                  │
│ [2026-01-01             ]  │ (빨간색 테두리)
│ ⚠️ 종료일은 2025-12-31 이하여야 합니다.
└─────────────────────────────┘
```

---

## 8. 엣지 케이스

### 8.1 시작일 변경 시 재검증

**시나리오**:
1. 시작일: 2025-01-01, 종료일: 2025-01-15 (유효)
2. 시작일을 2025-01-20으로 변경
3. 종료일 (2025-01-15)이 시작일보다 이전이 됨

**기대 동작**: 시작일 변경 시 종료일 재검증 필요

**구현**: date 변경 시 repeatEndDate 재검증

### 8.2 반복 일정 체크 해제

**시나리오**:
1. 반복 일정 체크, 종료일에 에러 있음
2. 반복 일정 체크 해제

**기대 동작**: 에러 메시지 사라짐 (반복 설정 UI 자체가 숨겨짐)

---

## 9. 구현 계획

### Phase 1: 명세 작성

1. ✅ 이 문서 작성

### Phase 2: 테스트 설계

2. validation 함수 테스트 설계
3. 통합 테스트 설계

### Phase 3: RED - 테스트 작성

4. 실패하는 테스트 작성
5. RED 커밋

### Phase 4: GREEN - 기능 구현

6. validateRepeatEndDate 함수 구현
7. handleRepeatEndDateChange 함수 구현
8. App.tsx에 연결
9. 테스트 통과 확인
10. GREEN 커밋

### Phase 5: REFACTOR

11. 코드 정리
12. REFACTOR 커밋

---

## 10. 참고사항

### 10.1 기존 시간 validation과의 일관성

기존 코드:
```typescript
// src/utils/timeValidation.ts
export const getTimeErrorMessage = (startTime: string, endTime: string) => {
  // 검증 로직
  return { startTimeError, endTimeError };
};
```

새 코드:
```typescript
// src/hooks/useEventForm.ts 내부
const validateRepeatEndDate = (endDate: string, startDate: string) => {
  // 검증 로직
  return errorMessage;
};
```

### 10.2 날짜 비교

```javascript
const date1 = new Date('2025-01-15');
const date2 = new Date('2025-01-10');

date1 > date2; // true
date1 < date2; // false
date1.getTime() > date2.getTime(); // true (명시적)
```

### 10.3 Material-UI TextField error 속성

```typescript
<TextField
  error={Boolean(errorMessage)}  // boolean으로 변환
  helperText={errorMessage}       // string | null
/>
```

---

## 11. 다음 작업과의 관계

- **작업 005**: 완료 (UI 활성화)
- **작업 006**: 현재 (validation 추가)
- **작업 007**: 다음 (max 속성 및 추가 에러 메시지)
- **작업 008**: saveEvent에 반복 생성 로직 통합

작업 006은 **입력 검증**에 집중하며, 작업 007에서 HTML5 validation 속성을 추가합니다.
