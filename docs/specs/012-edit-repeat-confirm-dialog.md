# 명세: 반복 일정 수정 확인 다이얼로그 UI (작업 012)

## 📋 개요

**작업**: 반복 일정을 수정할 때 "해당 일정만 수정할지, 전체 반복 일정을 수정할지" 선택하는 다이얼로그 표시
**목적**: 사용자가 반복 일정 수정 시 의도한 범위를 명확히 선택하게 하기
**영향 범위**: `src/App.tsx`의 수정 버튼 클릭 로직 (Edit 버튼 핸들러)

---

## 📝 요구사항

### 기능 요구사항

1. **다이얼로그 표시 조건**

   - 기존 이벤트를 수정할 때만 표시
   - 단, `repeatParentId`가 존재하는 경우만 (반복 일정)
   - 단일 이벤트는 다이얼로그 없이 바로 수정

2. **다이얼로그 UI**

   - 제목: "반복 일정 수정"
   - 메시지: "해당 일정만 수정하시겠어요?"
   - 버튼:
     - "이 일정만" → 단일 이벤트만 수정
     - "전체 반복" → 모든 반복 인스턴스 수정
     - "취소" → 작업 취소

3. **상태 관리**
   - 다이얼로그 열기/닫기 상태
   - 선택된 옵션 저장
   - 현재 수정 중인 이벤트 임시 저장

### 비기능 요구사항

- UI: Material-UI Dialog 사용
- 반응성: 즉각적인 응답
- 사용성: 명확한 설명 텍스트

---

## 🎯 영향 범위

### 수정할 파일

- `src/App.tsx`
  - 상태 변수: 다이얼로그 열기/닫기, 선택 옵션
  - 함수: Edit 버튼 핸들러 수정
  - UI: Dialog 컴포넌트 추가

### 필요한 import

- `Dialog`, `DialogTitle`, `DialogContent`, `DialogContentText`, `DialogActions`, `Button` (MUI)

---

## 📊 데이터 구조

### 상태 변수

```typescript
// 다이얼로그 관련 상태
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [editingEvent, setEditingEvent] = useState<Event | null>(null);
const [editOption, setEditOption] = useState<'single' | 'all' | null>(null);
```

### 다이얼로그 선택 옵션

```typescript
type EditOption = 'single' | 'all';

// 'single': 해당 이벤트만 수정
// 'all': 같은 repeatParentId를 가진 모든 이벤트 수정
```

---

## 🚨 엣지 케이스

### 1. repeatParentId가 없는 이벤트 (단일 이벤트)

- 현재 동작: 다이얼로그 없이 바로 수정 폼 열기
- 예상: ✅ 변경 없음

### 2. repeatParentId가 있는 이벤트 (반복 이벤트)

- 현재 동작: 없음 (이 작업에서 추가)
- 예상: ✅ 다이얼로그 표시

### 3. 다이얼로그 취소

- 현재 동작: 없음
- 예상: ✅ 다이얼로그 닫기, 상태 초기화

---

## ✅ 테스트 시나리오

### 시나리오 1: 단일 이벤트 수정

```
이벤트: { repeatParentId: undefined }
클릭: Edit 버튼
예상: 다이얼로그 없이 수정 폼 열기
```

### 시나리오 2: 반복 이벤트 수정

```
이벤트: { repeatParentId: "parent-123" }
클릭: Edit 버튼
예상: 다이얼로그 표시
```

### 시나리오 3: "이 일정만" 선택

```
다이얼로그: 표시됨
클릭: "이 일정만" 버튼
예상: 해당 이벤트 id로만 수정
```

### 시나리오 4: "전체 반복" 선택

```
다이얼로그: 표시됨
클릭: "전체 반복" 버튼
예상: 같은 repeatParentId의 모든 이벤트 수정
```

### 시나리오 5: 취소

```
다이얼로그: 표시됨
클릭: "취소" 버튼
예상: 다이얼로그 닫기, 아무것도 안 함
```

---

## 🔧 구현 흐름

```
사용자 Edit 버튼 클릭
  ↓
이벤트 타입 확인
  ├─ repeatParentId 없음 → 바로 수정 폼 열기
  └─ repeatParentId 있음
     ↓
     다이얼로그 열기
     ├─ "이 일정만" 클릭
     │  ├─ editOption = 'single'
     │  ├─ 다이얼로그 닫기
     │  └─ 수정 폼 열기
     ├─ "전체 반복" 클릭
     │  ├─ editOption = 'all'
     │  ├─ 다이얼로그 닫기
     │  └─ 수정 폼 열기
     └─ "취소" 클릭
        └─ 다이얼로그 닫기, 아무것도 안 함
```

---

## 📌 구현 체크리스트

- [ ] 상태 변수 3개 추가 (dialogOpen, editingEvent, editOption)
- [ ] Dialog import 추가
- [ ] 다이얼로그 컴포넌트 작성
- [ ] Edit 버튼 핸들러 수정
- [ ] 다이얼로그 버튼 핸들러 작성
- [ ] 시각적 테스트 (앱 실행)
