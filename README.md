# TOONPICK Frontend

TOONPICK은 웹툰 추천, 리뷰, 컬렉션, 통계, 게임화 등 다양한 기능을 제공하는 웹툰 추천 서비스의 프론트엔드입니다. 본 프로젝트는 **TypeScript 기반 React SPA**로, 확장성과 유지보수성을 고려한 구조와 모던 프론트엔드 개발 패턴을 적용했습니다.

---

## 주요 기술

- **React 18** + **TypeScript**
- **React Router v6** (SPA 라우팅)
- **Context API** (인증/모달 등 전역 상태)
- **Axios** (API 통신, 인터셉터 기반 토큰 관리)
- **Styled Components & CSS Modules** (컴포넌트 단위 스타일 격리)
- **Recharts, React Chart.js 2** (데이터 시각화)
- **CRACO** (CRA 설정 오버라이드)

---

## 핵심 구조 및 설계

- **서비스 레이어**: API 통신/비즈니스 로직 분리 (`src/services/`)
- **Context 기반 전역 상태**: 인증, 모달 등 (`src/contexts/`)
- **컴포넌트 아키텍처**: 재사용성 높은 UI 컴포넌트 분리 (`src/components/`)
- **절대경로 import**: `@components/`, `@services/` 등 별칭 사용
- **테마/다크모드 지원**: CSS 변수 기반 글로벌 테마
- **테스트**: React Testing Library, Jest 기반 단위 테스트

---

## 주요 기능

- JWT 기반 인증/회원/소셜 로그인, 자동 토큰 갱신
- 웹툰 목록/상세/검색/필터/정렬/플랫폼별 분류
- 별점 평가, 리뷰 CRUD, 좋아요/신고
- 컬렉션, 북마크, 읽기 기록, 명작 웹툰
- 개인화 추천, 유사 웹툰 추천, 활동 통계
- 레벨/업적 시스템, 튜토리얼

---

## 폴더 구조 (요약)

```
src/
  api/         # API 클라이언트
  components/  # UI 컴포넌트
  contexts/    # 전역 상태
  models/      # 데이터 모델
  pages/       # 라우트 단위 페이지
  services/    # 비즈니스 로직
  styles/      # 전역/테마 스타일
  utils/       # 유틸리티
  App.tsx      # 메인 앱
  index.tsx    # 앱 진입점
```

---

## 개발 및 실행

```bash
npm install      # 의존성 설치
npm start        # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm test         # 테스트
```

---

## 협업/코드리뷰 시 중점 사항

- **비즈니스 로직과 UI/상태 분리**: 서비스 레이어, Context, 컴포넌트 역할 명확히 구분
- **타입 안정성**: 모든 API/상태/컴포넌트에 TypeScript 타입 적용
- **컴포넌트 재사용성**: UI 컴포넌트는 props 기반, 스타일 격리 필수
- **API 통신**: Axios 인스턴스/인터셉터 활용, 에러/토큰 처리 일원화
- **상태 관리**: Context 최소화, 필요시 props/lifting/state colocation 우선
- **테마/스타일**: 글로벌 변수, 다크모드 대응, CSS-in-JS와 CSS Modules 혼용
- **테스트**: 핵심 로직/컴포넌트 단위 테스트 작성 권장

---

## 라이선스

MIT License
