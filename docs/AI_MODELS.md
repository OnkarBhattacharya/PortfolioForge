
# PortfolioForge AI Model & Architecture Overview

This document provides a detailed description of the Generative AI models and architecture powering the intelligent features within the PortfolioForge platform. Our AI strategy is centered on creating a "co-pilot" experience, where AI assists and accelerates the user's workflow without taking away their control.

## Core Technology: Genkit & Dynamic Model Configuration

PortfolioForge's AI capabilities are built using **Firebase Genkit**, an open-source framework from Google for building production-grade AI features. The core of our architecture is a dynamic model configuration system that uses **Firebase Remote Config** to manage the specific AI model used by the application.

### Dynamic Model Management with Remote Config

Instead of hardcoding a specific model name (like `gemini-1.5-flash`), we use Remote Config to define the `gemini_model_id` parameter. This offers significant advantages:

*   **Flexibility**: We can switch AI models across the entire application without needing to redeploy the codebase.
*   **A/B Testing**: We can experiment with different models for specific user segments to find the optimal balance of cost, speed, and quality.
*   **Safe Rollouts**: New models can be rolled out gradually to a percentage of users, minimizing risk.

At runtime, the `src/ai/genkit.ts` file fetches the model ID from Remote Config using the Firebase Admin SDK. If the parameter is not set or the fetch fails, it gracefully falls back to a default model (`gemini-1.5-flash`). This makes our AI engine robust and adaptable.

---

## Recent Architectural Audit & Modernization (June 2024)

I recently completed a comprehensive audit and modernization of all AI flows to improve consistency, robustness, and maintainability. The following key improvements have been implemented across the entire AI engine:

*   **Dynamic Model Configuration**: Implemented Firebase Remote Config to manage the AI model, as described above.
*   **Code Consistency**: Standardized all Zod imports to use `genkit` instead of direct `zod` imports, creating a single source of truth for schemas.
*   **Robustness & Error Handling**: Implemented stricter error handling, content truncation to prevent excessive token usage, and more resilient logic to handle unexpected model outputs or empty inputs.
*   **Advanced Prompt Engineering**: Refined and improved all AI prompts to be more explicit, provide better context, and include clear instructions for the desired output format. This leads to more accurate and reliable results.
*   **Content Sanitization**: Introduced `node-html-parser` to the Web Importer flow to sanitize raw HTML, removing noise (like scripts and styles) and focusing the AI on the core text content for significantly better analysis.

---

## The AI Data Import Engine

This is the core data aggregation suite of the platform, designed to eliminate the tedious task of manual data entry by leveraging AI to parse data from multiple sources.

### 1. Multi-Modal AI CV Parser

- **Purpose**: Allows a user to upload their curriculum vitae (CV) in **PDF or image format**. The AI analyzes the document and automatically extracts structured professional data.
- **Flow File**: `src/ai/flows/cv-parser.ts`
- **API Route**: `src/app/api/cv-parser/route.ts`
- **Technical Flow**: The flow now uses a more robust prompt and an updated Zod schema (`CvParserOutputSchema`) to ensure the model returns clean, structured data every time.

### 2. AI LinkedIn Profile Parser

- **Purpose**: Allows users to paste the raw text from their LinkedIn profile and have the AI intelligently structure it.
- **Flow File**: `src/ai/flows/linkedin-parser.ts`
- **API Route**: `src/app/api/linkedin-parser/route.ts`
- **Technical Flow**: Similar to the CV parser, this flow has been updated with a more resilient prompt and schema to better handle variations in LinkedIn profile structures.

### 3. GitHub Repository Importer

- **Purpose**: To automatically import a user's public GitHub repositories as portfolio items, including an AI-generated summary of the project's README.
- **Flow File**: `src/ai/flows/github-importer.ts` (orchestrator) and `src/ai/flows/readme-summarizer.ts` (AI task).
- **API Route**: `src/app/api/github-importer/route.ts`
- **Technical Flow**:
    1. The `githubImporterFlow` fetches repository data using the GitHub REST API.
    2. For each repository, it invokes the separate `readmeSummarizerFlow`.
    3. The `readmeSummarizerFlow` takes the raw README content, truncates it to a safe length, and uses an improved prompt to generate a concise, portfolio-ready summary.
    4. The API route creates new `PortfolioItem` documents in Firestore, now including the AI-generated summary.

### 4. AI Web Content Importer

- **Purpose**: To create a portfolio item from any public URL (e.g., a blog post, an article, or a project website).
- **Flow File**: `src/ai/flows/web-importer.ts`
- **API Route**: `src/app/api/web-importer/route.ts`
- **Technical Flow**:
    1. The flow fetches the raw HTML from the given URL.
    2. **Crucially, it now uses `node-html-parser` to sanitize the HTML, removing script, style, and other irrelevant tags to extract clean text content.**
    3. This clean text is truncated and passed to the AI model with a refined prompt, resulting in a much more accurate title, summary, and tag generation.
    4. The API route uses the structured output to create a new `PortfolioItem` in Firestore.

---

## AI Content & Design Services

### 1. AI-Powered Content Suggestions

- **Purpose**: To help users refine their project descriptions and other portfolio content with AI-powered suggestions.
- **Flow File**: `src/ai/flows/ai-powered-content-suggestions.ts`
- **API Route**: `src/app/api/ai-powered-content-suggestions/route.ts`
- **Technical Flow**: The prompt has been significantly improved to guide the AI in generating more relevant and higher-quality suggestions for improving user-written content.

### 2. Text Translation

- **Purpose**: To translate user-provided text into different languages.
- **Flow File**: `src/ai/flows/translator.ts`
- **API Route**: `src/app/api/translate/route.ts`
- **Technical Flow**: The core function was renamed from `translateTexts` to `translate` for clarity. The prompt was heavily revised to be more explicit, providing clear instructions and examples to ensure the model returns data in the correct format, improving reliability.
