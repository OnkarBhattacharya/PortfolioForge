# Contributing to PortfolioForge

First of all, thank you for considering contributing to PortfolioForge! We welcome any help, from reporting a bug to implementing a new feature.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** to your local machine.
3.  **Install the dependencies** by running `npm install`.
4.  **Set up your environment variables** by creating a `.env.local` file and adding the necessary Firebase configuration.
5.  **Run the development server** with `npm run dev`.

## Reporting Bugs

If you find a bug, please open an issue on GitHub and provide the following:

*   A clear and descriptive title.
*   A detailed description of the problem, including steps to reproduce it.
*   Information about your environment (e.g., browser, operating system).

## Suggesting Features

We are always open to new ideas! If you have a suggestion for a new feature, please open an issue on GitHub and describe:

*   What the feature would do.
*   Why it would be valuable to PortfolioForge users.

## Development Workflow

1.  Create a new branch for your feature or bug fix.
2.  Make your changes and ensure the code follows the project's style.
3.  **Run the tests** with `npm run test` to make sure everything is working as expected.
4.  **Run the linter** with `npm run lint` to check for code style issues.
5.  Commit your changes and push them to your fork.
6.  Open a pull request to the main repository.

## Folder Structure

- `src/app`: Contains all the application routes, following the Next.js App Router structure.
- `src/ai`: Houses all the Genkit flows for the AI-powered features.
- `src/components`: Includes all the reusable React components.
- `src/firebase`: Contains all the Firebase configuration and custom hooks.
- `src/lib`: Holds all the utility functions and libraries.
- `tests`: Contains all the tests, organized by type (unit, frontend, e2e).

## Coding Style

We use Prettier to automatically format our code and ESLint to enforce code quality. Please make sure to run `npm run lint` and `npm run format` before committing your changes.

## Testing

We use Vitest and React Testing Library for unit and component tests, and Playwright for end-to-end tests. Please add tests for any new features or bug fixes.

We will review your pull request as soon as possible. Thank you for your contribution!
