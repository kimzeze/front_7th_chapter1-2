# 🎯 반복 일정 관리 기능 개발 진행 상황

마지막 업데이트: 2025-10-30

---

## Phase 1: 기초 인프라 구축 (P0)

### 반복 일정 생성 로직

- [ ] 001: 반복 일정 생성 유틸 함수 기본 구조

  - 복잡도: 3/5
  - 예상: 1-2시간
  - 파일: `src/utils/recurringEventUtils.ts` (신규)
  - 설명: `generateRecurringEvents()` 함수 작성. 매일/매주/매월/매년 반복 로직 구현

- [ ] 002: 31일 매월 반복 엣지 케이스 처리

  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/utils/recurringEventUtils.ts`
  - 설명: 31일이 없는 달(2월, 4월, 6월, 9월, 11월)을 건너뛰는 로직

- [ ] 003: 윤년 2월 29일 매년 반복 엣지 케이스 처리

  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/utils/recurringEventUtils.ts`
  - 설명: 평년에는 2월 29일을 건너뛰는 로직

- [ ] 004: 반복 종료일 및 2025-12-31 제한 로직
  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/utils/recurringEventUtils.ts`
  - 설명: 종료일과 최대 날짜(2025-12-31) 중 더 이른 날짜까지만 생성

---

## Phase 2: UI 활성화 (P0)

### 반복 설정 UI

- [ ] 005: 반복 설정 UI 주석 해제 및 활성화

  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/App.tsx` (라인 441-478)
  - 설명: 주석 처리된 반복 설정 UI 활성화, setRepeatType/setRepeatInterval/setRepeatEndDate 주석 해제

- [ ] 006: 반복 종료일 validation 추가

  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/hooks/useEventForm.ts`
  - 설명: 종료일이 시작일보다 이후인지, 2025-12-31 이하인지 검증

- [ ] 007: 반복 종료일 max 속성 및 에러 메시지
  - 복잡도: 1/5
  - 예상: ~30분
  - 파일: `src/App.tsx`
  - 설명: TextField에 `max="2025-12-31"` 속성 추가, error/helperText 표시

---

## Phase 3: 반복 일정 생성 통합 (P0)

### 저장 로직 수정

- [x] 008: saveEvent에 반복 생성 로직 통합

  - 복잡도: 3/5
  - 예상: 1-2시간
  - 파일: `src/hooks/useEventOperations.ts`
  - 설명: repeat.type !== 'none'이면 generateRecurringEvents() 호출하여 여러 이벤트 생성
  - ✅ 완료: 2025-10-30

- [x] 009: repeatParentId 생성 및 할당
  - 복잡도: 1/5
  - 예상: ~30분
  - 파일: `src/hooks/useEventOperations.ts`
  - 설명: 반복 일정 생성 시 UUID 또는 timestamp로 repeatParentId 생성, 모든 인스턴스에 할당
  - ✅ 완료: 2025-10-30 (이미 구현됨, 검증 테스트만 추가)

---

## Phase 4: 반복 아이콘 표시 (P0)

### UI 개선

- [x] 010: 주간/월간 뷰에 반복 아이콘 추가

  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/App.tsx` (`renderWeekView`, `renderMonthView`)
  - 설명: `@mui/icons-material/Repeat` 아이콘 import, repeat.type !== 'none'이면 아이콘 표시
  - ✅ 완료: 2025-10-30 (간단한 UI 추가)

- [x] 011: 이벤트 리스트에 반복 아이콘 추가
  - 복잡도: 1/5
  - 예상: ~30분
  - 파일: `src/App.tsx` (라인 573-581)
  - 설명: 이벤트 리스트에도 반복 아이콘 표시
  - ✅ 완료: 2025-10-30 (매우 간단한 UI 추가)

---

## Phase 5: 반복 일정 수정 (P0)

### 수정 기능

- [x] 012: 반복 일정 수정 확인 다이얼로그 UI

  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/App.tsx`
  - 설명: "해당 일정만 수정하시겠어요?" 다이얼로그 추가 (예/아니오 버튼)
  - ✅ 완료: 2025-10-30

- [x] 013: 단일 수정 로직 구현

  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/hooks/useEventOperations.ts`
  - 설명: 단일 수정 시 repeat.type = 'none'으로 변경하여 저장
  - ✅ 완료: 2025-10-30 (TDD 방식: 명세→테스트→RED→GREEN→REFACTOR)

- [x] 014: 전체 수정 로직 구현
  - 복잡도: 3/5
  - 예상: 1-2시간
  - 파일: `src/hooks/useEventOperations.ts`
  - 설명: 같은 repeatParentId를 가진 모든 이벤트를 찾아 일괄 수정 (날짜는 개별 유지)
  - ✅ 완료: 2025-10-30 (TDD 방식: 명세→테스트→RED→GREEN→REFACTOR)

