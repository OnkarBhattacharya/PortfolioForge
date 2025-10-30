# PortfolioForge Testing Guide

This document provides an overview of the testing strategy and instructions on how to run the various test suites for the PortfolioForge application. A robust testing suite is crucial for ensuring code quality, preventing regressions, and maintaining a stable, reliable application.

## Testing Philosophy

Our testing strategy is based on a balanced approach, emphasizing tests that provide the most confidence for the least effort. We focus on ensuring that the application works as intended from the user's perspective.

The tests are organized into the following categories within the `tests/` directory:
- **Unit Tests (`tests/unit/`)**: For small, isolated utility functions.
- **Frontend Tests (`tests/frontend/`)**: For React components and hooks.
- **End-to-End Tests (`tests/e2e/`)**: For critical user journeys in a real browser environment.
- **Contract Tests (`tests/contract/`)**: To ensure frontend and backend services communicate correctly.
- **Performance Tests (`tests/performance/`)**: To measure and track application speed and responsiveness.

## Tools We Use

- **Jest**: The primary test runner for unit and component tests.
- **React Testing Library**: For rendering and interacting with React components in a user-centric way.
- **Playwright**: For powerful and reliable end-to-end tests that run in real browsers.
- **TypeScript**: For static type checking, which catches many errors before runtime.

---

## How to Run Tests

### 1. Unit and Frontend Component Tests

These tests verify that individual functions and React components work correctly. They are fast and run in a simulated browser environment (jsdom).

To run all unit and component tests once:
```bash
npm run test
```

To run these tests in interactive "watch" mode, which automatically re-runs tests when you save a file:
```bash
npm run test:watch
```

### 2. End-to-End (E2E) Tests

These are the most important tests for verifying user-facing functionality. They simulate a real user interacting with the application in a browser (Chrome, by default).

The E2E tests cover critical user flows such as:
- User sign-up and login.
- Navigating through the application.
- Verifying that core UI elements are visible and interactive.

To run the entire E2E test suite:
```bash
npm run test:e2e
```
**Note:** The development server must be running (`npm run dev`) before you can execute the E2E tests. The Playwright configuration will automatically start it if it's not already running.

---

## Test Structure & Location

- **Unit Tests**: Found in `tests/unit/`. These test pure functions, like the `cn` utility.
- **Frontend Tests**: Found in `tests/frontend/`. These use React Testing Library to render components and assert their behavior. For example, `dashboard.test.tsx` checks that the main dashboard page renders correctly for different user states.
- **E2E Tests**: Found in `tests/e2e/`. These use Playwright to automate browser actions. `auth.spec.ts` contains tests for signing up, logging in, and verifying legal page navigation.

## Future Testing (Placeholders)

You will find placeholder files in `tests/contract/` and `tests/performance/`. These are reminders of future testing areas that are critical as the application grows:

- **Contract Tests**: These will verify the "contract" between the frontend and our Genkit AI flows (e.g., the `/api/cv-parser` API). We will use schema validation to ensure the data structure exchanged between the client and server never breaks.

- **Performance Tests**: These will be implemented using tools like k6 or Playwright's performance metrics to track page load times and API response speeds, ensuring the application remains fast and responsive under load.
