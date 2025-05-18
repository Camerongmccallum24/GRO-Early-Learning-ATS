
# GRO Early Learning Applicant Tracking System
## Developer & Designer Guide

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Design System](#design-system)
6. [Development Setup](#development-setup)
7. [Architecture](#architecture)

## Overview
The GRO Early Learning ATS is a comprehensive recruitment platform designed for childcare centers. It manages the entire hiring process from job postings to candidate onboarding.

## Technology Stack
- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Authentication**: Replit Auth
- **AI Integration**: OpenAI for resume parsing and analysis
- **Email**: SendGrid/Nodemailer
- **Calendar**: Google Calendar API

## Project Structure

### Key Directories
```
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Page components
├── server/
│   ├── api/              # API route handlers
│   ├── utils/            # Server utilities
│   └── services/         # External service integrations
└── shared/
    └── schema.ts         # Database schema and types
```

### Component Organization
- **UI Components**: `client/src/components/ui/`
  - Reusable UI components following shadcn/ui patterns
- **Feature Components**: `client/src/components/`
  - Dashboard components
  - Communication components
  - Application handling
  - Interview scheduling

## Core Features

### 1. Job Management
- Create and edit job postings
- Template system for common positions
- SEO-friendly job URLs
- Location and department tracking

### 2. Application Processing
- Custom application forms
- Resume parsing with AI
- Application status tracking
- Bulk actions support

### 3. Candidate Management
- Centralized candidate database
- Communication history
- Document storage
- GDPR compliance features

### 4. Interview Management
- Interview scheduling
- Google Calendar integration
- Video interview support
- Feedback collection

### 5. Communication Tools
- Email templates
- SMS integration
- Call logging
- Automated notifications

### 6. AI Features
- Resume parsing and analysis
- Candidate matching
- Communication sentiment analysis
- Interview question suggestions

## Design System

### Colors
Based on Tailwind CSS with custom theme:
```typescript
colors: {
  primary: "hsl(var(--primary))"
  secondary: "hsl(var(--secondary))"
  accent: "hsl(var(--accent))"
  background: "hsl(var(--background))"
  // See tailwind.config.ts for full color system
}
```

### Typography
- Font: System fonts with fallbacks
- Scale: Following Tailwind's default type scale
- Components use consistent text sizes:
  - Headers: text-2xl to text-4xl
  - Body: text-base
  - Small text: text-sm

### Components
Standardized components from shadcn/ui:
- Buttons
- Forms
- Cards
- Dialogs
- Tables
- Navigation elements

### Layout
- Responsive grid system
- Sidebar navigation
- Card-based content layout
- Consistent spacing using Tailwind's spacing scale

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- NPM/Yarn

### Environment Setup
1. Fork the project on Replit
2. System automatically sets up the database
3. Development server runs on port 5000

### Key Commands
```bash
# Development
npm run dev

# Build
npm run build

# Database Schema Updates
npm run db:push
```

## Architecture

### Frontend Architecture
- React components using TypeScript
- TanStack Query for server state
- Form handling with react-hook-form
- Zod for validation
- Modular component structure

### Backend Architecture
- Express.js REST API
- PostgreSQL with Drizzle ORM
- Service-based architecture
- Middleware for auth and logging

### Database Schema
Key tables:
- users
- candidates
- job_postings
- applications
- interviews
- communication_logs

### API Structure
RESTful endpoints organized by feature:
- /api/auth
- /api/jobs
- /api/candidates
- /api/applications
- /api/interviews
- /api/communications

### State Management
- Server state: TanStack Query
- Form state: react-hook-form
- UI state: React useState/useContext
- Persistent state: Local storage

## Security Considerations
- GDPR compliance built-in
- Data encryption for sensitive information
- Role-based access control
- Audit logging

## Performance Optimization
- Code splitting by route
- Image optimization
- Caching strategies
- Pagination for large datasets

## Testing Strategy
- Component testing with React Testing Library
- API testing with Jest
- End-to-end testing support
- Accessibility testing

