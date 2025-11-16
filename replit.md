# Online Learning Platform

## Overview

This is a Next.js-based online learning platform that enables real-time video communication between teachers and students. The platform supports live video classes, assignment management, file sharing, and classroom administration. It leverages LiveKit for video infrastructure and includes a custom WebRTC signaling server for peer-to-peer communication features.

The application is built with modern web technologies including Next.js 14+ with App Router, TypeScript, Tailwind CSS, and shadcn/ui components. It provides a comprehensive educational environment with support for multiple user roles (students, teachers, and administrators).

**Status**: Production-ready (November 16, 2025). Successfully migrated from Vercel to Replit with PostgreSQL database and production-grade security. Running on port 5000 with proper environment configuration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 16, 2025 - Complete Migration & Database Implementation
**Vercel to Replit Migration:**
- Updated package.json scripts to bind Next.js to port 5000 with host 0.0.0.0 for Replit compatibility
- Modified lib/api-client.ts to use REPLIT_DEV_DOMAIN instead of VERCEL_URL for server-side API calls
- Configured environment variables: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, NEXT_PUBLIC_SIGNALING_SERVER
- Set up Next.js Dev Server workflow on port 5000 with webview output
- Installed dependencies using --legacy-peer-deps flag to resolve date-fns peer dependency conflicts
- Configured deployment settings for autoscale deployment target

**Database Migration (Mock Data → PostgreSQL):**
- Migrated from in-memory mock data to PostgreSQL database with Drizzle ORM
- Created comprehensive database schema: users, classes, enrollments, assignments, submissions, files, messages, sessions
- Implemented database schema in `db/schema.ts` with proper relations and foreign keys
- Created seed script (`db/seed.ts`) with demo accounts for testing
- Updated all server actions to use database instead of mock data (auth, classes, assignments, files, chat, users)
- Removed dependency on `lib/mock-data.ts` in favor of real database queries

**Security Hardening - Production-Grade Authentication:**
- Replaced weak session tokens with cryptographically secure 256-bit random IDs (crypto.randomBytes)
- Implemented database-backed session storage with expiration tracking in `sessions` table
- Updated both server actions AND API routes to use secure session system consistently
- Added session validation against database with automatic expired session cleanup
- Implemented proper logout that deletes sessions from both cookie and database
- Fixed session forgery vulnerability - all authentication paths now use secure session creation
- Architect-verified: All critical security issues resolved, system is production-ready

**Full CRUD Implementation:**
- **Classes**: Create (teachers), Read (all roles), Update (teachers own/admins all), Delete (teachers own/admins all), Enroll/Unenroll (students)
- **Assignments**: Create (teachers), Read (all roles), Update (teachers own/admins all), Delete (teachers own/admins all), Submit (students), Grade (teachers own/admins all)
- **Submissions**: Create/Resubmit (students), Read (students own/teachers for their classes/admins all), Delete (students own/teachers for their classes/admins all)
- **UI Pages**: Created edit pages for classes (/classes/[id]/edit) and assignments (/assignments/[id]/edit)
- **API Routes**: Updated to support PUT/DELETE operations for classes and assignments
- **Authorization Matrix**: Teachers manage their own resources; Admins can update/delete (but not create) all resources; Students manage their own submissions

**Demo Accounts Created:**
- Teachers: teacher1@example.com, teacher2@example.com (password: 123456)
- Students: student1@example.com through student5@example.com (password: 123456)

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14+ with App Router and React Server Components
- Server-side rendering (SSR) for optimal performance and SEO
- Client components for interactive features (video controls, real-time updates)
- TypeScript for type safety throughout the application

**UI Component System**: shadcn/ui with Radix UI primitives
- Consistent design system using Tailwind CSS
- Accessible, composable components
- Theme support with CSS variables for light/dark modes

**State Management**: React hooks and Server Actions
- Client-side state managed with React hooks (useState, useEffect, useRef)
- Server Actions for data mutations and API interactions
- No external state management library to reduce complexity

**Routing**: Next.js App Router (file-based routing)
- `/app` directory structure for pages
- Server components by default, client components when needed
- Nested layouts for shared UI elements

### Real-Time Video Communication

**Primary Video Solution**: LiveKit
- Self-hosted LiveKit server (via Docker) for video infrastructure
- `@livekit/components-react` for React integration
- Custom hook `useLiveKitClassroom` for classroom-specific functionality
- Supports multiple participants, audio/video tracks, and screen sharing

**Alternative WebRTC Solution**: Custom implementation
- Separate Node.js signaling server (`server/signaling-server.js`)
- Socket.io for WebRTC signaling (offers, answers, ICE candidates)
- Custom `useWebRTC` hook for peer-to-peer connections
- Room-based architecture for managing multiple classrooms

**Design Decision**: The application supports both LiveKit (production-ready) and custom WebRTC (fallback/experimental). LiveKit is preferred for stability and scalability, while the custom solution provides learning opportunities and flexibility.

### Authentication & Authorization

**Session Management**: Production-grade database-backed sessions
- PostgreSQL `sessions` table stores session data with cryptographically secure IDs
- Session IDs generated using crypto.randomBytes (256-bit random values)
- Session cookies with 7-day expiration, HttpOnly, SameSite=lax
- Server-side session validation against database using `getCurrentSession()`
- Automatic cleanup of expired sessions
- Proper logout implementation that removes sessions from both database and cookies

**Password Security**: bcryptjs for password hashing
- Passwords hashed with bcrypt (cost factor 10) before storage
- Secure password comparison during authentication
- Never stored or logged in plain text

