# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

!ALWAYS RESPONSE IN KOREAN!
!NEVER USE TYPE ANY!

## 프로젝트 개요

Caramell은 AI 기반 웹사이트 생성 플랫폼입니다. 사용자가 프롬프트를 입력하면 Claude API가 단일 HTML 파일로 완전한 랜딩 페이지를 생성하고, 채팅을 통해 실시간으로 수정할 수 있습니다.

**기술 스택:**
- Next.js 16.0.3 (App Router)
- TypeScript 5
- Tailwind CSS 4
- Clerk (사용자 인증)
- Prisma 6.19 + PostgreSQL
- Anthropic Claude API (@anthropic-ai/sdk)
- Monaco Editor (코드 편집기)
- GSAP + Framer Motion (애니메이션)

## 아키텍처

### 1. 데이터베이스 구조 (Prisma)

**User** - Clerk를 통해 인증된 사용자
- `clerkId`: Clerk 사용자 ID (unique)
- `email`, `firstName`, `lastName`, `imageUrl`
- `projects`: 사용자가 생성한 프로젝트들

**Project** - AI로 생성된 웹사이트 프로젝트
- `userId`: 프로젝트 소유자
- `prompt`: 초기 생성 프롬프트
- `name`: 프로젝트 이름 (optional)
- `files`: 생성된 파일들 (JSON, 주로 index.html)
- `status`: 프로젝트 상태 (generating, completed, etc.)
- `screenshot`: 프로젝트 스크린샷 경로
- `chatMessages`: 프로젝트 수정을 위한 채팅 메시지들

**ChatMessage** - 프로젝트별 채팅 히스토리
- `projectId`: 연결된 프로젝트
- `role`: 메시지 역할 (user, assistant)
- `content`: 메시지 내용
- `filesChanged`: 수정된 파일들 (JSON)

**중요:** Prisma 클라이언트는 `lib/generated/prisma`에 생성됩니다. 스키마 변경 후 반드시 `npx prisma generate`를 실행하세요.

### 2. AI 생성 시스템

**핵심 파일:**
- `lib/aiGenerator.ts`: 초기 웹사이트 생성 (스트리밍)
- `lib/aiChat.ts`: 채팅 기반 코드 수정

**생성 플로우:**
1. 사용자가 프롬프트 입력 → `POST /api/projects/create`
2. Project 생성 (status: "generating")
3. `POST /api/projects/[id]/generate` → `generateLandingPageStream()`
   - 스트리밍 방식으로 JSON 응답 생성
   - 단일 `index.html` 파일 (Tailwind CSS + GSAP via CDN)
4. 완성된 파일을 Project.files에 JSON으로 저장
5. `POST /api/projects/[id]/screenshot` → html2canvas로 스크린샷 생성

**채팅 수정 플로우:**
1. 사용자가 수정 요청 → `POST /api/projects/[id]/chat`
2. `chatWithAI()`에 현재 파일과 채팅 히스토리 전달
3. Claude가 JSON 응답: `{ response, fileChanges? }`
4. fileChanges가 있으면 Project.files 업데이트
5. ChatMessage로 대화 기록 저장

**중요 제약사항:**
- 생성된 HTML은 항상 **단일 파일** (index.html)
- 모든 CSS/JS는 인라인 또는 CDN
- 외부 이미지만 사용 (Unsplash, Pexels)
- JavaScript는 반드시 `DOMContentLoaded` 래핑
- GSAP 숫자 애니메이션 시 `isFinite()` 검증 필수

### 3. 주요 페이지 구조

**`/` (app/page.tsx)**
- `Navbar`: 상단 네비게이션
- `HeroSection`: 메인 히어로 섹션
  - `PromptInput`: AI 웹사이트 생성 입력
  - `RecentProject`: 최근 프로젝트 목록

**`/project/[id]` (app/project/[id]/page.tsx)**
- `ProjectWorkspace`: 프로젝트 작업 공간
  - `ProjectNav`: 상단 네비게이션 (프로젝트 이름 편집)
  - `ProjectScreen`: iframe으로 HTML 미리보기
  - `ProjectCode`: Monaco Editor (코드 편집)
  - `ProjectChat`: AI와 대화하며 프로젝트 수정

**`/signin`, `/signup`**
- Clerk 인증 페이지 (커스텀 스타일링)

### 4. API 라우트

```
POST /api/projects/create              # 새 프로젝트 생성
POST /api/projects/[id]/generate       # AI로 코드 생성 (스트리밍)
POST /api/projects/[id]/chat           # 채팅 기반 수정
POST /api/projects/[id]/update         # 프로젝트 메타데이터 업데이트
POST /api/projects/[id]/screenshot     # 스크린샷 생성
GET  /api/projects/recent              # 최근 프로젝트 목록
POST /api/webhooks/clerk               # Clerk 웹훅 (사용자 동기화)
```

### 5. 컴포넌트 구조

```
components/
├── main/                  # 메인 페이지 컴포넌트
│   ├── PromptInput.tsx   # AI 생성 프롬프트 입력
│   └── recentProject.tsx # 최근 프로젝트 카드
├── project/              # 프로젝트 페이지 컴포넌트
│   ├── ProjectWorkspace.tsx  # 프로젝트 작업 영역 (레이아웃)
│   ├── ProjectNav.tsx        # 상단 네비게이션
│   ├── ProjectScreen.tsx     # HTML 미리보기 iframe
│   ├── ProjectCode.tsx       # Monaco 코드 에디터
│   └── ProjectChat.tsx       # AI 채팅 인터페이스
├── sections/             # 공통 섹션
│   ├── navbar.tsx        # 메인 네비게이션
│   └── heroSection.tsx   # 히어로 섹션
└── ui/                   # UI 유틸리티
    └── morphing-square.tsx  # 애니메이션 효과
```

## 중요한 개발 패턴

### Prisma 클라이언트 임포트
```typescript
import { prisma } from "@/lib/db";
```

### Clerk 인증 확인 (Server Component)
```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) redirect("/signin");

const user = await prisma.user.findUnique({
  where: { clerkId: userId }
});
```

### AI 스트리밍 응답 처리
```typescript
import { generateLandingPageStream } from "@/lib/aiGenerator";

const stream = generateLandingPageStream(prompt);
for await (const chunk of stream) {
  // 청크 전송
}
const result = await stream.return(undefined);
```

### JSON 파일 저장/로드
```typescript
// 저장
await prisma.project.update({
  where: { id },
  data: { files: files }  // JSON 타입
});

// 로드
const files = project.files as FileSystem;
```

## 환경 변수 (.env.local)

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."
```

## 주의사항

1. **타입 안정성**: `any` 타입 절대 사용 금지
2. **Prisma 생성**: 스키마 변경 후 반드시 `npx prisma generate` 실행
3. **AI 응답 검증**: JSON 파싱 전 `cleanJsonResponse()` 사용
4. **HTML 생성 규칙**:
   - 단일 파일만 생성
5. **스크린샷**: `public/screenshots/` 디렉토리에 저장
6. **응답 언어**: 모든 개별 한국어로, 코드 내부는 모두 영어로
