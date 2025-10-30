
# PortfolioForge: The Intelligent Portfolio Platform for Every Professional

**PortfolioForge is a next-generation platform that empowers professionals across all industries to create stunning, AI-powered portfolios in minutes, not hours. We are revolutionizing how professional identity is presented online.**

## The Vision: Democratizing Professional Storytelling

In today's digital-first economy, a powerful online portfolio is no longer optional—it's essential. However, creating one is a time-consuming, technically challenging, and often frustrating process. PortfolioForge solves this problem by leveraging cutting-edge AI to automate and elevate portfolio creation, making it accessible to everyone from software engineers and graphic designers to marketers and legal experts.

## The Problem: The Portfolio Barrier

Millions of talented professionals struggle to showcase their work effectively online due to:
- **Time Constraints:** Manually gathering, writing, and designing a portfolio is a significant time sink.
- **Lack of Design Skills:** Many lack the design expertise to create a visually compelling site.
- **Writer's Block:** Articulating one's skills and accomplishments can be incredibly difficult.
- **Technical Hurdles:** Setting up domains, hosting, and content management systems is complex.

## Our Solution: An AI-Powered Platform

PortfolioForge is not just another template-based website builder. It's an intelligent content and design partner that provides a seamless, automated experience.

### Key Differentiators & Core Technology

- **Multi-Modal AI CV Parser**: Our core innovation. Users upload a CV (PDF, DOCX, or image), and our multi-modal AI agent analyzes both the textual content and the document's visual layout. It intelligently extracts professional history, identifies the user's profession, and even infers key skills—providing a rich data foundation in seconds.
- **AI Content Co-pilot**: Powered by Genkit, our AI assistant acts as a professional copywriter. It uses the imported data to generate compelling headlines, professional summaries, and project descriptions tailored to the user's specific industry and role.
- **Effortless Data Aggregation**: Users can import data not just from their CV, but also by pasting their LinkedIn profile, connecting their GitHub account, or even providing a URL to a blog post or project. Our AI handles the rest, creating a comprehensive professional profile with minimal effort.
- **Premium, Customizable Themes**: We offer a range of beautifully designed, fully responsive themes. Users can start with a stunning free theme or upgrade to a premium design that fits their personal brand.

## Market & Monetization Strategy

PortfolioForge targets the vast, untapped market of all professionals who need to manage their online presence. Our business model is built on a freemium foundation with clear, scalable revenue streams:

- **Premium Themes:** A marketplace of professionally designed, premium themes for users who want to stand out.
- **Custom Domains:** An easy, one-click solution for users to connect and manage a custom domain directly through the platform.
- **Advanced AI Features:** Future tiers will offer even more powerful AI capabilities, such as AI-driven career path suggestions and skill-gap analysis.

## Scalable & Modern Architecture

Our platform is built on a robust, scalable, and secure tech stack, engineered for rapid feature development and global scale.

- **Framework**: **Next.js (App Router)** using React Server Components for a fast, modern, and SEO-friendly user experience.
- **Backend & Database**: **Firebase (Firestore & Authentication)** provides a secure, serverless backend that scales automatically, ensuring reliability and low operational overhead.
- **Generative AI**: **Firebase Genkit** orchestrates our powerful AI features, allowing us to leverage state-of-the-art models from Google (Gemini 1.5 Pro) for multi-modal analysis and content generation.
- **UI & Styling**: **ShadCN UI** and **Tailwind CSS** enable us to build beautiful, accessible, and consistent user interfaces with high velocity.
- **Testing & Quality Assurance**: A comprehensive testing suite using **Vitest**, **React Testing Library**, and **Playwright** ensures application reliability, from individual components to full end-to-end user flows.

### Architectural Overview

- `src/app/`: Next.js App Router for all application routes, leveraging server-side rendering for performance.
- `src/firebase/`: A clean, modular Firebase architecture with custom hooks (`useUser`, `useCollection`) for efficient and secure data handling. All data mutations are non-blocking for a fluid UI.
- `src/ai/`: Contains all Genkit flows, encapsulating the business logic for our AI-powered features like the CV parser, data importers, and content assistant.
- `src/components/`: A library of reusable, production-quality React components built with ShadCN.
- `tests/`: A comprehensive testing suite covering unit, integration, frontend, and end-to-end tests to ensure code quality and application stability.

## Commitment to Security & EU Compliance

PortfolioForge is engineered with a security-first mindset, fully aligning with stringent European cybersecurity and AI regulations, including the General Data Protection Regulation (GDPR) and the principles of the EU AI Act.

