# 작업 004: 반복 종료일 및 2025-12-31 제한 로직

## 1. 개요

### 목적

반복 일정 생성 시 종료일(endDate)과 최대 날짜(MAX_DATE: 2025-12-31) 중 더 이른 날짜까지만 일정을 생성하도록 한다.

### 배경

**작업 001에서 이미 구현 완료**

이 기능은 작업 001의 `generateRecurringEvents()` 함수 구현 시 포함되었습니다. 별도 작업으로 분리되지 않고 기본 반복 생성 로직의 일부로 구현되었습니다.

---

## 2. 요구사항

### 2.1 기능 요구사항

- [x] endDate가 없으면 MAX_DATE(2025-12-31)까지 생성
- [x] endDate가 MAX_DATE를 초과하면 MAX_DATE까지만 생성
- [x] endDate가 MAX_DATE 이하면 endDate까지만 생성
- [x] 시작일과 종료일이 같으면 1개만 생성
- [x] 종료일이 시작일보다 이전이면 빈 배열 반환

### 2.2 비기능 요구사항

- [x] 작업 001의 17개 테스트는 여전히 통과해야 함
- [x] 성능: 날짜 비교 로직으로 인한 성능 저하 없음

---

## 3. 구현 완료

### 3.1 구현 위치

`src/utils/recurringEventUtils.ts:27-30`

```typescript
// 종료일 설정
const maxDate = new Date(MAX_DATE);
const endDate = repeat.endDate ? new Date(repeat.endDate) : maxDate;
const effectiveEndDate = endDate > maxDate ? maxDate : endDate;
```

### 3.2 로직 설명

```
1. maxDate = new Date('2025-12-31')
2. IF repeat.endDate가 존재하면
     endDate = new Date(repeat.endDate)
   ELSE
     endDate = maxDate
3. IF endDate > maxDate
     effectiveEndDate = maxDate (더 이른 날짜 선택)
   ELSE
     effectiveEndDate = endDate
4. while (currentDate <= effectiveEndDate) 루프로 생성
```

---

## 4. 테스트 완료

### 4.1 작업 001에서 이미 테스트됨

**테스트 파일**: `src/__tests__/unit/recurringEventUtils.spec.ts`

#### 1. endDate가 없으면 2025-12-31까지 생성 (라인 141-159)

**입력**:
```typescript
{
  date: '2025-12-25',
  repeat: {
    type: 'daily',
    endDate: undefined,
  },
}
```

**결과**: 7개 (2025-12-25 ~ 2025-12-31) ✅

#### 2. endDate가 2025-12-31을 초과하면 2025-12-31까지만 생성 (라인 161-178)

**입력**:
```typescript
{
  date: '2025-12-28',
  repeat: {
    type: 'daily',
    endDate: '2026-01-05', // MAX_DATE 초과
  },
}
```

**결과**: 4개 (2025-12-28 ~ 2025-12-31만 생성) ✅

#### 3. 시작일과 종료일이 같으면 1개만 생성 (라인 180-197)

**입력**:
```typescript
{
  date: '2025-01-01',
  repeat: {
    type: 'daily',
    endDate: '2025-01-01',
  },
}
```

**결과**: 1개만 생성 ✅

#### 4. 종료일이 시작일보다 이전이면 빈 배열 반환 (라인 199-215)

**입력**:
```typescript
{
  date: '2025-01-05',
  repeat: {
    type: 'daily',
    endDate: '2025-01-01', // 시작일보다 이전
  },
}
```

**결과**: 빈 배열 `[]` 반환 ✅

#### 5. 매년 반복에서 MAX_DATE 제한 (라인 99-120)

**입력**:
```typescript
{
  date: '2025-06-01',
  repeat: {
    type: 'yearly',
    endDate: '2027-06-01', // MAX_DATE 초과
  },
}
```

**결과**: 1개만 생성 (2025-06-01만, 2026/2027은 MAX_DATE 초과) ✅

---

## 5. 엣지 케이스

### 5.1 endDate = MAX_DATE

- **입력**: endDate: '2025-12-31'
- **동작**: effectiveEndDate = 2025-12-31
- **결과**: 정상 생성

### 5.2 endDate = 시작일

- **입력**: date: '2025-01-01', endDate: '2025-01-01'
- **동작**: effectiveEndDate = 2025-01-01
- **결과**: 1개만 생성 ✅ (테스트 완료)

### 5.3 endDate < 시작일

- **입력**: date: '2025-01-05', endDate: '2025-01-01'
- **동작**: effectiveEndDate < startDate 검증
- **결과**: 빈 배열 반환 ✅ (테스트 완료)

### 5.4 endDate 없음

- **입력**: endDate: undefined
- **동작**: endDate = maxDate
- **결과**: 2025-12-31까지 생성 ✅ (테스트 완료)

---

## 6. 구현 세부사항

### 6.1 날짜 비교

```typescript
// Date 객체 비교 사용
if (effectiveEndDate < startDate) {
  return [];
}

while (currentDate <= effectiveEndDate) {
  // 반복 생성
}
```

### 6.2 루프 종료 조건

```typescript
const nextDate = getNextOccurrence(currentDate, repeat.type);
if (!nextDate || nextDate > effectiveEndDate) {
  break;
}
```

- `!nextDate`: getNextOccurrence가 null 반환 (더 이상 계산 불가)
- `nextDate > effectiveEndDate`: 종료일 초과

---

## 7. 작업 001과의 관계

작업 004는 **별도 작업이 아님**. 작업 001에서 이미 완료되었습니다.

**이유**:
- 종료일 로직은 반복 생성의 기본 요구사항
- `generateRecurringEvents()` 함수의 핵심 로직
- 분리할 수 없는 기능 (반복 생성과 종료일은 불가분)

**작업 001 커밋 내역**:
- 🔴 RED: 종료일 관련 테스트 5개 포함
- 🟢 GREEN: effectiveEndDate 로직 구현
- 🔵 REFACTOR: 코드 정리

---

## 8. 검증 완료

### 8.1 테스트 결과

```bash
✓ 32 passed (32)
```

- 작업 001: 17개 (종료일 테스트 5개 포함)
- 작업 002: 9개
- 작업 003: 6개

### 8.2 코드 품질

- ✅ TypeScript 타입 검사 통과
- ✅ ESLint 검사 통과
- ✅ 단위 테스트 100% 통과

---

## 9. 결론

**작업 004는 이미 완료되었습니다.**

종료일 로직은 작업 001의 `generateRecurringEvents()` 함수 구현 시 포함되었으며, 5개의 테스트로 검증되었습니다. 별도 작업이 필요하지 않습니다.

**다음 작업**:
- 작업 005: 반복 설정 UI 활성화 (Phase 2 시작)
