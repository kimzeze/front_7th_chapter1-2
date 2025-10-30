# 테스트 설계: 반복 일정 삭제 확인 다이얼로그 UI (작업 015)

## 📋 개요

**테스트 대상**: Delete 버튼 클릭 시 다이얼로그 표시 로직 및 버튼 이벤트
**테스트 파일**: `src/__tests__/medium.integration.spec.tsx` (기존 파일에 추가)
**테스트 프레임워크**: Vitest + React Testing Library
**기준 패턴**: 작업 012 (수정 다이얼로그) 테스트 패턴 준수

---

## 🎯 테스트 목표

1. **다이얼로그 표시 조건**: repeatParentId가 있을 때만 표시
2. **다이얼로그 버튼**: 3개 버튼 모두 작동
3. **상태 관리**: 버튼 클릭 시 상태 변경 및 다이얼로그 닫힘
4. **단일 이벤트**: repeatParentId 없으면 다이얼로그 스킵, 바로 삭제

---

## 📝 테스트 케이스 설계

### 테스트 그룹 1: 다이얼로그 표시 조건

#### TC-001: 단일 이벤트 Delete 클릭 - 다이얼로그 안 보임

```
설명: repeatParentId가 없는 이벤트의 Delete 버튼 클릭
전제 조건:
  - 이벤트 목록에 단일 이벤트 존재
  - repeatParentId: undefined
입력:
  - 이벤트: { id: '1', title: '회의', repeatParentId: undefined, ... }
  - 클릭: Delete 버튼
예상 결과:
  - 다이얼로그 렌더링 안 됨
  - 바로 deleteEvent(id) 호출 (기존 로직 유지)
검증:
  - screen.queryByRole('dialog', { name: /반복 일정 삭제/ }) === null
  - 삭제 API 호출 확인 (MSW로 검증)
```

**AAA 패턴**:

```typescript
// TODO: Arrange - 단일 이벤트가 포함된 목 데이터 설정
// TODO: Arrange - App 컴포넌트 렌더링
// TODO: Act - Delete 버튼 클릭
// TODO: Assert - 다이얼로그가 렌더링되지 않음
// TODO: Assert - DELETE API 호출 확인
```

---

#### TC-002: 반복 이벤트 Delete 클릭 - 다이얼로그 표시

```
설명: repeatParentId가 있는 이벤트의 Delete 버튼 클릭
전제 조건:
  - 이벤트 목록에 반복 이벤트 존재
  - repeatParentId: 'parent-123'
입력:
  - 이벤트: { id: '1', title: '주간 회의', repeatParentId: 'parent-123', ... }
  - 클릭: Delete 버튼
예상 결과:
  - 다이얼로그 렌더링됨
  - 제목: "반복 일정 삭제"
  - 메시지: "해당 일정만 삭제하시겠어요?"
  - 3개 버튼: "이 일정만", "전체 반복", "취소"
검증:
  - screen.getByRole('dialog', { name: /반복 일정 삭제/ }) 존재
  - screen.getByText('해당 일정만 삭제하시겠어요?') 존재
  - 버튼 3개 모두 존재 확인:
    - getByRole('button', { name: /이 일정만/ })
    - getByRole('button', { name: /전체 반복/ })
    - getByRole('button', { name: /취소/ })
```

**AAA 패턴**:

```typescript
// TODO: Arrange - repeatParentId가 있는 이벤트 목 데이터 설정
// TODO: Arrange - App 컴포넌트 렌더링
// TODO: Act - Delete 버튼 클릭
// TODO: Assert - 다이얼로그 렌더링됨
// TODO: Assert - 제목, 메시지, 3개 버튼 존재 확인
```

---

### 테스트 그룹 2: 다이얼로그 버튼 동작

#### TC-003: "이 일정만" 버튼 클릭

```
설명: "이 일정만" 버튼을 클릭하면 다이얼로그가 닫히고 단일 삭제
전제 조건:
  - 다이얼로그 표시된 상태
  - repeatParentId가 있는 이벤트
입력:
  - 클릭: "이 일정만" 버튼
예상 결과:
  - deleteOption 상태가 'single'으로 설정
  - 다이얼로그 닫힘
  - deleteEvent(id, 'single') 호출 (작업 016에서 구현 예정)
검증:
  - screen.queryByRole('dialog') === null (다이얼로그 닫힘)
  - DELETE /api/events/:id 호출 확인 (MSW)
  - 단일 이벤트만 삭제되었는지 확인
```

