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
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)

## Key Features

- **Dynamic Project Management**: Add and manage your software projects, which are stored securely in Firestore.
- **User Authentication**: Secure sign-up and login with email/password, plus social sign-in options (Google, Apple, Microsoft). Read-only mode for guest users.
- **Data Import**:
  - **CV/Resume**: Upload your CV in `.pdf`, `.docx`, or `.txt` format to parse your professional data.
  - **LinkedIn**: Manually paste your profile data to quickly populate your portfolio.
  - **GitHub**: Sync your GitHub projects to showcase your work (placeholder for full integration).
- **AI Content Assistant**: Use the AI assistant to generate compelling descriptions and summaries for your portfolio based on your imported data.
- **Responsive Design**: A clean, modern UI that looks great on desktops, tablets, and smartphones.
- **Customizable Themes**: (Coming Soon) Choose from a variety of themes to personalize the look and feel of your portfolio.

## Project Structure

The project follows a standard Next.js App Router structure. Here are some key directories:

- `src/app/`: Contains all the application routes and pages.
- `src/components/`: Shared React components, including UI components from ShadCN.
- `src/lib/`: Utility functions, static data, and placeholder image configurations.
- `src/firebase/`: Firebase configuration, hooks, and utility functions for authentication and database interactions.
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

2.  **Create an Account**: Sign up using your email or a social provider to get full access.

3.  **Import Your Data**: Navigate to the "Import Data" page to upload your CV or paste your LinkedIn data.

4.  **Add Projects**: Go to the "Projects" page to add your projects manually.

5.  **Use the AI Assistant**: Go to the "AI Assistant" page to generate compelling descriptions and summaries based on the data you provided.

6.  **Customize**: Explore the `src` directory to customize pages, components, and styling. The main page is located at `src/app/page.tsx`.

7.  **Deploy**: When you're ready, you can deploy your application to a hosting provider like Firebase Hosting.
