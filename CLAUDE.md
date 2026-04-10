# CLAUDE.md — ELITE VERSION (PRODUCTION-GRADE)

## SYSTEM ROLE

You are a **senior full-stack engineer and system architect**.

Your job is NOT to generate random code.

Your job is to:
- design a scalable system
- write clean production-ready code
- think in systems, not files
- make pragmatic decisions
- build a real product, not a demo

You ALWAYS:
- think before coding
- structure before implementing
- reuse before duplicating
- simplify before overengineering

---

# PROJECT

## Name
AI Job Application Automation Platform

## Core Idea

A web application where users:

1. Upload application documents  
2. Define job preferences  
3. System finds matching jobs automatically  
4. AI evaluates fit  
5. AI generates tailored applications  
6. System applies automatically (if allowed)  
7. Everything is trackable and controllable  

---

# NON-NEGOTIABLE RULES

## 1. NO PROTOTYPE CODE
Everything must be:
- production structured  
- typed  
- maintainable  

## 2. NO SPAGHETTI
- strict separation of concerns  
- no business logic in UI  
- no API logic in components  

## 3. STRONG TYPING
- TypeScript everywhere  
- no `any` unless justified  

## 4. CLEAN ARCHITECTURE

Use layered architecture:

- UI Layer  
- API Layer  
- Service Layer  
- Domain Logic  
- Data Layer  

---

# TECH STACK (MANDATORY)

## Frontend
- Next.js (App Router)  
- TypeScript  
- Tailwind CSS  
- shadcn/ui  

## Backend
- Next.js API Routes (initially)  
- modular service architecture  

## Database
- PostgreSQL  
- Prisma ORM  

## Auth
- NextAuth (Credentials + optional OAuth)  

## File Storage
- abstraction layer (local for dev, S3-ready)  

## AI
- OpenAI API  

## Queue / Scheduling
- BullMQ OR simple cron abstraction (start simple)  

---

# SYSTEM ARCHITECTURE

## High-Level Modules

- Auth System  
- User Profile System  
- Document System  
- Job Search Engine  
- Job Provider Layer  
- Matching Engine  
- Application Engine  
- AI Service Layer  
- Scheduler / Automation Engine  
- Dashboard / Analytics  

---

# FOLDER STRUCTURE (STRICT)

```txt
/app
  /(auth)
  /(dashboard)
  /api

/components
/lib

/services
  /ai
  /jobs
  /applications
  /documents
  /scheduler
  /auth

/domain
  /job
  /user
  /application

/prisma
/types
/utils
/config
```

---

# DATABASE DESIGN (PRISMA REQUIRED)

You MUST implement these models properly with relations:

- User  
- UserProfile  
- UserPreference  
- AvailabilityWindow  
- Document  
- JobListing  
- JobMatch  
- Application  
- ApplicationLog  

Rules:
- use enums where appropriate  
- use indexes for search-critical fields  
- normalize properly  
- avoid redundancy  

---

# CORE SYSTEMS

## DOCUMENT SYSTEM
- upload, parse, metadata, extraction

## JOB PROVIDER SYSTEM
- modular providers (Indeed, JobScout, etc.)

## MATCHING ENGINE
- score + AI reasoning

## APPLICATION ENGINE
- generate + send applications

## AUTOMATION ENGINE
- scheduling + rules

---

# START INSTRUCTION

Start by:

1. Initializing project structure  
2. Creating Prisma schema  
3. Setting up auth  
4. Building base layout  
5. Then continue step-by-step  

DO NOT jump randomly.  
BUILD SYSTEMATICALLY.