**AAA 패턴**:

```typescript
// TODO: Arrange - 다이얼로그 열린 상태로 설정
// TODO: Act - "이 일정만" 버튼 클릭
// TODO: Assert - 다이얼로그 닫힘
// TODO: Assert - DELETE API 1번만 호출 (단일 삭제)
```

---

#### TC-004: "전체 반복" 버튼 클릭

```
설명: "전체 반복" 버튼을 클릭하면 다이얼로그가 닫히고 전체 삭제
전제 조건:
  - 다이얼로그 표시된 상태
  - repeatParentId가 있는 이벤트
입력:
  - 클릭: "전체 반복" 버튼
예상 결과:
  - deleteOption 상태가 'all'로 설정
  - 다이얼로그 닫힘
  - deleteEvent(id, 'all') 호출 (작업 017에서 구현 예정)
검증:
  - screen.queryByRole('dialog') === null (다이얼로그 닫힘)
  - DELETE /api/events/:id 여러 번 호출 확인 (MSW)
  - 같은 repeatParentId를 가진 모든 이벤트 삭제 확인
```

**AAA 패턴**:

```typescript
// TODO: Arrange - 다이얼로그 열린 상태, 같은 repeatParentId 이벤트 여러 개
// TODO: Act - "전체 반복" 버튼 클릭
// TODO: Assert - 다이얼로그 닫힘
// TODO: Assert - DELETE API 여러 번 호출 (전체 삭제)
```

---

#### TC-005: "취소" 버튼 클릭

```
설명: "취소" 버튼을 클릭하면 다이얼로그만 닫히고 삭제 안 함
전제 조건:
  - 다이얼로그 표시된 상태
입력:
  - 클릭: "취소" 버튼
예상 결과:
  - deleteOption 상태 초기화 (null)
  - 다이얼로그 닫힘
  - deleteEvent 호출 안 됨
  - 이벤트 그대로 유지
검증:
  - screen.queryByRole('dialog') === null (다이얼로그 닫힘)
  - DELETE API 호출 안 됨 (MSW로 확인)
  - 이벤트 목록 변경 없음
```

**AAA 패턴**:

```typescript
// TODO: Arrange - 다이얼로그 열린 상태
// TODO: Act - "취소" 버튼 클릭
// TODO: Assert - 다이얼로그 닫힘
// TODO: Assert - DELETE API 호출 안 됨
// TODO: Assert - 이벤트 목록 유지
```

---

### 테스트 그룹 3: 경계값 및 예외 케이스

#### TC-006: 다이얼로그 외부 클릭 또는 ESC 키

```
설명: 다이얼로그 외부 클릭 또는 ESC 키로 닫기
전제 조건:
  - 다이얼로그 표시된 상태
입력:
  - ESC 키 입력 또는 backdrop 클릭
예상 결과:
  - 다이얼로그 닫힘
  - 상태 초기화
  - deleteEvent 호출 안 됨
검증:
  - onClose 핸들러 실행
  - 다이얼로그 닫힘
  - DELETE API 호출 안 됨
```

**AAA 패턴**:

```typescript
// TODO: Arrange - 다이얼로그 열린 상태
// TODO: Act - ESC 키 입력 또는 backdrop 클릭
// TODO: Assert - 다이얼로그 닫힘
// TODO: Assert - 상태 초기화 (deleteOption = null)
```

---

### 테스트 그룹 4: 통합 시나리오

#### TC-007: 반복 이벤트 삭제 → "이 일정만" → 다시 삭제 가능

```
설명: 반복 이벤트를 단일 삭제 후 다시 삭제할 수 있는지 확인
전제 조건:
  - 같은 repeatParentId를 가진 이벤트 3개
입력:
  - 첫 번째 이벤트 삭제: "이 일정만"
  - 두 번째 이벤트 삭제: "이 일정만"
예상 결과:
  - 두 번 모두 다이얼로그 표시
  - 각각 삭제 성공
  - 남은 이벤트 1개
검증:
  - 두 번 모두 다이얼로그 렌더링
  - DELETE API 2번 호출
  - 이벤트 목록에 1개 남음
```

