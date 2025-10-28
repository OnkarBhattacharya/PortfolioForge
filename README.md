# PortfolioForge

Welcome to **PortfolioForge**! This is a Next.js application designed to help you create a professional software engineering portfolio with ease. Leverage AI-powered content suggestions, import data from various sources like LinkedIn and GitHub, and showcase your projects in a beautifully designed template.

## Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Backend Services**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, etc.)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)

## Project Structure

The project follows a standard Next.js App Router structure. Here are some key directories:

- `src/app/`: Contains all the application routes and pages.
- `src/components/`: Shared React components, including UI components from ShadCN.
- `src/lib/`: Utility functions, data, and placeholder image configurations.
- `src/ai/`: Contains Genkit flows for AI-powered features.
- `src/hooks/`: Custom React hooks.
- `public/`: Static assets like images and fonts.

## Getting Started

To get started with developing your portfolio:

1.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) to see your application.

2.  **Import Your Data**: Navigate to the "Import Data" page to upload your CV or connect your LinkedIn and GitHub accounts.

3.  **Use the AI Assistant**: Go to the "AI Assistant" page to generate compelling descriptions and summaries for your portfolio based on the data you provided.

4.  **Customize**: Explore the `src` directory to customize pages, components, and styling. The main page is located at `src/app/page.tsx`.

5.  **Deploy**: When you're ready, you can deploy your application to Firebase Hosting.
