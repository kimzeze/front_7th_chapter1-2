# 작업 005: 반복 설정 UI 활성화

## 1. 개요

### 목적

주석 처리된 반복 설정 UI를 활성화하여 사용자가 반복 일정을 설정할 수 있도록 한다.

### 사용자 시나리오

1. 사용자가 "반복 일정" 체크박스를 선택
2. 반복 설정 UI가 표시됨
3. 사용자가 반복 유형(매일/매주/매월/매년) 선택
4. 사용자가 반복 간격 입력 (기본값: 1)
5. 사용자가 반복 종료일 선택 (선택사항)
6. 일정 저장 시 반복 정보가 포함됨

### 배경

App.tsx 라인 441-478에 반복 설정 UI가 주석 처리되어 있으며, useEventForm 훅에는 이미 필요한 state와 setter 함수들이 모두 정의되어 있습니다.

---

## 2. 요구사항

### 2.1 기능 요구사항

- [ ] App.tsx 라인 441-478 주석 해제
- [ ] setRepeatType, setRepeatInterval, setRepeatEndDate 주석 해제
- [ ] isRepeating이 true일 때만 반복 설정 UI 표시
- [ ] 반복 유형 선택: daily, weekly, monthly, yearly
- [ ] 반복 간격: 최소값 1 (현재는 1만 사용)
- [ ] 반복 종료일: 날짜 선택 (선택사항)

### 2.2 비기능 요구사항

- **UI/UX**: Material-UI 디자인 시스템 일관성 유지
- **접근성**: FormLabel로 명확한 레이블 제공
- **기존 기능 유지**: 다른 폼 필드에 영향 없음

---

## 3. 영향 범위

### 3.1 수정이 필요한 파일

- `src/App.tsx`
  - 라인 441-478: 주석 해제
  - 라인 84-86: setRepeatType, setRepeatInterval, setRepeatEndDate 주석 해제

### 3.2 수정이 불필요한 파일

- `src/hooks/useEventForm.ts`: 이미 모든 state와 setter 함수 정의됨
- `src/types.ts`: RepeatType, RepeatInfo 타입 이미 정의됨

---

## 4. 구현 방법

### 4.1 App.tsx 수정사항

#### 1단계: setter 함수 주석 해제 (라인 84-86)

**현재**:
```typescript
isRepeating,
// setRepeatType,
// setRepeatInterval,
// setRepeatEndDate,
```

**수정 후**:
```typescript
isRepeating,
setRepeatType,
setRepeatInterval,
setRepeatEndDate,
```

#### 2단계: UI 주석 해제 (라인 441-478)

**현재**:
```typescript
{/* {isRepeating && (
  <Stack spacing={2}>
    <FormControl fullWidth>
      <FormLabel>반복 유형</FormLabel>
      <Select
        size="small"
        value={repeatType}
        onChange={(e) => setRepeatType(e.target.value as RepeatType)}
      >
        <MenuItem value="daily">매일</MenuItem>
        <MenuItem value="weekly">매주</MenuItem>
        <MenuItem value="monthly">매월</MenuItem>
        <MenuItem value="yearly">매년</MenuItem>
      </Select>
    </FormControl>
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel>반복 간격</FormLabel>
        <TextField
          size="small"
          type="number"
          value={repeatInterval}
          onChange={(e) => setRepeatInterval(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 1 } }}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>반복 종료일</FormLabel>
        <TextField
          size="small"
          type="date"
          value={repeatEndDate}
          onChange={(e) => setRepeatEndDate(e.target.value)}
        />
      </FormControl>
    </Stack>
  </Stack>
)}
*/}
```

**수정 후**: 주석 제거 (/* */ 삭제)

---

## 5. UI 구조

### 5.1 레이아웃

```
[반복 일정] ☑️

┌─────────────────────────────────┐
│ 반복 유형                        │
│ [매일 ▼]                        │
└─────────────────────────────────┘

┌──────────────┬──────────────────┐
│ 반복 간격     │ 반복 종료일       │
│ [1]          │ [2025-12-31]     │
└──────────────┴──────────────────┘
```

### 5.2 필드 설명

#### 반복 유형 (Select)
- **옵션**: 매일, 매주, 매월, 매년
- **기본값**: 'daily' (체크박스 선택 시)
- **크기**: small
- **전체 너비**: fullWidth

#### 반복 간격 (TextField)
- **타입**: number
- **최소값**: 1
- **기본값**: 1
- **크기**: small
- **설명**: "매 N일/주/월/년마다" 반복

