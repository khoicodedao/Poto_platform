# Online Learning Platform

## Overview

This is a Next.js-based online learning platform that enables real-time video communication between teachers and students. The platform supports live video classes, assignment management, file sharing, and classroom administration. It leverages LiveKit for video infrastructure and includes a custom WebRTC signaling server for peer-to-peer communication features.

The application is built with modern web technologies including Next.js 14+ with App Router, TypeScript, Tailwind CSS, and shadcn/ui components. It provides a comprehensive educational environment with support for multiple user roles (students, teachers, and administrators).

**Status**: Successfully migrated from Vercel to Replit (November 16, 2025). The application is running on port 5000 with proper environment configuration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 16, 2025 - Vercel to Replit Migration
- Updated package.json scripts to bind Next.js to port 5000 with host 0.0.0.0 for Replit compatibility
- Modified lib/api-client.ts to use REPLIT_DEV_DOMAIN instead of VERCEL_URL for server-side API calls
- Configured environment variables: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, NEXT_PUBLIC_SIGNALING_SERVER
- Set up Next.js Dev Server workflow on port 5000 with webview output
- Installed dependencies using --legacy-peer-deps flag to resolve date-fns peer dependency conflicts
- Configured deployment settings for autoscale deployment target

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

**Session Management**: Cookie-based sessions
- In-memory session storage (suitable for development/small deployments)
- Session cookies with 7-day expiration
- Server-side session validation using `getCurrentSession()`

**Password Security**: bcryptjs for password hashing
- Passwords hashed before storage
- Secure password comparison during authentication

**Role-Based Access Control**: Three user roles
- **Students**: Access classes, submit assignments, view materials
- **Teachers**: Create/manage classes, grade assignments, host video sessions
- **Admins**: Full system access (implemented but not fully utilized)

**Auth Guard Component**: Server-side authorization checks
- `AuthGuard` component wraps protected pages
- Redirects unauthenticated users to `/auth/signin`
- Role-based access restrictions where needed

**Design Rationale**: Simple cookie-based auth chosen for ease of implementation. For production, should migrate to JWT tokens or a service like NextAuth.js for better security and scalability.

### Data Layer

**Mock Data Storage**: In-memory JavaScript objects
- `lib/mock-data.ts` defines data structures and mock records
- Simulates database tables for Users, Classes, Assignments, and Files
- Quick prototyping without database setup overhead

**API Client**: Custom HTTP client (`lib/api-client.ts`)
- Centralized API communication logic
- Handles server/client side URL differences
- Type-safe response handling with TypeScript

**Server Actions**: Next.js Server Actions for data operations
- Located in `lib/actions/` directory (assignments, classes, files, auth)
- Server-side code that can be called from client components
- Automatic revalidation of cached data using `revalidatePath()`

**Design Decision**: Mock data eliminates database dependency for initial development. Migration path to a real database (PostgreSQL with Drizzle ORM) is straightforward by replacing mock data sources with database queries in Server Actions.

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