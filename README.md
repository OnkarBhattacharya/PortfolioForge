
# PortfolioForge: The Intelligent Portfolio Platform for Every Professional

**PortfolioForge** is a dynamic and AI-powered open-source platform that enables users to create, customize, and deploy professional portfolios with ease. This platform is designed for developers, designers, artists, and other professionals who want to showcase their work in a polished and engaging format.

## Key Features

*   **AI-Powered Content Suggestions:** Get intelligent recommendations for your portfolio content.
*   **AI Theme Generation:** Describe the style you want, and our AI will create a unique theme for you. Try things like "a minimalist theme with a touch of neon" or "a professional theme for a photographer."
*   **Multiple Data Import Options:** Import your data from various sources like LinkedIn, GitHub, and CV files.
*   **Customizable Themes:** Choose from a variety of themes to personalize your portfolio.
*   **Dynamic Portfolio Generation:** Your portfolio is dynamically generated based on your user ID.

## Tech Stack

PortfolioForge is built with a modern tech stack that includes:

*   **[Next.js](https://nextjs.org/):** A React framework for building server-rendered applications.
*   **[Firebase](https://firebase.google.com/):** A comprehensive platform for building web and mobile applications.
*   **[Genkit](https://firebase.google.com/docs/genkit):** A generative AI framework for building AI-powered features.
*   **[Tailwind CSS](https://tailwindcss.com/):** A utility-first CSS framework for rapid UI development.
*   **[shadcn/ui](https://ui.shadcn.com/):** A collection of re-usable components for building modern UIs.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/en) (v20 or later)
*   [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/portfolioforge.git
    ```

2.  Install the dependencies:

    ```bash
    pnpm install
    ```

3.  Set up your environment variables. Create a `.env.local` file in the root of your project and add the following:

    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```

    You can find these values in your Firebase project settings.

### Running the Development Server

```bash
pnpm dev
```

## Deployment

PortfolioForge can be deployed to any platform that supports Next.js applications. For easy deployment, we recommend using [Vercel](httpshttps://vercel.com/) or [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

### Deploying with Firebase App Hosting

1.  Install the Firebase CLI:

    ```bash
    npm install -g firebase-tools
    ```

2.  Log in to Firebase:

    ```bash
    firebase login
    ```

3.  Initialize Firebase in your project:

    ```bash
    firebase init
    ```

4.  Deploy your application:

    ```bash
    firebase deploy --only hosting
    ```
