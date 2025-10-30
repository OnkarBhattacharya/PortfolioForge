
# PortfolioForge Testing Guide

This document provides an overview of the testing strategy and instructions on how to run the various test suites for the PortfolioForge application. A robust testing suite is crucial for ensuring code quality, preventing regressions, and maintaining a stable, reliable application.

## Testing Philosophy

Our testing strategy is based on a balanced approach, emphasizing tests that provide the most confidence for the least effort. We focus on ensuring that the application works as intended from the user's perspective.

The tests are organized into the following categories within the `tests/` directory:
- **Unit Tests (`tests/unit/`)**: For small, isolated utility functions.
- **Frontend Tests (`tests/frontend/`)**: For React components and hooks, verifying their behavior in isolation.
- **End-to-End Tests (`tests/e2e/`)**: For critical user journeys in a real browser environment, ensuring all parts of the system work together.
- **Contract Tests (`tests/contract/`)**: To ensure frontend and backend services communicate correctly (currently a placeholder).
- **Performance Tests (`tests/performance/`)**: To measure and track application speed and responsiveness (currently a placeholder).

## Tools We Use

- **Vitest**: The primary test runner for unit and component tests.
- **React Testing Library**: For rendering and interacting with React components in a user-centric way.
- **Playwright**: For powerful and reliable end-to-end tests that run in real browsers (Chrome, Firefox, etc.).
- **TypeScript**: For static type checking, which catches many errors before runtime.

---

## How to Run Tests

### 1. Unit and Frontend Component Tests

These tests verify that individual functions and React components work correctly. They are fast and run in a simulated browser environment (jsdom). They are located in `tests/unit/` and `tests/frontend/`.

To run all Vitest tests once:
```bash
npm run test
```

To run these tests in interactive "watch" mode, which automatically re-runs tests when you save a file:
```bash
npm run test:watch
```

### 2. End-to-End (E2E) Tests

These are the most important tests for verifying user-facing functionality. They simulate a real user interacting with the application in a browser. E2E tests are located in `tests/e2e/`.

The E2E tests cover critical user flows such as:
- User sign-up, login, and logout.
- Handling of the cookie consent banner.
- Navigation to legal pages (Terms, Privacy, Cookies) from the public portfolio footer.

To run the entire E2E test suite:
```bash
npm run test:e2e
```
**Note:** The Playwright configuration will automatically start the development server (`npm run dev`) if it's not already running.

---

## Test Structure & Location

- **`tests/unit/utils.test.ts`**: Contains tests for pure utility functions, like the `cn` class name utility.
- **`tests/frontend/dashboard.test.tsx`**: Uses React Testing Library to render the main dashboard page and assert its behavior under different user states (e.g., guest vs. logged-in user). It mocks Firebase hooks and `localStorage` to isolate the component.
- **`tests/e2e/auth.spec.ts`**: Uses Playwright to automate browser actions for the entire authentication lifecycle and validates navigation to legal pages.
- **`tests/contract/placeholder.test.ts`**: A placeholder file explaining how contract tests will be used to verify the data schema between the frontend and the AI APIs (e.g., `/api/cv-parser`).
- **`tests/performance/placeholder.test.ts`**: A placeholder file describing how performance tests (e.g., using k6 or Lighthouse) will be implemented to measure API response times and page load speeds.
