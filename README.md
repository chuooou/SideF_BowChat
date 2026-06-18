# BowChat Auction Frontend

## 프로젝트 상태

BowChat Auction Frontend는 MSA 기반 경매/채팅 백엔드와 연동하는 프론트엔드 프로젝트입니다.
현재는 핵심 화면과 API 연동을 붙여가는 **구현 중인 프로젝트**이며, 로그인, 상품, 경매, 채팅 흐름을 순차적으로 검증하고 있습니다.

백엔드는 회원, 상품, 경매, 채팅 서비스가 분리된 구조이고, 프론트는 이 여러 서비스를 하나의 사용자 경험으로 묶는 역할을 합니다.

## 프론트에서 구현할 주요 기능

### 인증 기반 사용자 플로우

- 로그인/회원가입/로그아웃 UI
- 로그인 후 access token 저장
- 인증이 필요한 API 요청에 Bearer Token 자동 첨부
- 로그인 상태에 따라 상품 등록, 입찰, 채팅 기능 노출 제어
- 새로고침 후에도 로그인 상태를 유지하는 클라이언트 상태 관리

### 상품 및 경매 화면

- 상품 목록 조회 및 선택형 상세 패널
- 상품 이미지, 설명, 판매 방식, 판매자 정보 표시
- 로그인 사용자의 상품 등록 폼
- 상품 상세에서 경매 시작 기능 제공
- 경매 목록과 선택된 경매 상세를 나누어 표시
- 입찰 금액 입력 및 입찰 결과 반영
- 경매 종료 여부, 현재가, 시작가, 종료 시간 등 상태 기반 UI 구성

### WebSocket 기반 실시간 채팅

- 채팅방 목록 조회
- 상품 1:1 채팅방 입장
- 경매 채팅방 입장
- 그룹 채팅방 생성/입장
- 이전 메시지 조회
- WebSocket 연결을 통한 실시간 메시지 송수신
- access token을 WebSocket handshake query로 전달
- 채팅 메시지와 경매 입찰 이벤트를 같은 실시간 영역에서 보여줄 수 있는 구조로 확장 예정

### 서버 상태 관리와 UX

- TanStack Query를 이용한 서버 상태 캐싱
- 상품/경매/채팅방/메시지 단위 query key 분리
- mutation 성공 후 관련 query invalidate 처리
- 로딩, 에러, 빈 상태 UI 제공
- 백엔드 서비스별 요청 실패 시 사용자 안내 UX 개선 예정

## 이력서에 담을 수 있는 프론트 기술 포인트

- React + TypeScript 기반 SPA 구현
- Vite 기반 프론트 개발 환경 구성
- TanStack Query를 활용한 서버 상태 관리
- Zustand persist를 활용한 인증 상태 저장
- Axios instance와 interceptor를 활용한 API 클라이언트 구성
- MSA 백엔드와 연동하기 위한 서비스별 API client 분리
- Bearer Token 기반 인증 요청 자동화
- WebSocket 기반 실시간 채팅 UI 구현
- 채팅방, 메시지, 경매 입찰 등 실시간 도메인 상태를 프론트 상태와 동기화
- React Hook Form 기반 입력 폼 구성
- Tailwind CSS 기반 반응형 UI 구성
- 인증 상태에 따른 조건부 렌더링과 기능 접근 제어

## 로그인 구성 방식

로그인은 `user-service`의 인증 API와 연동합니다.

```text
사용자 이메일/비밀번호 입력
→ POST /auth/login
→ accessToken, refreshToken, userInfo 수신
→ Zustand store에 인증 정보 저장
→ 이후 API 요청마다 Authorization 헤더 자동 첨부
```

프론트에서는 `authStore`가 로그인 상태를 관리합니다.

- `accessToken`: API 인증에 사용하는 토큰
- `refreshToken`: 재발급 흐름에 사용할 토큰
- `user`: 현재 로그인 사용자 정보
- `setSession`: 로그인 성공 시 토큰과 사용자 정보 저장
- `setUser`: `/auth/me` 응답으로 사용자 정보 갱신
- `clearSession`: 로그아웃 또는 인증 실패 시 세션 초기화

API 요청은 Axios interceptor에서 처리합니다.

```text
요청 직전 authStore에서 accessToken 조회
→ 토큰이 있으면 Authorization: Bearer <token> 추가
→ user/product/auction/chat API 호출
```

로그인 성공 후에는 `/auth/me`를 호출해 현재 사용자 정보를 동기화합니다.
로그아웃 시에는 `/auth/logout` 요청 후 프론트의 인증 상태와 TanStack Query 캐시를 초기화합니다.

## 현재 진행 중인 부분

- 로그인 후 전체 기능 접근 흐름 검증
- 상품 등록과 경매 시작 조건 정리
- 경매 입찰 후 화면 갱신 방식 개선
- WebSocket 메시지 수신 후 채팅 UI 반영 고도화
- 경매 입찰 이벤트를 채팅/알림 UI에 표시
- OAuth 소셜 로그인 성공 처리 페이지 구성
- 백엔드 실행 환경과 프론트 개발 환경 연결 안정화

## 실행

```bash
cd Front
npm install
npm run dev
```

백엔드는 서비스별로 다음 포트를 사용합니다.

```text
user-service    8081
product-service 8082
auction-service 8083
chat-service    8084
```
