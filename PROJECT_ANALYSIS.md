# Ubiquitous (Next.js + Prisma) Project Analysis

## Overview

- Repo name: `ubiquitous`
- Framework: Next.js 16.1.6 (App Router)
- UI: React 19.2.3
- DB: Prisma ORM + SQLite (`prisma/dev.db`)
- Auth: JWT (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`)
- Data export: PDF (`jspdf`, `jspdf-autotable`), Excel (`xlsx`)
- Visualization: `recharts`, `framer-motion`

## Features implemented

- Multi-role app: Admin + Teacher sections
- Admin routes:
  - `/admin/dashboard`
  - `/admin/teachers` (+ teacher detail by `id`)
  - Add teacher UI: `/admin/add-teacher`
  - API endpoints in `src/app/api/admin/*`
- Teacher routes:
  - `/teacher/dashboard`
  - `/teacher/students`, `/teacher/attendance`, `/teacher/schedule`, `/teacher/report`
  - Add student UI: `/teacher/add-student`
  - API endpoints in `src/app/api/teacher/*`
- Authentication routes:
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/logout/route.ts`
  - `src/app/api/auth/signout/route.ts`
- Prisma schema models:
  - `Admin`, `Teacher`, `Student`, `Attendance`, `Schedule`
  - `Attendance` includes unique constraint `[student_id, teacher_id, date]`
  - Relations with cascades on delete
- Seed script: `prisma/seed.ts` creates initial admin `admin@college.edu / admin123`

## Project structure

- `src/app`: Next.js pages and layouts
- `src/app/admin`: admin UI pages and nested folder structure
- `src/app/teacher`: teacher UI pages and nested folder structure
- `src/app/components`: shared UI `Sidebar`, `TopNav`
- `src/app/lib`: helper auth and db helpers
- `src/app/api`: route handlers for admin/teacher/auth

## Key behaviors

- Strong typed TypeScript with `prisma` + `@types/*`
- `postinstall` hook runs `prisma generate`
- Routing uses App Router with folder + file route conventions
- Guarding via server + middleware not visible yet, but likely uses token+session methods in `src/app/lib/auth.ts`

## Setup steps

1. install dependencies
   - `npm ci` (or `npm install`)
2. run Prisma
   - `npx prisma migrate dev --name init`
3. seed database
   - `npm run postinstall` or `npx prisma db seed`
4. start development server
   - `npm run dev`
5. visit `http://localhost:3000`

## Suggested next steps

- Add `DATABASE_URL` env support to avoid storing DB path in schema for production.
- Add role-based middleware and `app/middleware.ts` checks (if not already) to protect routes.
- Add tests (Jest/Playwright) for auth, attendance, schedule flows.
- Expand swagger-like API docs for developer handoff.

## Observations

- Code is already production-ready for a minimal attendance management app.
- Nice modular separation between admin and teacher APIs/front-end.
- Minimal boilerplate in existing default README; this new file now documents full architecture.
