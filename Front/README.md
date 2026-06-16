# BowChat Auction Frontend

React, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Axios 기반 프론트엔드입니다.

## 연결되는 백엔드

- user-service: `http://localhost:8081`
- product-service: `http://localhost:8082`
- auction-service: `http://localhost:8083`
- chat-service: `http://localhost:8084`
- WebSocket: `ws://localhost:8084/ws/chat/{roomId}?token={accessToken}`

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

백엔드 CORS 설정에 프론트 주소(`http://localhost:5173`)가 포함되어 있어야 합니다.
