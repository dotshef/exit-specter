# exit-project Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-23

## Active Technologies
- TypeScript 5.x + Next.js 16.1.4 + React 19, Tailwind CSS v4, next/image, next/navigation (003-sidebar-ui-redesign)
- N/A (UI 전용 변경) (003-sidebar-ui-redesign)

- TypeScript 5.x + Next.js 16.1.4, React 19, Tailwind CSS v4, Prisma ORM, bcryptjs, jose (002-exit-admin-dashboard)

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── login/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── accounts/page.tsx
│   │   ├── ads/page.tsx
│   │   └── profile/page.tsx
│   └── api/
│       ├── auth/login/route.ts
│       ├── auth/logout/route.ts
│       ├── me/route.ts
│       ├── accounts/route.ts
│       ├── accounts/[id]/route.ts
│       ├── ads/route.ts
│       ├── ads/[id]/route.ts
│       └── organizations/route.ts
├── components/
│   ├── layout/
│   ├── ui/
│   ├── accounts/
│   └── ads/
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── permissions.ts
├── types/
│   └── index.ts
└── hooks/
    └── useToast.ts

prisma/
├── schema.prisma
└── seed.ts
```

## Commands

npm test; npm run lint

## Code Style

TypeScript: Follow standard conventions

## Recent Changes
- 003-sidebar-ui-redesign: Added TypeScript 5.x + Next.js 16.1.4 + React 19, Tailwind CSS v4, next/image, next/navigation

- 002-exit-admin-dashboard: Added TypeScript 5.x + Next.js 16.1.4, React 19, Tailwind CSS v4, Prisma ORM, bcryptjs, jose

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
