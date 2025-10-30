# 명세: 이벤트 리스트에 반복 아이콘 추가 (작업 011)

## 📋 개요

**작업**: 이벤트 목록 뷰에서 반복 설정이 있는 이벤트에 아이콘 표시
**목적**: 이벤트 리스트에서도 반복 일정을 한눈에 구분하기
**영향 범위**: `src/App.tsx`의 이벤트 리스트 렌더링 부분 (라인 538-589)

---

## 📝 요구사항

### 기능 요구사항

1. **반복 아이콘 표시**
   - `repeat.type !== 'none'`인 경우 Repeat 아이콘 표시
   - 아이콘은 이벤트 제목 앞에 배치
   - 작업 010과 동일한 패턴

2. **기존 레이아웃 유지**
   - 이벤트 리스트의 구조는 그대로 유지
   - 아이콘만 추가
   - 알림 아이콘과 함께 표시 가능

### 비기능 요구사항

- UI: 아이콘 크기 일관성 (`fontSize="small"`)
- 성능: 렌더링 성능 저하 없음
- 일관성: 주간/월간 뷰와 동일한 스타일

---

## 🎯 영향 범위

### 수정할 파일

- `src/App.tsx`
  - 이벤트 리스트 렌더링 부분
  - Repeat 아이콘은 이미 import됨 (작업 010에서)

### 기존 구조

```typescript
// 현재 구조 (라인 560-575 부근)
<Stack direction="row" spacing={1} alignItems="center">
  {notifiedEvents.includes(event.id) && <Notifications fontSize="small" />}
  <Typography variant="body1" sx={{ flex: 1 }}>
    {event.title}
  </Typography>
</Stack>

// 예상 구조 (수정 후)
<Stack direction="row" spacing={1} alignItems="center">
  {notifiedEvents.includes(event.id) && <Notifications fontSize="small" />}
  {event.repeat?.type !== 'none' && <Repeat fontSize="small" />}
  <Typography variant="body1" sx={{ flex: 1 }}>
    {event.title}
  </Typography>
</Stack>
```

---

## 📊 데이터 구조

```typescript
interface Event extends EventForm {
  id: string;
  repeat: RepeatInfo;  // ← 확인할 필드
}

interface RepeatInfo {
  type: RepeatType;  // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number;
}
```

---

## ✅ 테스트 시나리오

### 시나리오 1: 단일 이벤트 - 아이콘 없음
```
이벤트: { repeat: { type: 'none' } }
예상: 반복 아이콘 없음
```

### 시나리오 2: 매주 반복 - 아이콘 표시
```
이벤트: { repeat: { type: 'weekly' } }
예상: 반복 아이콘 표시
```

### 시나리오 3: 알림 + 반복
```
이벤트: { repeat: { type: 'daily' }, notified: true }
예상: [알림 아이콘] [반복 아이콘] [제목]
```

---

## 📌 구현 체크리스트

- [ ] 이벤트 리스트에서 반복 아이콘 표시 위치 확인
- [ ] 조건문 추가: `event.repeat?.type !== 'none' && <Repeat fontSize="small" />`
- [ ] 시각적 테스트 (앱 실행)
- [ ] 주간/월간 뷰와 일관성 확인