**AAA 패턴**:

```typescript
// TODO: Arrange - repeatParentId가 같은 이벤트 3개
// TODO: Act - 첫 번째 이벤트 Delete → "이 일정만"
// TODO: Act - 두 번째 이벤트 Delete → "이 일정만"
// TODO: Assert - 두 번 모두 다이얼로그 표시
// TODO: Assert - 이벤트 목록에 1개 남음
```

---

#### TC-008: 단일 이벤트 삭제 후 반복 이벤트 삭제

```
설명: 단일 이벤트 삭제 후 반복 이벤트 삭제 시 다이얼로그 표시
전제 조건:
  - 단일 이벤트 1개 + 반복 이벤트 1개
입력:
  - 단일 이벤트 Delete (다이얼로그 없음)
  - 반복 이벤트 Delete (다이얼로그 표시)
예상 결과:
  - 단일: 다이얼로그 없이 바로 삭제
  - 반복: 다이얼로그 표시
검증:
  - 첫 번째는 다이얼로그 없음
  - 두 번째는 다이얼로그 표시
```

**AAA 패턴**:

```typescript
// TODO: Arrange - 단일 이벤트 + 반복 이벤트
// TODO: Act - 단일 이벤트 Delete
// TODO: Assert - 다이얼로그 없음
// TODO: Act - 반복 이벤트 Delete
// TODO: Assert - 다이얼로그 표시
```

---

## 🧪 테스트 구조 (describe/it)

```typescript
describe('반복 일정 삭제', () => {
  describe('다이얼로그 표시 조건', () => {
    it('TC-001: 단일 이벤트 삭제 시 다이얼로그가 표시되지 않는다', () => {
      // TODO: Arrange
      // TODO: Act
      // TODO: Assert
    });

    it('TC-002: 반복 이벤트 삭제 시 다이얼로그가 표시된다', () => {
      // TODO: Arrange
      // TODO: Act
      // TODO: Assert
    });
  });

  describe('다이얼로그 버튼 동작', () => {
    it('TC-003: "이 일정만" 버튼 클릭 시 다이얼로그가 닫히고 단일 삭제된다', () => {
      // TODO: Arrange
      // TODO: Act
      // TODO: Assert
    });

    it('TC-004: "전체 반복" 버튼 클릭 시 다이얼로그가 닫히고 전체 삭제된다', () => {
      // TODO: Arrange
      // TODO: Act
      // TODO: Assert
    });

    it('TC-005: "취소" 버튼 클릭 시 다이얼로그만 닫히고 삭제되지 않는다', () => {
      // TODO: Arrange
      // TODO: Act
      // TODO: Assert
    });
  });

  describe('경계값 및 예외 케이스', () => {
    it('TC-006: ESC 키 또는 외부 클릭 시 다이얼로그가 닫힌다', () => {
      // TODO: Arrange
      // TODO: Act
      // TODO: Assert
    });
  });

  describe('통합 시나리오', () => {
    it('TC-007: 반복 이벤트를 여러 번 단일 삭제할 수 있다', () => {
      // TODO: Arrange
      // TODO: Act
      // TODO: Assert
    });

    it('TC-008: 단일 이벤트 삭제 후 반복 이벤트 삭제 시 다이얼로그가 표시된다', () => {
      // TODO: Arrange
      // TODO: Act
      // TODO: Assert
    });
  });
});
```

---

## 📋 RTL 쿼리 전략

### 다이얼로그 요소 찾기

```typescript
// 다이얼로그 존재 확인
const dialog = screen.getByRole('dialog', { name: /반복 일정 삭제/ });

// 메시지 확인
const message = screen.getByText('해당 일정만 삭제하시겠어요?');

// 버튼 찾기
const singleButton = screen.getByRole('button', { name: /이 일정만/ });
const allButton = screen.getByRole('button', { name: /전체 반복/ });
const cancelButton = screen.getByRole('button', { name: /취소/ });
```

