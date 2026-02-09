# **App Name**: PortfolioForge

## Core Features:

- CV Upload & Parsing: Upload CVs (PDF/image) and have AI produce structured data. Supports linked summary extraction and skill detection.
- LinkedIn Import: Paste LinkedIn raw text; AI infers summary, experience, education, and profession.
- GitHub Project Import: Fetch public repositories, generate README summaries, and seed portfolio items automatically.
- URL Importer: Crawl any public URL, clean the HTML, and create a portfolio entry with AI-crafted tags/descriptions.
- Theme System: Choose premium/free themes, generate AI themes, and preview/remove PortfolioForge branding when unlocked.
- AI Content Assistant: Refine headlines and summaries with Genkit-powered prompts seeded by imported data.
- Premium Plans: Free tier limited to 3 items; Pro/Studio unlock premium themes, custom domains, unlimited items, and remove branding.
- Monetization Stack: Stripe Checkout + Billing Portal + webhook sync with Firestore. Free plan gating enforced client-side & via rules.

## Technology Stack:

- **Frontend**: Next.js with App Router, React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes, Firebase (Authentication, Firestore, Storage), Genkit
- **AI**: Genkit AI, Google AI (Gemini Pro)
- **Deployment**: Firebase Hosting

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to convey professionalism and innovation.
- Background color: Light Grey (#F0F2F5) to provide a clean, modern backdrop.
- Accent color: Teal (#009688) for interactive elements and call-to-actions, ensuring visibility.
- Headline font: 'Space Grotesk', sans-serif, for a techy feel.
- Body font: 'Inter', sans-serif, for a clean, modern, readable style.
- Use a consistent set of minimalistic icons to represent skills, technologies, and project categories.
- Employ a responsive, grid-based layout that adapts seamlessly to different screen sizes and devices.
- Incorporate subtle transitions and animations to enhance user engagement and provide feedback on interactions.

## Current Status

- Public landing, pricing, and signup pages detail the product story and drive upgrades.
- Dashboard, projects, billing, and settings live inside the productive app shell.
- AI importers, suggestions, and theme generation are live with data-gating tied to the active plan.
- Stripe Checkout/Portal/webhook and Firestore rules enforce monetization commitments.
