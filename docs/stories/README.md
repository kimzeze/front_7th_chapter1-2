# Stories 문서

이 디렉토리에는 사용자 스토리(User Stories) 문서가 저장됩니다.

## 📝 작성 시점

프로젝트 시작 시 **Orchestrator**가 자동으로 생성합니다 (Phase 0-2: Stories 작성).

## 📋 파일명 규칙

```
docs/stories/story-XX-제목.md
```

**예시**:

- `story-01-select-repeat-type.md`
- `story-02-display-repeat-icon.md`
- `story-03-set-repeat-end.md`

## 📖 구조

각 Story 문서는 다음 구조를 따릅니다 (`docs/templates/story-template.md` 참고):

1. **사용자 스토리**: As a..., I want..., So that...
2. **인수 기준**: 완료 조건 체크리스트
3. **시나리오**: 구체적인 사용 예시
4. **관련 Specs**: 연결될 기술 작업 (예상)

## 🔗 문서 관계

```
Epic (1개) - 전체 비즈니스 목표
  ↓
Stories (5-7개) - 사용자 관점 기능
  ↓
Specs (10-15개) - 기술 작업 상세
```

## 📊 Story 목록

작업 진행 시 자동으로 추가됩니다.

- [ ] Story 01: 반복 유형 선택
- [ ] Story 02: 반복 일정 표시
- [ ] Story 03: 반복 종료 설정
- [ ] Story 04: 반복 일정 수정
- [ ] Story 05: 반복 일정 삭제

## 💡 참고

- Epic: `docs/epics/` 폴더
- Specs: `docs/specs/` 폴더
- TODO: 프로젝트 루트 `TODO.md`