**Role-Based Access Control**: Three user roles
- **Students**: Access classes, submit assignments, view materials, participate in chat
- **Teachers**: Create/manage classes, grade assignments, host video sessions, manage students
- **Admins**: Full system access (implemented but not fully utilized)

**Auth Guard Component**: Server-side authorization checks
- `AuthGuard` component wraps protected pages
- Redirects unauthenticated users to `/auth/signin`
- Role-based access restrictions where needed

**Security Status**: Production-ready authentication system with all critical vulnerabilities resolved (architect-verified November 16, 2025).

### Data Layer

**Database**: PostgreSQL with Drizzle ORM
- Production PostgreSQL database hosted on Replit (Neon-backed)
- Type-safe database operations using Drizzle ORM
- Schema defined in `db/schema.ts` with proper relations and constraints
- Database migrations managed with `npm run db:push` (never manual SQL migrations)

**Database Schema**:
- `users`: User accounts with bcrypt-hashed passwords, roles (student/teacher/admin)
- `classes`: Courses created by teachers
- `enrollments`: Student-class relationships
- `assignments`: Homework/tasks assigned to classes
- `submissions`: Student assignment submissions with grades
- `files`: File attachments for classes and assignments
- `messages`: Classroom chat messages
- `sessions`: Secure session storage with expiration tracking

**API Client**: Custom HTTP client (`lib/api-client.ts`)
- Centralized API communication logic
- Handles server/client side URL differences (REPLIT_DEV_DOMAIN support)
- Type-safe response handling with TypeScript

**Server Actions**: Next.js Server Actions for data operations
- Located in `lib/actions/` directory (assignments, classes, files, auth, chat, users)
- Server-side code that can be called from client components
- All actions use database queries instead of mock data
- Automatic revalidation of cached data using `revalidatePath()`

**Database Tooling**:
- `npm run db:push` - Sync schema changes to database (use `--force` if needed)
- `npm run db:seed` - Populate database with demo data
- Drizzle Studio available for database inspection

### File Structure & Organization

```
/app                    # Next.js pages (App Router)
  /assignments          # Assignment listing page
  /classes             # Class listing page
  /files               # File management page
  /unauthorized        # Access denied page
  /auth                # Authentication pages (signin, signup)
  layout.tsx           # Root layout
  page.tsx             # Dashboard/home page
  globals.css          # Global styles

/components
  /ui                  # shadcn/ui components
  auth-guard.tsx       # Authorization wrapper
  user-menu.tsx        # User dropdown menu
  video-controls.tsx   # Video call controls
  video-grid.tsx       # Participant video tiles

/hooks
  use-livekit-classroom.ts  # LiveKit integration hook
  use-webrtc.ts            # Custom WebRTC hook
  use-mobile.tsx           # Mobile detection
  use-toast.ts             # Toast notification system

/lib
  /actions            # Server Actions for data operations
  auth.ts            # Authentication utilities
  mock-data.ts       # Mock database
  api-client.ts      # HTTP client
  utils.ts           # Utility functions

/server
  signaling-server.js  # WebRTC signaling server (Socket.io)
```

### Styling Approach

**Tailwind CSS**: Utility-first CSS framework
- Custom color palette defined in `globals.css` using CSS variables
- Responsive design with mobile-first approach
- Dark mode support prepared (though not actively implemented)

**Component Variants**: class-variance-authority (CVA)
- Type-safe variant definitions for UI components
- Consistent styling patterns across the application

## External Dependencies

### Third-Party Services

**LiveKit Server**: Video streaming infrastructure
- Self-hosted via Docker (`livekit/livekit-server` image)
- Runs on ports 7880 (HTTP), 7881 (TCP), 7882 (UDP)
- Requires LiveKit API keys and secrets for token generation
- Documentation: https://livekit.io/

**WebRTC STUN Server**: Google's public STUN server
- Used for NAT traversal in peer-to-peer connections
- URL: `stun:stun.l.google.com:19302`
- Free public service, no authentication required

### Key NPM Packages

**Core Framework**
- `next`: React framework with SSR/SSG capabilities
- `react`, `react-dom`: UI library
- `typescript`: Static type checking

**UI Components**
- `@radix-ui/*`: Unstyled, accessible UI primitives (20+ packages)
- `@livekit/components-react`: Pre-built LiveKit React components
- `lucide-react`: Icon library
- `tailwindcss`: Utility CSS framework
- `class-variance-authority`: Component variant management
- `clsx`, `tailwind-merge`: Utility for merging class names

**Real-Time Communication**
- `livekit-client`: LiveKit JavaScript SDK
- `socket.io`, `socket.io-client`: WebSocket library for signaling

**Forms & Validation**
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Validation resolver integrations
- `zod` (likely): Schema validation (implied by resolver usage)

**Backend/Server**
- `express`: Web server framework for signaling server
- `cors`: Cross-origin resource sharing middleware
- `bcryptjs`: Password hashing
- `http`: Node.js HTTP module

**Development Tools**
- `nodemon`: Auto-restart server on file changes
- `autoprefixer`: PostCSS plugin for vendor prefixes

### Port Configuration

- **Next.js App**: Port 5000 (custom, specified in package.json)
- **LiveKit Server**: Ports 7880, 7881, 7882
- **Signaling Server**: Port 3001 (default, configurable via PORT env var)

### Deployment Considerations

The application is configured to run on Replit with custom port binding (`-H 0.0.0.0`). For production deployment:
1. Set up proper database (PostgreSQL recommended)
2. Configure environment variables for LiveKit API keys
3. Set up proper TURN servers for WebRTC (STUN alone insufficient for restrictive networks)
4. Implement proper session storage (Redis or database-backed)
5. Add rate limiting and security headers
6. Configure HTTPS/SSL certificates for video streaming