### **1. Data Protection & Privacy by Design (GDPR)**
- **Encryption**: All user data is encrypted both in transit (using HTTPS/TLS) and at rest, leveraging the default server-side encryption provided by Google Cloud and Firestore.
- **Data Minimization**: We only collect data that is essential for the functionality of the portfolio. The AI CV parser is designed to extract relevant professional information and discard extraneous personal data.
- **User Consent & Control**: All AI-driven features require explicit user action (e.g., clicking "Parse CV"). Users will have clear options to manage and delete their data, in line with the "right to be forgotten."

### **2. Secure & Resilient Infrastructure**
- **Principle of Least Privilege**: Our Firestore Security Rules are designed to be restrictive by default, ensuring users can only access and modify their own data. The rules prevent unauthorized data access between accounts.
- **Secure Authentication**: We use Firebase Authentication, which provides a managed, secure, and scalable identity solution. Our current implementation includes email/password and anonymous modes, with a clear path to adding Multi-Factor Authentication (MFA) for enhanced security.
- **Network Security**: By building on Firebase, we inherit Google's robust network security, which includes protection against DDoS attacks, traffic sniffing, and other common network-level threats.

### **3. AI Governance & Transparency (EU AI Act Alignment)**
- **Human-in-the-Loop**: Our AI features act as co-pilots, not autopilots. The user is always in control. The AI *suggests* content based on the user's data, but the user must approve and save it.
- **Transparency**: The application will always make it clear when a user is interacting with an AI-powered feature (e.g., "Parse with AI," "Generate with AI").
- **Data Provenance**: Data used for AI content generation is sourced directly from the user's own provided information (CV, LinkedIn data), ensuring traceability and relevance. We do not use user data to train our models.

### **4. Continuous Security & Compliance Monitoring**
- **Regular Audits**: We have a plan for periodic reviews of our Firebase Security Rules, application dependencies (to mitigate supply-chain risks), and data handling practices.
- **Secure Development Lifecycle**: Our testing framework, including unit, integration, and E2E tests, forms a critical part of our development process, helping to catch potential security regressions before they reach production.

## Get Started

1. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) to see your application.

2. **Experience the Magic**: Sign up for an account, import your CV on the "Import Data" page, and watch the AI build the foundation of your portfolio. Use the "AI Assistant" to generate compelling copy and see your live portfolio come to life.

---

## Key Implemented Features

### 1. User Authentication (Email/Password & Anonymous)
- **Description:** A complete and secure user management system. New users can sign up with an email and password. Returning users can log in to access their portfolio data. The system also includes a seamless "read-only" guest mode for new visitors, powered by Firebase Anonymous Authentication, allowing them to explore the app's features without creating an account.
- **Implementation:**
  - **Firebase Authentication:** Handles all user creation, session management, and security.
  - **Custom Hooks:** The `useUser()` and `useAuth()` hooks provide easy, reactive access to the current user's state throughout the application.
  - **Authentication Flows:** The `initiateEmailSignUp`, `initiateEmailSignIn`, and `initiateAnonymousSignIn` functions in `src/firebase/non-blocking-login.tsx` manage all authentication logic, including creating user profiles in Firestore upon sign-up.

### 2. Multi-Source AI Data Import Engine
- **Description:** This is the core intelligent data aggregation suite of the platform. It allows users to import professional data from a variety of sources with a single click, using AI to structure and save the information automatically.
- **Implementation:**
  - **AI CV Parser:** A powerful Genkit flow in `src/ai/flows/cv-parser.ts` leverages the multi-modal capabilities of **Gemini 1.5 Pro** to analyze the text and visual layout of an uploaded CV (PDF or image).
  - **AI LinkedIn Parser:** A Genkit flow in `src/ai/flows/linkedin-parser.ts` takes raw text copied from a user's LinkedIn profile and intelligently structures it into the standard `CvData` format.
  - **GitHub Importer:** A Genkit flow in `src/ai/flows/github-importer.ts` fetches a user's public repositories via the GitHub API, automatically creating portfolio items for their top projects.
  - **AI Web Importer:** An advanced flow in `src/ai/flows/web-importer.ts` can crawl any public URL (like a blog post or project page), use AI to generate a title, summary, and tags, and add it to the user's portfolio.
  - **API Routes:** Each importer is powered by a dedicated Next.js API route (`/api/cv-parser`, `/api/linkedin-parser`, `/api/github-importer`, `/api/web-importer`) that orchestrates the flow and saves the data to Firestore.

### 3. AI Content Co-pilot
- **Description:** An intelligent writing assistant that helps users craft compelling professional narratives. It uses the data parsed from the user's CV and their identified profession to generate tailored suggestions for portfolio headlines and summaries, overcoming writer's block.
- **Implementation:**
  - **Genkit Flow:** The `generatePortfolioContentSuggestions` flow in `src/ai/flows/ai-powered-content-suggestions.ts` takes the user's professional data and profession as input.
  - **Tailored Prompts:** The flow uses a dynamically generated prompt to instruct the Gemini model to act as an expert copywriter, ensuring the output is relevant, professional, and engaging for the user's specific field.

