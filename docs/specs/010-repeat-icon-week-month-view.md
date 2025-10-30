# 명세: 주간/월간 뷰에 반복 아이콘 추가 (작업 010)

## 📋 개요

**작업**: 주간/월간 뷰의 이벤트 표시 시 반복 설정이 있는 경우 아이콘 표시
**목적**: 사용자가 한눈에 어떤 이벤트가 반복 일정인지 인식할 수 있도록 하기
**영향 범위**: `src/App.tsx`의 `renderWeekView()`, `renderMonthView()` 함수

---

## 📝 요구사항

### 기능 요구사항

1. **반복 아이콘 표시**

   - `repeat.type !== 'none'`인 경우 Repeat 아이콘 표시
   - 아이콘은 이벤트 제목 앞에 배치
   - 아이콘 색상/크기는 통일

2. **단일 이벤트 처리**

   - `repeat.type === 'none'`: 아이콘 표시 안 함
   - 기존 동작 유지

3. **알림과 함께 표시**
   - 알림 아이콘이 있을 때도 함께 표시
   - 순서: [알림 아이콘(있으면)] + [반복 아이콘(있으면)] + [제목]

### 비기능 요구사항

- UI: 아이콘 크기 일관성 (`fontSize="small"`)
- 접근성: 아이콘에 적절한 의미 전달
- 성능: 렌더링 성능 저하 없음

---

## 🎯 영향 범위

### 수정할 파일

- `src/App.tsx`
  - 함수: `renderWeekView()` (라인 149-224)
  - 함수: `renderMonthView()` (라인 226-305)

### Import 확인

- `@mui/icons-material/Repeat` 아이콘 import 필요 (기존 확인)

### 기존 구조

```typescript
// 현재 구조 (라인 203-212)
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
</Stack>

// 예상 구조 (수정 후)
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  {event.repeat?.type !== 'none' && <Repeat fontSize="small" />}
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
</Stack>
```

---

## 📊 데이터 구조

### 이벤트 객체

```typescript
interface Event extends EventForm {
  id: string;
  repeat: RepeatInfo; // ← 확인할 필드
  repeatParentId?: string;
}

interface RepeatInfo {
  type: RepeatType; // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number;
  endDate?: string;
  id?: string;
}
```

---

## 🚨 엣지 케이스

### 1. repeat.type === 'none'

- 예상: 아이콘 표시 안 함
- 검증: Repeat 아이콘 없음

### 2. repeat.type !== 'none' (daily/weekly/monthly/yearly)

- 예상: Repeat 아이콘 표시
- 검증: Repeat 아이콘 있음

### 3. 알림 + 반복이 둘 다 있는 경우

- 예상: 알림 아이콘 먼저, 반복 아이콘 나중
- 순서: [🔔 알림] [🔁 반복] [제목]

### 4. 반복만 있는 경우 (알림 없음)

- 예상: 반복 아이콘만 표시
- 순서: [🔁 반복] [제목]

---

## ✅ 테스트 시나리오

### 시나리오 1: 단일 이벤트 (반복 없음)

```
이벤트: { repeat: { type: 'none' } }
예상: 반복 아이콘 없음
검증: Repeat 아이콘 렌더링 안 됨
```

### 시나리오 2: 매주 반복 이벤트

```
이벤트: { repeat: { type: 'weekly', interval: 1 } }
예상: Repeat 아이콘 표시
검증: Repeat 아이콘 렌더링됨
```

### 시나리오 3: 매월 반복 + 알림

```
이벤트: { repeat: { type: 'monthly' }, notified: true }
예상: 알림 아이콘 + 반복 아이콘
검증: [알림 🔔] [반복 🔁] [제목]
```

### 시나리오 4: 주간 뷰에서 반복 표시

```
뷰: week
이벤트: { repeat: { type: 'weekly' } }
예상: renderWeekView()에 반복 아이콘 표시
검증: 주간 뷰 셀에 Repeat 아이콘 있음
```

### 시나리오 5: 월간 뷰에서 반복 표시

```
뷰: month
이벤트: { repeat: { type: 'daily' } }
예상: renderMonthView()에 반복 아이콘 표시
검증: 월간 뷰 셀에 Repeat 아이콘 있음
```

---

## 📌 구현 체크리스트

- [ ] Repeat 아이콘 import 확인
- [ ] renderWeekView()에 반복 아이콘 조건 추가
- [ ] renderMonthView()에 반복 아이콘 조건 추가
- [ ] 주간/월간 뷰에서 아이콘 표시 확인
- [ ] 단일 이벤트는 아이콘 안 보임 확인
- [ ] 알림 + 반복 순서 확인
- [ ] 테스트 작성
- [ ] 스크린샷/시각 확인

---

## 🔗 관련 코드

**현재 renderWeekView 구조** (라인 203-212):

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
</Stack>
```

**현재 renderMonthView 구조** (라인 290-299):

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
</Stack>
```

**두 구조 모두 동일** → 한 번에 수정 가능 (동일 패턴)
