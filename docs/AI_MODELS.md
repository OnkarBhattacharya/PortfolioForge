
# PortfolioForge AI Model & Architecture Overview

This document provides a detailed description of the Generative AI models and architecture powering the intelligent features within the PortfolioForge platform. Our AI strategy is centered on creating a "co-pilot" experience, where AI assists and accelerates the user's workflow without taking away their control.

## Core Technology: Genkit & Google's Gemini Models

PortfolioForge's AI capabilities are built using **Firebase Genkit**, an open-source framework from Google that provides a streamlined and powerful way to build, deploy, and monitor production-grade AI-powered features. Genkit acts as the orchestration layer, connecting our Next.js application to state-of-the-art Generative AI models from Google.

We primarily leverage two models from the **Gemini family**:

1.  **Gemini 1.5 Pro**: A powerful, multi-modal model capable of processing large contexts, including text, images, and entire documents (like PDFs). This is the engine behind our CV parsing feature.
2.  **Gemini 2.5 Flash**: A fast and efficient model optimized for text generation tasks where low latency is critical. This powers our real-time content suggestions and other data import features.

All AI logic is encapsulated in server-side "flows" located in the `src/ai/flows/` directory and exposed via API routes in `src/app/api/`.

---

## The AI Data Import Engine

This is the core data aggregation suite of the platform, designed to eliminate the tedious task of manual data entry by leveraging AI to parse data from multiple sources. Each importer follows a standard, robust pattern:

1.  **Frontend Request**: The client (`src/app/import-data/page.tsx`) sends a request to a specific API route (e.g., `/api/cv-parser`) with the necessary data (file data URI, username, URL, etc.).
2.  **API Route Orchestration**: The Next.js API route receives the request, calls the appropriate Genkit flow to perform the AI task, and then saves the structured data to Firestore.
3.  **Genkit Flow Execution**: The Genkit flow (e.g., `cvParserFlow`) is responsible for a single task: interacting with the AI model to process the input and return a structured JSON object.
4.  **Firestore Update**: The API route takes the JSON output from the flow and saves it to the user's document in Firestore.

### 1. Multi-Modal AI CV Parser

- **Purpose**: Allows a user to upload their curriculum vitae (CV) in **PDF or image format**. The AI analyzes the document and automatically extracts structured professional data.
- **Model Used**: `googleai/gemini-1.5-pro` for its advanced multi-modal reasoning capabilities.
- **Flow File**: `src/ai/flows/cv-parser.ts`
- **API Route**: `src/app/api/cv-parser/route.ts`
- **Technical Flow**:
    1.  The frontend converts the uploaded file into a **data URI** and sends it to `/api/cv-parser`.
    2.  The API route invokes the `cvParserFlow` with the data URI.
    3.  The flow returns a structured `CvData` JSON object.
    4.  The API route merges the structured data into the user's document in Firestore.

### 2. AI LinkedIn Profile Parser

- **Purpose**: Allows users to paste the raw text from their LinkedIn profile and have the AI intelligently structure it.
- **Model Used**: `googleai/gemini-1.5-pro` for its speed in text analysis.
- **Flow File**: `src/ai/flows/linkedin-parser.ts`
- **API Route**: `src/app/api/linkedin-parser/route.ts`
- **Technical Flow**:
    1.  The frontend sends the raw text to `/api/linkedin-parser`.
    2.  The `linkedInParserFlow` is invoked, instructing the model to parse the text.
    3.  The output is structured into the shared `CvDataSchema`.
    4.  The API route merges the data into the user's profile in Firestore.

### 3. GitHub Repository Importer

- **Purpose**: To automatically import a user's public GitHub repositories as portfolio items.
- **Technology Used**: GitHub REST API.
- **Flow File**: `src/ai/flows/github-importer.ts`
- **API Route**: `src/app/api/github-importer/route.ts`
- **Technical Flow**:
    1.  The frontend sends a GitHub username to `/api/github-importer`.
    2.  The API route calls the `githubImporterFlow`, which fetches the user's public repositories.
    3.  The API route then creates new `PortfolioItem` documents in Firestore for each imported repository.

### 4. AI Web Content Importer

- **Purpose**: To create a portfolio item from any public URL (e.g., a blog post, an article, or a project website).
- **Model Used**: `googleai/gemini-1.5-pro`.
- **Flow File**: `src/ai/flows/web-importer.ts`
- **API Route**: `src/app/api/web-importer/route.ts`
- **Technical Flow**:
    1.  The frontend sends a URL to `/api/web-importer`.
    2.  The API route calls the `webImporterFlow`, which fetches the page content and passes it to the Gemini model for analysis (title, summary, tags).
    3.  The API route uses the structured output to create a new `PortfolioItem` in Firestore.

---

## AI Content & Design Services

### 1. Skills & Keyword Analysis

- **Purpose**: To analyze a user's professional data (from their CV or LinkedIn profile) and extract a list of their key skills and professional keywords.
- **Model Used**: `googleai/gemini-1.5-pro` for its powerful reasoning and data extraction capabilities.
- **Flow File**: `src/ai/flows/keyword-extractor.ts`
- **API Route**: `src/app/api/keyword-extractor/route.ts`
- **Technical Flow**:
    1.  After a user imports their CV or LinkedIn data, the frontend sends the user's professional summary and work experience to `/api/keyword-extractor`.
    2.  The `keywordExtractorFlow` is invoked, which instructs the model to act as a professional recruiter and identify the most important skills.
    3.  The flow returns a list of skills, which is then saved to the user's profile in Firestore.

### 2. AI-Powered Theme Generation

- **Purpose**: To allow users to generate unique portfolio themes by describing their desired style in plain text.
- **Model Used**: `googleai/gemini-1.5-pro`.
- **Flow File**: `src/ai/flows/theme-generator.ts`
- **API Route**: `src/app/api/theme-generator/route.ts`
- **Technical Flow**:
    1.  On the settings page, the user enters a text prompt describing their desired theme.
    2.  The frontend sends the prompt to `/api/theme-generator`.
    3.  The `themeGeneratorFlow` is invoked, which instructs the model to generate a theme configuration that conforms to a predefined Zod schema (`ThemeConfigSchema`).
    4.  The API route returns the generated theme, which is then displayed to the user for preview and can be saved to their profile.

### 3. AI-Powered Content Suggestions

- **Purpose**: To help users refine their project descriptions and other portfolio content with AI-powered suggestions.
- **Model Used**: `googleai/gemini-1.5-pro`.
- **Flow File**: `src/ai/flows/content-suggester.ts`
- **API Route**: `src/app/api/content-suggester/route.ts`
- **Technical Flow**:
    1.  When editing a project, the user can click an "AI Suggestions" button.
    2.  The frontend sends the user's current text and the content type (e.g., "project description") to `/api/content-suggester`.
    3.  The `contentSuggesterFlow` is invoked, instructing the model to generate a list of suggestions to improve the text.
    4.  The API route returns the suggestions, which are then displayed to the user in a dialog.
