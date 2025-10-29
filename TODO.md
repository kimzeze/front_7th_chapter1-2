# 🎯 반복 일정 기능 개발 진행 상황

마지막 업데이트: 2024-01-15

---

## Phase 1: 기초 기능 (P0)

### 타입 정의

- [ ] 001: RepeatInfo 타입 확장
  - 파일: `src/types.ts`
  - 예상: 30분
  - 설명: `id?: string` 필드 추가

### 반복 일정 생성 로직

- [ ] 002: 반복 일정 생성 - 매일

  - 파일: `src/utils/recurringEvents.ts` (신규)
  - 예상: 2시간
  - 설명: `generateRecurringEvents()` 함수 작성, 매일 반복 구현

- [ ] 003: 반복 일정 생성 - 매주

  - 파일: `src/utils/recurringEvents.ts`
  - 예상: 1시간
  - 설명: 매주 반복 로직 추가

- [ ] 004: 반복 일정 생성 - 매월 (엣지케이스)

  - 파일: `src/utils/recurringEvents.ts`
  - 예상: 2시간
  - 설명: 매월 반복 + 31일 엣지케이스 처리

- [ ] 005: 반복 일정 생성 - 매년 (윤년)
  - 파일: `src/utils/recurringEvents.ts`
  - 예상: 2시간
  - 설명: 매년 반복 + 윤년(2월 29일) 엣지케이스 처리

### UI 컴포넌트

- [ ] 006: 반복 옵션 UI

  - 파일: `src/App.tsx` (또는 별도 컴포넌트)
  - 예상: 1.5시간
  - 설명: 반복 유형 선택 체크박스 + 드롭다운 (매일/매주/매월/매년)

- [ ] 007: 반복 종료일 설정 UI

  - 파일: `src/App.tsx`
  - 예상: 1시간
  - 설명: 종료일 입력 필드 추가 (최대 2025-12-31)

- [ ] 008: 반복 일정 저장 로직
  - 파일: `src/hooks/useEventOperations.ts`
  - 예상: 1.5시간
  - 설명: POST `/api/events-list` 연동, repeat.id 처리

---

## Phase 2: 표시 (P0)

- [ ] 009: 반복 일정 아이콘 표시
  - 파일: `src/App.tsx` (캘린더 부분)
  - 예상: 1시간
  - 설명: 반복 일정에 아이콘 추가, repeat.type !== 'none' 체크

---

## Phase 3: 수정/삭제 (P1)

### 수정 기능

- [ ] 010: 수정 확인 다이얼로그

  - 파일: `src/App.tsx`
  - 예상: 1시간
  - 설명: "해당 일정만 수정하시겠어요?" 다이얼로그 추가

- [ ] 011: 단일 수정 로직

  - 파일: `src/hooks/useEventOperations.ts`
  - 예상: 1.5시간
  - 설명: 반복 일정 → 단일 일정 변환 (repeat.type = 'none')

- [ ] 012: 전체 수정 로직
  - 파일: `src/hooks/useEventOperations.ts`
  - 예상: 1.5시간
  - 설명: PUT `/api/recurring-events/:repeatId` 사용

### 삭제 기능

- [ ] 013: 단일 삭제 로직

  - 파일: `src/hooks/useEventOperations.ts`
  - 예상: 1시간
  - 설명: DELETE `/api/events/:id` (단일 이벤트만)

- [ ] 014: 전체 삭제 로직
  - 파일: `src/hooks/useEventOperations.ts`
  - 예상: 1시간
  - 설명: DELETE `/api/recurring-events/:repeatId` 사용

---

## 📝 개발 노트

### 2024-01-15

- 프로젝트 시작
- Agent 워크플로우 세팅 완료 (6개 Agent)
- 규칙 문서 작성 완료 (한글)
- 템플릿 및 폴더 구조 세팅 완료
- TODO.md 진행 상황 추적 시스템 구축

### 다음 작업

- [ ] 작업 001 시작: RepeatInfo 타입 확장

---

## 📊 통계

- **전체**: 0/14
- **완료**: 0 ✅
- **진행중**: 0 🔄
- **대기**: 14 ⏳

---

## 🎯 작업 순서

```
001 (타입)
 ↓
002 (매일) → 003 (매주) → 004 (매월) → 005 (매년)
                                         ↓
006 (UI) → 007 (종료일) ──────────────→ 008 (저장)
                                         ↓
                                    009 (아이콘)
                                         ↓
                           010 (다이얼로그) → 011 (단일수정)
                                         ↓      ↓
                                    012 (전체수정) 013 (단일삭제)
                                         ↓
                                    014 (전체삭제)
```

---

## 💡 참고사항

### 제약사항

- 31일 매월 반복: 31일에만 생성 (2, 4, 6, 9, 11월 제외)
- 윤년 29일 매년 반복: 29일에만 생성
- 최대 날짜: 2025-12-31

### 서버 API

- POST `/api/events-list`: 여러 이벤트 생성 (repeat.id 자동 동일 설정)
- PUT `/api/recurring-events/:repeatId`: 시리즈 전체 수정
- DELETE `/api/recurring-events/:repeatId`: 시리즈 전체 삭제
