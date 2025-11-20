# PortfolioForge: The Intelligent Portfolio Platform

**Build a stunning, AI-powered portfolio in minutes, not hours.** PortfolioForge leverages cutting-edge AI to automate the tedious parts of portfolio creation, allowing you to focus on what matters: showcasing your professional story.

## Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Getting Started (For Developers)](#getting-started-for-developers)
- [Security & Compliance](#security--compliance)
- [Project Status](#project-status)

## The Problem

In today's digital economy, a strong online portfolio is essential. Yet, creating one is a major hurdle for many professionals due to time constraints, a lack of design skills, writer's block, and technical challenges.

## Our Solution

PortfolioForge is an intelligent content and design partner that automates and elevates portfolio creation. It acts as a "co-pilot," streamlining data import, content generation, and design, making professional storytelling accessible to everyone.

## Core Features

- **Multi-Source AI Data Import**: Instantly populate your portfolio by:
  - Uploading a CV (PDF or image) for AI-powered parsing.
  - Pasting raw text from your LinkedIn profile.
  - Connecting your GitHub account to import repos (with AI-generated summaries).
  - Importing content from any URL (blog posts, articles).
- **AI Content Co-pilot**: Overcome writer's block with AI-generated suggestions for headlines, summaries, and project descriptions tailored to your profession.
- **AI Theme Generator**: Generate a unique color theme for your portfolio from a simple text prompt (e.g., "a calming ocean breeze").
- **Dynamic Theming**: Choose from a range of professionally designed, structurally distinct themes to radically change the look and feel of your public portfolio.
- **Secure & Professional**:
  - Custom domain support.
  - Secure contact form on your public portfolio.
  - Role-based admin panel for platform management.
- **Built for Compliance**: Engineered with a security-first mindset, aligning with GDPR and EU AI Act principles.

## Technology Stack

- **Framework**: Next.js (App Router) with React Server Components.
- **Backend & Database**: Firebase (Firestore, Authentication, Storage).
- **Deployment**: Firebase Hosting.
- **Generative AI**: Google's Genkit framework with Gemini models.
- **UI & Styling**: ShadCN UI and Tailwind CSS.
- **Testing**: Vitest, React Testing Library, and Playwright for end-to-end testing.

## Getting Started (For Developers)

Interested in contributing? We welcome your help!

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork: `git clone <your-fork-url>`
3.  **Install dependencies**: `npm install`
4.  **Set up environment variables**: Create a `.env.local` file and add the necessary Firebase configuration.
5.  **Run the development server**: `npm run dev`

For more detailed instructions on our development workflow, coding style, and testing, please read our [**CONTRIBUTING.md**](CONTRIBUTING.md) file.

## Security & Compliance

PortfolioForge is built to be secure and compliant with modern data protection standards.

- **Data Protection**: User data is encrypted in transit and at rest. We follow data minimization principles and ensure user control over their information.
- **Secure Infrastructure**: We use restrictive Firestore and Storage security rules, Firebase Authentication, and Firebase App Check to protect our backend.
- **AI Governance**: Our AI features are designed as "human-in-the-loop" assistants, ensuring users are always in control. We are transparent about AI usage and do not use user data for training models.

## Project Status

PortfolioForge is under active development. We are continuously working on adding new features and improving the platform.
