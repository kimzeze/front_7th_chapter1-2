# Epic 문서

이 디렉토리에는 프로젝트 Epic 문서가 저장됩니다.

## 📝 작성 시점

프로젝트 시작 시 **Orchestrator**가 자동으로 생성합니다 (Phase 0-1: Epic 작성).

## 📋 파일명 규칙

```
docs/epics/[프로젝트명].md
```

**예시**:
- `recurring-events.md`
- `notification-system.md`

## 📖 구조

각 Epic 문서는 다음 구조를 따릅니다 (`docs/templates/epic-template.md` 참고):

1. **개요**: 프로젝트 설명 및 배경
2. **비즈니스 목표**: 왜 이 기능이 필요한가?
3. **범위**: 포함/제외 사항
4. **제약사항**: 기술적/비즈니스적 제약
5. **성공 지표**: 어떻게 성공을 측정할 것인가?
6. **관련 Stories**: 연결될 Stories 목록

## 🔗 문서 관계

```
Epic (Why?) - "왜 이 프로젝트를 하는가?"
  ↓
Stories (What?) - "사용자에게 무엇을 제공하는가?"
  ↓
Specs (How?) - "어떻게 기술적으로 구현하는가?"
```

## 📊 Epic 목록

- [ ] recurring-events.md (반복 일정 관리 시스템)

## 💡 참고

- Stories: `docs/stories/` 폴더
- Specs: `docs/specs/` 폴더
- TODO: 프로젝트 루트 `TODO.md`