---

## Phase 6: 반복 일정 삭제 (P0)

### 삭제 기능

- [x] 015: 반복 일정 삭제 확인 다이얼로그 UI

  - 복잡도: 2/5
  - 예상: ~1시간
  - 파일: `src/App.tsx`
  - 설명: "해당 일정만 삭제하시겠어요?" 다이얼로그 추가 ("이 일정만"/"전체 반복"/"취소" 버튼)
  - ✅ 완료: 2025-10-30 (TDD 방식: 명세→테스트→RED→GREEN→REFACTOR)
  - 실제 소요: ~4시간 (MSW 테스트 격리 개선 포함)

- [ ] 016: 단일 삭제 로직 구현

  - 복잡도: 1/5
  - 예상: ~30분
  - 파일: `src/hooks/useEventOperations.ts`
  - 설명: 단일 삭제는 기존 deleteEvent 로직 활용

- [ ] 017: 전체 삭제 로직 구현
  - 복잡도: 3/5
  - 예상: 1-2시간
  - 파일: `src/hooks/useEventOperations.ts`
  - 설명: 같은 repeatParentId를 가진 모든 이벤트를 찾아 일괄 삭제 (Promise.all 활용)

---

## 📝 개발 노트

### 2025-10-30

- 프로젝트 시작
- Phase 0 완료: Epic, Stories, TODO.md 작성
- 작업 분할 완료 (총 17개 작업)

### 2025-10-30 (작업 008 진행)

- ✅ Phase 1 완료: 명세 작성 (docs/specs/008-save-event-integration.md)
- ✅ Phase 2 완료: 테스트 설계 (docs/specs/008-test-design.md)
- 🔴 Phase 3 완료: RED - 테스트 작성
  - TC-001: 단일 이벤트 (PASS ✓)
  - TC-002: 매주 반복 (FAIL - generateRecurringEvents 미호출)
  - TC-007: 수정 모드 (PASS ✓)
  - TC-005: 부분 실패 (FAIL - 에러 미처리)
  - TC-008: 빈 배열 (FAIL - generateRecurringEvents 미호출)
  - 커밋: "test: saveEvent 반복 생성 로직 테스트 추가 (RED)"

### 2025-10-30 (작업 008 완료!)

- 🟢 Phase 4 완료: GREEN - 기능 구현

  - saveEvent 함수에 반복 생성 로직 통합
  - repeat.type !== 'none' 시 generateRecurringEvents() 호출
  - 여러 이벤트를 순차적으로 API에 저장
  - 모든 테스트 통과 (161/161 ✅)
  - 커밋: "feat: saveEvent에 반복 생성 로직 통합 (GREEN)"

- 🔵 Phase 5 완료: REFACTOR - 리팩토링

  - 중복 코드 제거 (handleSaveSuccess 헬퍼 함수)
  - 복잡한 로직을 3개 함수로 분리:
    - handleSaveSuccess: 저장 완료 후 공통 처리
    - saveRepeatingEvent: 반복 이벤트 저장
    - saveSingleEvent: 단일 이벤트 저장
  - debug log 제거
  - 코드 가독성 개선
  - 모든 테스트 여전히 통과 (161/161 ✅)
  - 커밋: "refactor: saveEvent 함수 리팩토링 - 중복 제거 및 함수 분리 (REFACTOR)"

- ✅ 작업 008 완료! TDD 사이클 완성 (RED → GREEN → REFACTOR)

### 2025-10-30 (작업 009 완료!)

- ✅ Phase 1 완료: 명세 작성 (docs/specs/009-repeat-parent-id.md)
- ✅ Phase 2 완료: 테스트 설계 (docs/specs/009-test-design.md)
- ✅ Phase 3 완료: RED/GREEN - 테스트 작성 (이미 구현되어 있음!)

  - generateRecurringEvents() 함수에서 repeatParentId 완벽히 구현됨
  - 9개 테스트 케이스 모두 통과 ✓
  - 테스트 추가:
    - TC-001: 4개 반복 이벤트 - 모두 동일한 repeatParentId
    - TC-002: 3개 반복 이벤트 (매월)
    - TC-003: 31개 반복 이벤트 (매일)
    - TC-004: 단일 이벤트 - repeatParentId 없음
    - TC-005: 2개 반복 그룹 - 서로 다른 repeatParentId
    - TC-006: 각 이벤트 id 고유, repeatParentId 동일
    - TC-007: repeatParentId 형식 검증 (UUID/Timestamp)
    - TC-008: 1개만 생성 (종료일 = 시작일)
    - TC-009: 빈 배열 (종료일 < 시작일)
  - 전체 테스트: 170 passed (기존 161 + 신규 9) ✅
  - 커밋: "test: repeatParentId 생성 및 할당 검증 테스트 추가 (RED/GREEN)"

