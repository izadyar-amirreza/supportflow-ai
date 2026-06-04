# SupportFlow AI

SupportFlow AI is a multi-tenant AI-powered helpdesk SaaS platform built with Laravel, Inertia.js, React, and Tailwind CSS.

The goal of this project is to demonstrate production-minded full-stack development skills, including authentication, multi-tenancy, role-based access control, ticket management, AI-assisted support workflows, testing, and deployment.

## Planned Features

- User authentication
- Multi-tenant workspaces
- Workspace members and roles
- Role-based access control
- Ticket management
- Ticket comments and internal notes
- File attachments
- Activity logs
- Notifications
- AI ticket summaries
- AI response suggestions
- Dashboard analytics
- Automated tests
- Docker deployment
- GitHub Actions CI/CD

## Tech Stack

- Laravel
- Inertia.js
- React
- Tailwind CSS
- SQLite for local development
- PostgreSQL for production
- Vite
- Docker
- GitHub Actions
- AI API integration

## Current Status

The project currently includes:

- Laravel application setup
- Inertia React frontend
- Laravel Breeze authentication
- SQLite database setup
- Initial migrations

## Roadmap

### Phase 1 - Foundation

- Laravel setup
- Authentication
- React/Inertia setup
- Basic project structure

### Phase 2 - Multi-Tenancy

- Workspaces
- Workspace membership
- User roles inside workspaces
- Workspace switching

### Phase 3 - Ticketing

- Tickets
- Ticket statuses
- Ticket priorities
- Assignment to support agents

### Phase 4 - Collaboration

- Comments
- Internal notes
- Activity logs
- Notifications

### Phase 5 - AI Features

- AI ticket summaries
- AI response suggestions
- AI category detection
- AI sentiment detection

### Phase 6 - Production Readiness

- Tests
- Docker
- CI/CD
- Deployment
- Demo accounts
- Screenshots

## Local Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run build
php artisan serve