### 4. Dynamic, Theme-Based Public Portfolios
- **Description:** Every registered user gets a publicly accessible portfolio page (`/portfolio/{userId}`). The look and feel of this page can be customized by selecting from a range of themes available in the settings. The chosen theme dynamically adjusts the colors and styles of the live portfolio.
- **Implementation:**
  - **Dynamic Routing:** Next.js dynamic routes are used to generate a unique page for each user.
  - **Firestore for Data:** The portfolio page fetches the user's profile, CV data, and portfolio items directly from Firestore using the `useDoc` and `useCollection` hooks.
  - **Theming System:** The selected theme ID is stored in the user's profile. On the portfolio page, this ID is used to fetch the theme's color variables (e.g., primary, background), which are then applied to the page using CSS custom properties.

### 5. Generalized Portfolio Item Management
- **Description:** The platform supports a flexible data model that is not limited to a single profession. Users can add, view, and manage `PortfolioItem` entities, which can represent anything from a software project or a design case study to a marketing campaign or a published article.
- **Implementation:**
  - **Flexible Firestore Schema:** The `docs/backend.json` defines a generic `PortfolioItem` schema that can accommodate a variety of content types.
  - **CRUD Operations:** The "Portfolio Items" page (`src/app/projects/page.tsx`) provides a user-friendly interface for managing portfolio items. Add operations are handled through a dialog (`add-project-dialog.tsx`) that performs non-blocking writes to Firestore for a fast and responsive user experience.

### 6. Admin Panel with Role-Based Access
- **Description:** A secure, role-gated admin panel for platform management. It is protected by a layout that checks for an `admin` role on the user's profile, denying access to unauthorized users.
- **Implementation:**
  - **Role-Based Access Control (RBAC):** The `UserProfile` entity contains a `role` field ('user' or 'admin'). The layout at `src/app/admin/layout.tsx` enforces this, acting as a security checkpoint.
  - **User Management Dashboard:** The page at `src/app/admin/page.tsx` provides administrators with a table view of all users in the system, including their subscription status and role.

### 7. Billing & Subscriptions UI
- **Description:** A professional billing page that allows users to view and manage their subscription plans. It includes a clear comparison of different tiers (Free vs. Pro) and provides a foundation for integrating a payment provider like Stripe or PayPal.
- **Implementation:**
  - **Billing Page UI:** A new page at `src/app/billing` provides a complete interface for managing subscriptions, viewing plan features, and accessing billing history.
  - **Subscription Schema:** The `UserProfile` entity in `docs/backend.json` has been updated with `subscriptionTier` and `subscriptionStatus` fields to track user plans.

### 8. Custom Domain Connection UI
- **Description:** A user-facing feature in the settings page that allows users to connect a custom domain to their portfolio. The UI guides the user through initiating the connection and displays the necessary DNS records required for verification.
- **Implementation:**
  - **Settings UI:** The page at `src/app/settings/page.tsx` contains the input for the domain name and the logic to save it to the user's profile.
  - **Status Tracking:** The `UserProfile` schema includes `customDomain` and `customDomainStatus` fields to manage and display the connection state.

### 9. Comprehensive Testing Suite
- **Description:** A full suite of tests to ensure application quality, reliability, and maintainability. This includes unit tests for isolated functions, frontend tests for React components, and end-to-end tests that validate complete user journeys.
- **Implementation:**
  - **Vitest & React Testing Library:** Used for unit and component testing. Configuration is in `vite.config.ts`, and tests are located in the `tests/` directory.
  - **Playwright:** Used for end-to-end testing in a real browser environment. The configuration is in `playwright.config.ts`, and E2E tests validate critical user flows like authentication.
  - **Test Stubs:** Placeholder files for contract and performance tests (`tests/contract/`, `tests/performance/`) have been created to establish a structure for future, more advanced testing.

### 10. Legal & Compliance Features
- **Description:** A set of essential legal and compliance features to build user trust and meet regulatory requirements. This includes standard legal pages and a cookie consent banner.
- **Implementation:**
  - **Legal Pages:** The application includes dedicated pages for the **Terms & Conditions**, **Privacy Policy**, and **Cookie Policy**, accessible from the portfolio footer. These pages contain professional, boilerplate content that can be easily customized.
  - **Cookie Consent Banner:** A non-intrusive cookie banner is displayed to first-time visitors, informing them about the use of cookies and linking to the Cookie Policy. Consent is managed using local storage.
  - **Public Portfolio Footer:** The public portfolio page now includes a footer with links to all legal pages, ensuring they are easily accessible to visitors.