- ✅ Phase 5 스킵: REFACTOR 불필요 (이미 완벽한 구현)

- ✅ 작업 009 완료! repeatParentId 검증 완료

### 2025-10-30 (작업 010 완료!)

- ✅ Phase 1 완료: 명세 작성 (docs/specs/010-repeat-icon-week-month-view.md)
- ✅ Phase 2 완료: 테스트 설계 (docs/specs/010-test-design.md)
- ✅ Phase 3 완료: RED/GREEN - 기능 구현

  - Repeat 아이콘 import 추가
  - renderWeekView()에 반복 아이콘 조건 추가
  - renderMonthView()에 반복 아이콘 조건 추가
  - 조건: event.repeat?.type !== 'none' && <Repeat fontSize="small" />
  - 순서: [알림 아이콘] + [반복 아이콘] + [제목]
  - 커밋: "feat: 주간/월간 뷰에 반복 아이콘 추가 (RED/GREEN)"

- ✅ Phase 5 스킵: REFACTOR 불필요 (간단한 UI 추가)

- ✅ 작업 010 완료! 주간/월간 뷰에 반복 아이콘 추가 완료

### 2025-10-30 (작업 015 완료!)

- ✅ Phase 1 완료: 명세 작성 (docs/specs/015-delete-repeat-confirm-dialog.md)
- ✅ Phase 2 완료: 테스트 설계 (docs/specs/015-test-design.md)
- ✅ Phase 3 완료: RED - 테스트 작성
  - TC-001~TC-008: 8개 테스트 작성 (다이얼로그 표시, 버튼 동작, 경계값, 통합)
  - 커밋: "test: 반복 일정 삭제 확인 다이얼로그 UI 테스트 추가 (RED)"
- ✅ Phase 4 완료: GREEN - 기능 구현
  - deleteRepeatDialogOpen, deletingEventForRepeat, deleteOption 상태 추가
  - Dialog 컴포넌트 추가 ("이 일정만"/"전체 반복"/"취소")
  - 커밋: "feat: 반복 일정 삭제 확인 다이얼로그 UI 구현 (GREEN)"
- ✅ Phase 5 완료: REFACTOR - MSW 테스트 격리 개선
  - handlers.ts와 handlersUtils.ts 역할 명확화
  - resetMockEvents() 함수 추가
  - server.use(...setupMockHandlerXxx()) 패턴 적용
  - 커밋: "refactor: MSW 핸들러 구조 정리 및 개선"

- ✅ 작업 015 완료! (8/8 테스트 통과)
- ✅ 추가 수정: 작업 012-014 editOption 연동 누락 해결
- ✅ 추가 개선: integration 테스트 수정 (Multiple elements 문제 해결)
- ✅ 전체 테스트: 191/191 통과 (100%) 🎉

### 다음 작업

- [ ] 작업 016: 단일 삭제 로직 구현
- [ ] 작업 017: 전체 삭제 로직 구현

---

## 📊 통계

- **전체**: 8/17
- **완료**: 8 ✅
- **진행중**: 0 🔄
- **대기**: 9 ⏳

---

## 🎯 작업 순서 및 의존성

```
001 (반복 생성 유틸) → 002 (31일) → 003 (윤년) → 004 (종료일)
                       ↓
005 (UI 활성화) → 006 (validation) → 007 (max 속성)
                       ↓
008 (saveEvent 통합) → 009 (repeatParentId)
                       ↓
010 (주간/월간 뷰 아이콘) → 011 (리스트 아이콘)
                       ↓
012 (수정 다이얼로그) → 013 (단일 수정) → 014 (전체 수정)
                       ↓
015 (삭제 다이얼로그) → 016 (단일 삭제) → 017 (전체 삭제)
```

**병렬 가능**:

- 001-004 (유틸 함수) 와 005-007 (UI) 는 독립적 (병렬 가능)
- 008-009 완료 후 010-011, 012-014, 015-017 순차 진행

---

## 💡 참고사항

### 제약사항

- **31일 매월 반복**: 31일이 없는 달(2월, 4월, 6월, 9월, 11월) 건너뛰기
- **윤년 2월 29일 매년 반복**: 평년(2025, 2026, 2027...) 건너뛰기
- **최대 날짜**: 2025-12-31까지만 생성
- **반복 일정 겹침**: 반복 일정끼리는 겹침 검사하지 않음

### 기존 코드 활용

- `src/types.ts`: RepeatInfo, Event 타입 이미 정의됨
- `src/App.tsx` 라인 441-478: 반복 UI 주석 처리됨 (활성화 필요)
- `src/hooks/useEventForm.ts`: 반복 관련 state 존재

### 서버 API

- `POST /api/events`: 이벤트 생성
- `PUT /api/events/:id`: 이벤트 수정
- `
