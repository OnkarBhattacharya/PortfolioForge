
# PortfolioForge: The Intelligent Portfolio Platform for Every Professional

PortfolioForge helps professionals launch an AI-native portfolio in minutes. Users import CVs, LinkedIn text, GitHub repos, or any URL, finetune the narrative with AI content suggestions and theme generators, and publish with premium themes on custom domains. The product now ships:

* Public landing + pricing pages with clear CTAs.
* Dashboard, projects, billing, and AI flows inside an app shell.
* Stripe-powered Pro/Studio plans plus gating on premium themes, custom domains, and unlimited portfolio items.
* Stripe Checkout, Billing Portal, and webhook listeners that update Firestore subscription metadata.

## Tech Highlights

* **Next.js 15 (App Router)** powers the public landing, dashboard, and API routes.
* **Firebase (Auth, Firestore, Storage, App Hosting)** is the backend and data store.
* **Genkit + Google AI** provide all the AI assistants (content suggestions, theme generator, CV/LinkedIn parsers).
* **ShadCN UI + Tailwind CSS** deliver a cohesive, responsive UI.
* **Stripe** handles monetization via Checkout / Portal + Firestore sync through webhooks.

## Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/portfolioforge.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env.local` and fill in the Firebase + Stripe credentials:

   ```bash
   cp .env.example .env.local
   ```

4. Start the dev server:

   ```bash
   pnpm dev
   ```

## Deployment

1. Run predeploy checks:

   ```bash
   npm run predeploy
   ```

2. Deploy:

   ```bash
   npm run deploy:prod
   ```

Remember to populate the Firebase environment with the same keys and configure the Stripe webhook URL (`https://<your-app>/api/stripe/webhook`).

## Contributions :
Purpose of the RepositoryPortfolioForge is a web-based application designed to help users create and manage online portfolios efficiently. The project aims to provide developers and creatives with tools to showcase their skills, projects, and achievements in a professional and user-friendly manner.

Why Contribute?By contributing to PortfolioForge, you can join a growing community of developers who are committed to making portfolio creation accessible for everyone. Contributing to open source is a great way to improve your skills, collaborate with others, and gain recognition in the developer community.

Getting Started

Follow the steps below to contribute:

1. Fork the Repository:Create a personal copy of this repository under your GitHub account by clicking the “Fork” button on the top right.

2. Clone Your Fork:Clone your forked repository to your local machine

3. Create a New Branch:Create a branch for your feature or bug fix

4. Make Your Changes:Develop your feature or fix the issue. Be sure to test your changes thoroughly.

5. Commit Your Changes:Stage and commit the files with meaningful commit messages

6. Push the Changes:Push your changes to your forked repository

7. Submit a Pull Request:Go to the original repository and open a pull request with a detailed description of your changes.

## Contribution Guidelines

• Make sure your code follows the existing style and structure.

• Include sufficient comments for better readability.

• Add appropriate tests for new features or bug fixes.

• Avoid introducing unnecessary libraries or breaking existing features.

How Can You Reach me?

If you have suggestions, ideas, or questions, feel free to open an issue or reach out via discussions or any contact details mentioned in the repository.