### Delete 버튼 찾기

```typescript
// aria-label로 찾기
const deleteButtons = screen.getAllByLabelText('Delete event');

// 첫 번째 이벤트의 Delete 버튼
const firstDeleteButton = deleteButtons[0];
```

### 다이얼로그 닫힘 확인

```typescript
// 다이얼로그가 없어졌는지 확인
expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
```

---

## 🎯 Mock 데이터 준비

### 단일 이벤트

```typescript
const singleEvent: Event = {
  id: '1',
  title: '회의',
  date: '2025-11-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  location: '회의실',
  category: '업무',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
  // repeatParentId 없음
};
```

### 반복 이벤트

```typescript
const recurringEvents: Event[] = [
  {
    id: 'rec-1',
    title: '주간 회의',
    date: '2025-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
    repeatParentId: 'parent-weekly',
  },
  {
    id: 'rec-2',
    title: '주간 회의',
    date: '2025-11-08',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
    repeatParentId: 'parent-weekly',
  },
];
```

---

## 🔧 MSW 핸들러 설정

### DELETE 요청 확인

```typescript
// 삭제 API 호출 추적
let deleteCallCount = 0;
const deletedIds: string[] = [];

server.use(
  http.delete('/api/events/:id', ({ params }) => {
    deleteCallCount++;
    deletedIds.push(params.id as string);
    return HttpResponse.json({ success: true });
  })
);
```

---

## ✅ 검증 체크리스트

### TC-001 (단일 이벤트 삭제)

- [ ] 다이얼로그가 렌더링되지 않음
- [ ] DELETE API 1번 호출
- [ ] 이벤트 목록에서 제거됨

### TC-002 (반복 이벤트 삭제 - 다이얼로그 표시)

- [ ] 다이얼로그 렌더링됨
- [ ] 제목: "반복 일정 삭제"
- [ ] 메시지: "해당 일정만 삭제하시겠어요?"
- [ ] 버튼 3개 존재

### TC-003 ("이 일정만" 버튼)

- [ ] 다이얼로그 닫힘
- [ ] DELETE API 1번 호출 (단일 삭제)

### TC-004 ("전체 반복" 버튼)

- [ ] 다이얼로그 닫힘
- [ ] DELETE API 여러 번 호출 (전체 삭제)

### TC-005 ("취소" 버튼)

- [ ] 다이얼로그 닫힘
- [ ] DELETE API 호출 안 됨

### TC-006 (ESC/외부 클릭)

- [ ] 다이얼로그 닫힘
- [ ] 상태 초기화

### TC-007 (연속 삭제)

- [ ] 여러 번 삭제 가능
- [ ] 각각 다이얼로그 표시

### TC-008 (단일 → 반복)

- [ ] 단일: 다이얼로그 없음
- [ ] 반복: 다이얼로그 표시

---

## 🔗 참고 문서

- `docs/specs/015-delete-repeat-confirm-dialog.md` - 명세 문서
- `docs/specs/012-test-design.md` - 수정 다이얼로그 테스트 (유사 패턴)
- `docs/guidelines/react-testing-library.md` - RTL 가이드라인

---

## ⚠️ 주의사항

### 작업 015의 범위 (UI만)

- ✅ 다이얼로그 표시/숨김
- ✅ 버튼 클릭 시 상태 변경
- ✅ `deleteOption` 상태 설정
- ❌ 실제 삭제 로직 (작업 016/017에서 구현)

### 테스트 시 가정

- TC-003, TC-004에서 실제 삭제 로직은 작업 016/017 이후에 완성됨
- 현재는 `deleteOption` 상태 설정만 테스트
- 다이얼로그 닫힘과 API 호출 여부만 확인

---

## 🎯 완료 조건

- [x] 테스트 설계 문서 작성 완료
- [ ] 테스트 케이스 8개 모두 정의
- [ ] AAA 패턴 TODO 주석 포함
- [ ] RTL 쿼리 전략 명시
- [ ] Mock 데이터 준비
- [ ] 검증 체크리스트 작성
- [ ] 인간 검토 (Phase 2)
- [ ] Test Coder에게 전달 (Phase 3)