#### 반복 종료일 (TextField)
- **타입**: date
- **기본값**: 빈 문자열 (선택사항)
- **크기**: small
- **설명**: 미입력 시 2025-12-31까지 생성

---

## 6. 테스트 시나리오

### 6.1 UI 표시 테스트

- [ ] 반복 일정 체크박스가 체크되지 않으면 반복 설정 UI가 보이지 않음
- [ ] 반복 일정 체크박스를 체크하면 반복 설정 UI가 표시됨
- [ ] 반복 유형 선택 시 값이 변경됨
- [ ] 반복 간격 입력 시 값이 변경됨
- [ ] 반복 종료일 선택 시 값이 변경됨

### 6.2 통합 테스트

- [ ] 반복 일정 저장 시 repeat 객체에 올바른 값이 포함됨
- [ ] isRepeating이 false일 때 repeat.type은 'none'
- [ ] isRepeating이 true일 때 repeat.type은 선택한 값

---

## 7. 구현 계획

### Phase 1: 명세 작성

1. ✅ 이 문서 작성

### Phase 2: 테스트 설계

2. React Testing Library를 사용한 UI 테스트 설계
   - 반복 설정 UI 표시/숨김
   - 각 필드 입력 및 변경
   - 폼 제출 시 데이터 검증

### Phase 3: RED - 테스트 작성

3. 실패하는 테스트 작성 (UI가 아직 활성화되지 않음)
4. RED 커밋

### Phase 4: GREEN - 기능 구현

5. App.tsx 수정 (주석 해제)
6. 테스트 통과 확인
7. GREEN 커밋

### Phase 5: REFACTOR

8. 코드 정리 및 검토
9. REFACTOR 커밋

---

## 8. 예상 동작

### 예시 1: 매일 반복

**사용자 입력**:
- 반복 일정: ☑️
- 반복 유형: 매일
- 반복 간격: 1
- 반복 종료일: 2025-12-31

**결과**:
```typescript
{
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-12-31'
  }
}
```

### 예시 2: 매주 반복 (종료일 없음)

**사용자 입력**:
- 반복 일정: ☑️
- 반복 유형: 매주
- 반복 간격: 1
- 반복 종료일: (빈 칸)

**결과**:
```typescript
{
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: undefined
  }
}
```

### 예시 3: 반복 없음

**사용자 입력**:
- 반복 일정: ☐ (체크 해제)

**결과**:
```typescript
{
  repeat: {
    type: 'none',
    interval: 1
  }
}
```

---

## 9. 주의사항

### 9.1 기존 코드 활용

- useEventForm 훅에 이미 모든 state가 정의되어 있음
- App.tsx의 saveEvent 로직에서 이미 repeat 객체를 생성하고 있음:
  ```typescript
  repeat: {
    type: isRepeating ? repeatType : 'none',
    interval: repeatInterval,
    endDate: repeatEndDate || undefined,
  }
  ```

### 9.2 TypeScript 타입

- `RepeatType`: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
- Select의 onChange에서 `as RepeatType` 타입 단언 필요

### 9.3 Material-UI 업데이트

- `inputProps` → `slotProps={{ htmlInput: { min: 1 } }}` (최신 MUI 문법)

---

## 10. 다음 작업과의 관계

- **작업 005**: 현재 (UI 활성화)
- **작업 006**: validation 추가 (종료일 검증)
- **작업 007**: max 속성 및 에러 메시지
- **작업 008**: saveEvent에 반복 생성 로직 통합

작업 005는 **UI만 활성화**하며, validation과 실제 반복 생성은 다음 작업에서 구현합니다.

---

## 11. 검증 기준

### 11.1 기능 검증

- [ ] 반복 일정 체크박스 토글 시 UI 표시/숨김
- [ ] 반복 유형 선택 가능
- [ ] 반복 간격 입력 가능 (최소값 1)
- [ ] 반복 종료일 선택 가능
- [ ] 폼 초기화 시 반복 설정도 초기화

### 11.2 UI 검증

- [ ] Material-UI 디자인 일관성 유지
- [ ] 반응형 레이아웃 (Stack 사용)
- [ ] small 크기로 통일

### 11.3 테스트 검증

- [ ] React Testing Library 테스트 통과
- [ ] 사용자 행동 시뮬레이션 (체크박스 클릭, 선택, 입력)
- [ ] 접근성 검증 (getByLabelText 사용)
