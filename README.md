# ⚡ SupportFlow AI — Next-Gen AI-Powered Customer Support Platform

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.1-F55036?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**SupportFlow AI** is a modern, enterprise-grade, multi-tenant customer support ticketing platform designed to supercharge support teams using Large Language Models (LLMs). By leveraging high-speed inference via **Groq Cloud (Llama 3.1 8B Instant)** and modular AI architectures, SupportFlow autonomously triages tickets, analyzes customer sentiment, generates instant conversation summaries, and drafts context-aware replies using company Knowledge Bases (RAG).

---

## 🌐 Live Demo & Credentials

Experience the fully deployed platform live without any local setup:

- **🚀 Live Application:** [https://supportflow-ai-vfqy.onrender.com](https://supportflow-ai-vfqy.onrender.com)
- **📧 Demo Email:** `demo@supportflow.ai`
- **🔑 Demo Password:** `demo123456`

*(Note: The live demo is hosted on a cloud environment with real-time AI inference enabled! Feel free to create a new ticket with an urgent tone to test the autonomous AI triage agent).*

---

## ✨ Key Features & Capabilities

### 🤖 1. Autonomous AI Triage & Sentiment Analysis
- **Real-Time Processing:** When a customer submits a ticket, the AI engine evaluates the description instantly.
- **Sentiment Detection:** Automatically classifies customer mood (`SATISFIED`, `NEUTRAL`, `URGENT`, `ANGRY`).
- **Smart Escalation:** Autonomously escalates ticket priority based on urgency and context (e.g., promoting critical system failures to **Urgent**).
- **Auto-Tagging:** Generates relevant lowercase tags (e.g., `#billing`, `#bug`, `#payment`, `#gateway`) for seamless categorization.

### 📝 2. Intelligent Conversation Summarization
- Eliminates the need for support agents to read lengthy, multi-reply email threads.
- Generates a concise, structured executive breakdown of the core issue, key customer demands, and recommended next steps in seconds.

### 💬 3. Context-Aware Suggested Replies (RAG Enabled)
- Acts as an AI co-pilot for support agents by crafting professional, empathetic, and solution-oriented draft responses.
- **Retrieval-Augmented Generation (RAG):** Dynamically injects internal **Knowledge Base** documents into the LLM system prompt to ensure accurate, policy-compliant answers without hallucinations.
- Features a 1-click **"Copy to comment box"** button for maximum agent productivity.

### 🏢 4. Multi-Tenant Workspace Architecture
- Complete data isolation across different teams, organizations, or companies.
- Role-Based Access Control (RBAC) supporting **Owners**, **Admins**, and **Agents**.
- Custom AI configuration per workspace (switch dynamically between Groq, OpenAI, or Gemini with custom API keys and model selection).

### 🕵️‍♂️ 5. Enterprise Activity Feed (Audit Log)
- A complete audit trail that records every lifecycle event of a ticket.
- Tracks priority changes, status updates, agent assignments, and background AI execution logs with timestamps.

### 📎 6. Internal Notes & Secure Attachments
- Allows agents to communicate privately on a ticket using highlighted **Internal Notes** that remain invisible to the end-user.
- Supports secure file attachments with instant preview and deletion capabilities.

---

## 🛠️ Tech Stack & Architecture

### **Backend Engineering**
- **Framework:** Laravel (PHP 8.3+)
- **Architecture Patterns:** Service Container, Dependency Injection, Repository/Service Layer, Strategy Pattern (for dynamic AI providers).
- **Asynchronous Processing:** Laravel Queues & Jobs (`sync` / background worker support for AI tasks).
- **Database:** PostgreSQL (Production on Render) & SQLite/MySQL (Local Dev) with Eloquent ORM.

### **Frontend & UI/UX**
- **Framework:** React 18 with Inertia.js (Modern SPA monolith experience without building a separate REST API).
- **Styling:** Tailwind CSS with a highly responsive, professional dark-mode UI.

### **AI & LLM Integration**
- **Primary Inference Engine:** Groq Cloud API (`llama-3.1-8b-instant`) for lightning-fast token generation (<300ms response times).
- **Fallback Providers:** Fully compatible with OpenAI (`gpt-4o-mini`) and Google Gemini (`gemini-1.5-flash`).
- **Prompt Engineering:** Strict system prompts enforcing JSON schema outputs for triage tasks and dynamic RAG contextual injection.

### **DevOps & Deployment**
- **Containerization:** Docker & Docker Compose for consistent local development environments.
- **Cloud Hosting:** Deployed seamlessly on Render Cloud Platform with automated CI/CD pipelines from GitHub.

---

## 🚀 Local Setup & Installation

Follow these steps to run **SupportFlow AI** on your local machine:

### Prerequisites
- PHP >= 8.3
- Composer
- Node.js & NPM
- MySQL, PostgreSQL, or SQLite

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/supportflow-ai.git](https://github.com/YOUR_GITHUB_USERNAME/supportflow-ai.git)
cd supportflow-ai
```

### 2. Install Dependencies
```bash
# Install backend dependencies
composer install

# Install frontend dependencies
npm install
```

### 3. Environment Configuration
Copy the example environment file and generate an application key:
```bash
cp .env.example .env
php artisan key:generate
```

Open `.env` and configure your database credentials and AI API keys:
```ini
DB_CONNECTION=sqlite
# Or configure MySQL/PostgreSQL

# AI Provider Setup (Groq is recommended for speed)
AI_PROVIDER=openai
GROQ_API_KEY="your_gsk_key_here"
GROQ_MODEL="llama-3.1-8b-instant"
QUEUE_CONNECTION=sync
```

### 4. Run Migrations & Seeders
```bash
php artisan migrate --seed
```

### 5. Start the Development Server
You need two terminal windows to run the backend and compile frontend assets:

**Terminal 1 (Laravel Server):**
```bash
php artisan serve
```

**Terminal 2 (Vite Hot-Reload):**
```bash
npm run dev
```

Visit `http://localhost:8000` in your browser and start exploring!

---

## 🧠 What Makes This Project Special? (For Tech Leads & Recruiters)

Unlike typical CRUD applications, **SupportFlow AI** demonstrates advanced software engineering practices:
1. **Zero-Hardcoding Provider Strategy:** The application uses a custom interface (`AiProvider`) bound via Laravel's `AppServiceProvider`. This allows seamlessly swapping AI vendors (OpenAI, Groq, Gemini) at runtime without altering core business logic.
2. **Defensive Error Handling:** Uses comprehensive `Throwable` catch blocks and fallback states (e.g., `#triage_timeout` tags) to ensure that external API outages never cause a `500 Server Error` or block core database operations.
3. **Optimized Prompt Engineering:** Implements strict JSON response formatting instructions to ensure deterministic and parseable outputs from LLMs for automated database updates.

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).