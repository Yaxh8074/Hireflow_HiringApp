# PAYG Hire: The AI-Native Hiring Platform

![Platform Logo](https://raw.githubusercontent.com/google/aistudio-specification/main/misc/sample_images/payg_hr/logo.png)

## 🚀 Overview

PAYG Hire is a next-generation, AI-native hiring platform designed to disrupt the traditional HR software market. Its core innovation lies in a flexible **Pay-As-You-Go (PAYG) business model**, which eliminates costly monthly subscriptions and empowers businesses of all sizes to access premium, AI-powered hiring tools on demand.

This platform is not merely an Applicant Tracking System (ATS); it is a strategic partner designed to make the hiring process faster, more cost-effective, and more intelligent by deeply integrating the Google Gemini API into every step of the workflow.

---

## ✨ Core Concepts

The platform is built on two foundational pillars that differentiate it from the competition.

### 💸 Pay-As-You-Go (PAYG) Model

Traditional HR software locks users into expensive, rigid monthly subscriptions, regardless of their actual hiring volume. PAYG Hire solves this by allowing users to pay only for the services they use.

- **Cost-Effectiveness:** Aligns costs directly with hiring activity.
- **Flexibility:** Perfect for startups, SMEs, and companies with fluctuating hiring needs.
- **Accessibility:** Democratizes access to enterprise-grade tools that were previously unaffordable for smaller companies.

### 🤖 AI-Native at its Core

Artificial intelligence is not an afterthought; it is woven into the fabric of the platform to enhance decision-making and automate complex tasks. By leveraging the Google Gemini API, PAYG Hire delivers features that provide a significant competitive advantage.

---

## 🔥 Key Features

The platform offers a comprehensive suite of features tailored for both hiring managers and candidates.

### For Hiring Managers (The Command Center)

*   **Dashboard & Analytics:** A high-level overview of active jobs, total candidates, total spend, and cost-per-hire.
*   **End-to-End Job Management:**
    *   **AI-Assisted Job Postings:** Generate professional job descriptions from a title and keywords.
    *   **Visual Kanban Board & List View:** Manage the entire candidate pipeline with drag-and-drop functionality.
*   **AI-Powered Sourcing & Screening:**
    *   **AI Sourcing Agent:** Proactively scan the entire candidate database to find and rank matching candidates for new roles with AI-powered justifications.
    *   **AI Screen:** Get a concise, AI-generated summary of a candidate's fit for a role.
    *   **Dynamic Skill Assessments:** Instantly generate and send custom, multiple-choice quizzes based on the job description.
*   **Seamless Communication & Collaboration:**
    *   **Team Management:** Invite colleagues, manage roles, and collaborate in a shared workspace.
    *   **Team Notes with @Mentions:** Leave shared notes on candidate profiles and mention teammates to notify them.
    *   **Centralized Messenger:** A dedicated, real-time chat interface with unread message notifications.
    *   **Integrated Interview Scheduling:** Propose time slots to candidates, who can book directly from their portal.
*   **Flexible Administration:**
    *   **On-Demand Marketplace:** Purchase services like background checks and HR consultations as needed.
    *   **Automated Billing:** Services are seamlessly billed in the background without interrupting workflow.
    *   **Multi-Currency Support:** View all pricing and salaries in a preferred local currency (USD, INR, EUR, etc.).

### For Candidates (A Superior Experience)

*   **Streamlined & Transparent Process:**
    *   **"Easy Apply" Profile:** After the first application, resume information is saved for one-click applications to future roles.
    *   **Visual Application Status Tracker:** A timeline shows candidates exactly where they stand in the hiring process.
*   **Unique Empowerment Tools:**
    *   **AI Interview Prep:** A unique practice environment where candidates can rehearse interview questions with an AI and receive actionable feedback.
    *   **Direct & Real-Time Chat:** Candidates can directly contact HR through a persistent chat interface for each application.
*   **Interactive Engagement:**
    *   **Take Skill Assessments:** Complete AI-generated quizzes directly in the portal.
    *   **Book Interviews:** Select and confirm interview slots from a list of manager-proposed times.

---

## 🏆 Unique Selling Propositions (USP)

1.  **The Disruptive PAYG Model:** Our foundational USP. It fundamentally changes the economic equation for HR tech, making the platform a low-risk, high-reward choice.
2.  **The AI Sourcing Agent:** A game-changing proactive feature. It turns a company's passive candidate database into an active talent pool, reducing time-to-hire and sourcing costs.
3.  **Dynamic, AI-Powered Assessments:** Provides objective, relevant data early in the screening process, far superior to generic, one-size-fits-all tests.
4.  **Candidate-Centric AI Tools:** The **AI Interview Prep** feature is a massive value-add that directly benefits the candidate, improving interview quality and attracting more talent to the platform.

---

## 🛠️ Tech Stack

*   **Frontend:** [React](https://reactjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **AI Integration:** [Google Gemini API](https://ai.google.dev/gemini-api)
*   **Backend:** Mock API Service (`services/mockApiService.ts`) simulating a real backend for rapid prototyping.

---

## ⚙️ Getting Started

This project is a single-page application built with React and served from a simple `index.html` file.

### Prerequisites

You need a **Google Gemini API Key** to enable the AI-powered features.

### Configuration

1.  The application expects the Gemini API key to be available as an environment variable: `process.env.API_KEY`.
2.  In a real deployment environment (like AI Studio), this variable would be configured in the project settings.
3.  If the API key is not provided, the application will still run, but all AI features will be disabled, and a warning will be logged to the console.

### Running the Application

Simply open the `index.html` file in a modern web browser. The application state is managed by a mock API service that uses `localStorage` to persist data, simulating a real database across browser sessions.

---

## 📂 Project Structure

The project follows a standard component-based architecture:

```
/
├── components/       # Reusable React components
│   ├── candidate/    # Components for the candidate-facing portal
│   └── icons/        # SVG icon components
├── contexts/         # React context providers for global state (Auth, Payment, etc.)
├── hooks/            # Custom React hooks (e.g., usePaygApi, useAuth)
├── services/         # API services (mockApiService, geminiService, chatService)
├── types.ts          # TypeScript type definitions for the entire application
├── App.tsx           # Main application router and layout component
├── index.tsx         # Application entry point
└── index.html        # The main HTML file
```

---

## 🗺️ MVP Status & Future Roadmap

The platform is currently a **robust Minimum Viable Product (MVP)** that successfully validates the core concepts of the PAYG model and deep AI integration.

### Potential Future Enhancements:

*   **Deeper Analytics:** A dedicated "Reports" page showing hiring funnel conversion rates, time-to-hire, and source effectiveness.
*   **Offer Letter Management:** Generate, send, and track offer letters for electronic signatures.
*   **Third-Party Integrations:** Connect with Google/Outlook Calendar for seamless interview scheduling and HRIS systems (like Workday or BambooHR) for new hire onboarding.
*   **Mobile Application:** A dedicated mobile app for on-the-go access for both hiring managers and candidates.
