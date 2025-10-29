# 기능 명세 문서

이 디렉토리에는 각 작업(Task)에 대한 기술 명세가 저장됩니다.

## 📝 작성 시점

각 작업 시작 시 **Orchestrator**가 자동으로 생성합니다 (Phase 1: 명세 작성).

## 📋 파일명 규칙

```
docs/specs/XXX-작업명.md
```

**예시**:
- `001-repeatinfo-id-field.md`
- `003-generate-recurring-events.md`
- `008-save-recurring-events-api.md`

## 📖 구조

각 명세 문서는 다음 구조를 따릅니다 (`docs/templates/spec-template.md` 참고):

1. **개요**: 작업 설명 및 목적
2. **요구사항**: 기능/비기능 요구사항
3. **영향 범위**: 수정/생성할 파일 목록
4. **데이터 구조**: 타입 정의 (있는 경우)
5. **API 명세**: 엔드포인트 정의 (있는 경우)
6. **엣지 케이스**: 특수 상황 처리
7. **테스트 시나리오**: 검증할 시나리오

## 🔗 문서 관계

```
Epic (1개) - 전체 비즈니스 목표
  ↓
Stories (5-7개) - 사용자 관점 기능
  ↓
Specs (10-15개) - 기술 작업 상세
```

## 📊 명세 목록

작업 진행 시 자동으로 추가됩니다.

- [ ] 001: RepeatInfo 타입 id 필드 추가
- [ ] 002: Event 타입 parentRepeatId 필드 추가
- [ ] 003: 반복 일정 생성 로직 구현
- [ ] ...

## 💡 참고

- Epic: `docs/epics/` 폴더
- Stories: `docs/stories/` 폴더
- TODO: 프로젝트 루트 `TODO.md`
