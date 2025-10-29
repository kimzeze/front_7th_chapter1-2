# AI Agents 사용 가이드

## 🎯 Agent 시스템 개요

6개의 전문 Agent가 **완벽한 합주**처럼 협력하여 TDD 개발을 진행합니다.

```
Orchestrator (지휘자)
    ↓
┌───┴───┬────┬────┬────┬────┐
│       │    │    │    │    │
Spec   Test Test Dev  Ref
Design Design Code
       er    r     r    r
```

**각 Agent는 자신의 역할만 수행하며, 겹치지 않습니다.**

---

## 🤖 Agent 목록

### 1. Orchestrator (오케스트레이터) - 지휘자

**역할**: 전체 TDD 워크플로우 조율

- 작업 분할
- Agent 순서 관리
- 품질 검증
- 커밋 관리

**호출**: `@orchestrator`

---

### 2. Spec Designer (명세 설계자)

**역할**: 명세만 작성 (코드 NO)

- 요구사항 분석
- 영향 범위 파악
- 데이터 구조 정의
- API 명세

**호출**: `@spec-designer`

---

### 3. Test Designer (테스트 설계자)

**역할**: 테스트 설계만 (구현 NO)

- 테스트 케이스 도출
- describe/it 구조
- TODO 주석으로 의도 표시

**호출**: `@test-designer`

---

### 4. Test Coder (테스트 코더) - RED

**역할**: 테스트 코드만 구현

- TODO를 실제 코드로
- AAA 패턴
- 실패 확인

**호출**: `@test-coder`

---

### 5. Developer (개발자) - GREEN

**역할**: 기능 구현만 (테스트 수정 NO)

- 최소 구현
- 테스트 통과
- 테스트 절대 수정 금지

**호출**: `@developer`

---

### 6. Refactorer (리팩토러) - REFACTOR

**역할**: 리팩토링만 (기능 변경 NO)

- 코드 구조 개선
- 중복 제거
- 네이밍 개선

**호출**: `@refactorer`

---

## 🔄 TDD 워크플로우

```
1. Spec Designer    → 명세 작성
   ↓ [인간 검토]
2. Test Designer    → 테스트 설계
   ↓ [인간 검토]
3. Test Coder (RED) → 테스트 코드 작성 → 실패 확인 → 커밋
   ↓
4. Developer (GREEN) → 기능 구현 → 통과 확인 → 커밋
   ↓
5. Refactorer (REFACTOR) → 코드 개선 → 통과 유지 → 커밋
   ↓
   완료!
```

---

## 🚀 빠른 시작

### 방법 1: Orchestrator로 전체 관리 (추천!)

```
@orchestrator

RepeatInfo 타입에 id?: string 필드를 추가하고,
TDD 방식으로 구현해줘.

각 단계마다 승인을 요청해줘.
```

### 방법 2: 수동으로 각 단계 진행

```bash
# 1. 명세
@spec-designer
"RepeatInfo에 id 필드 추가" 명세 작성

# 2. 테스트 설계
@test-designer
[명세 기반으로 테스트 설계]

# 3. RED
@test-coder
[테스트 코드 구현]

# 4. GREEN
@developer
[기능 구현]

# 5. REFACTOR
@refactorer
[코드 개선]
```

---

## 📁 프로젝트 구조

```
front_7th_chapter1-2/
├── .cursor/
│   ├── rules                    # 프로젝트 규칙
│   └── agents/                  # 6개 Agent (각 100-200줄)
│       ├── orchestrator.md
│       ├── spec-designer.md
│       ├── test-designer.md
│       ├── test-coder.md
│       ├── developer.md
│       └── refactorer.md
├── docs/
│   ├── guidelines/              # 규칙 문서 (한글)
│   │   ├── tdd-principles.md
│   │   ├── react-testing-library.md
│   │   └── coding-conventions.md
│   ├── epics/                   # Epic 문서
│   ├── stories/                 # User Stories
│   ├── specs/                   # 기술 명세
│   └── templates/               # 문서 템플릿
│       ├── epic-template.md
│       ├── story-template.md
│       └── spec-template.md
└── src/
```

---

## 💡 베스트 프랙티스

### ✅ DO

**1. 작은 단위로**

```
✅ "RepeatInfo에 id 추가"
✅ "반복 생성 유틸 함수"
❌ "반복 일정 전체 기능"
```

**2. 각 단계마다 검토**

- 명세 → 승인
- 테스트 설계 → 승인
- 구현 → 동작 확인
- 리팩토링 → 개선 확인

**3. 자주 커밋**

```bash
git commit -m "test: 기능 테스트 (RED)"
git commit -m "feat: 기능 구현 (GREEN)"
git commit -m "refactor: 코드 개선 (REFACTOR)"
```

### ❌ DON'T

**1. 여러 작업 동시 진행**

```
❌ "반복 생성 + UI + 삭제 한 번에"
```

**2. 단계 건너뛰기**

```
❌ 테스트 없이 바로 구현
```

**3. Agent 역할 침범**

```
❌ Developer가 테스트 수정
❌ Test Coder가 기능 구현
```

---

## 🎓 각 Agent의 경계

```
Spec Designer:
  ✅ 명세 작성 (Markdown)
  ❌ 코드 작성/수정

Test Designer:
  ✅ 테스트 설계 (TODO)
  ❌ 테스트 코드 구현

Test Coder:
  ✅ 테스트 코드 구현
  ❌ 기능 구현

Developer:
  ✅ 기능 구현
  ❌ 테스트 수정

Refactorer:
  ✅ 코드 구조 개선
  ❌ 기능 변경
```

**→ 완벽한 합주! 각자의 역할만 충실히**

---

## 📖 참고 문서

### Agent 사용

- 각 Agent 파일 (`orchestrator.md`, `spec-designer.md` 등)

### 개발 규칙

- `docs/guidelines/tdd-principles.md` - TDD 원칙
- `docs/guidelines/react-testing-library.md` - RTL 가이드
- `docs/guidelines/coding-conventions.md` - 코딩 컨벤션

### 템플릿

- `docs/templates/epic-template.md`
- `docs/templates/story-template.md`
- `docs/templates/spec-template.md`

---

## 🔧 문제 해결

### 테스트 실패 (GREEN 단계)

```
@developer

테스트가 실패해. 에러:
[에러 메시지]

수정해줘.
```

### Agent가 역할을 벗어날 때

```
❌ Developer가 테스트를 수정했어

"테스트는 수정하지 마.
테스트는 그대로 두고 구현 코드만 수정해."
```

### 명세 불명확

```
@spec-designer

"31일 없는 달 건너뛴다"가 정확히 무슨 의미야?
예시를 들어서 명세를 다시 작성해줘.
```

---

## 🎯 성공 기준

각 기능 완료 시:

- ✅ 3개의 커밋 (RED, GREEN, REFACTOR)
- ✅ 모든 테스트 통과
- ✅ 린트 에러 없음
- ✅ 실제 동작 확인
- ✅ 코드 리뷰 완료

---

## 🚀 지금 시작하기

```
@orchestrator

안녕! 반복 일정 기능을 개발하고 싶어.

첫 번째 작업:
RepeatInfo 타입에 id?: string 필드를 추가하는 작업을
TDD 방식으로 진행해줘.

전체 사이클을 관리하고 각 단계마다 승인을 요청해줘.
```

**Good luck! 🎉**
