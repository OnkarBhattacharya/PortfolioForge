
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
- **Model Used**: `googleai/gemini-2.5-flash` for its speed in text analysis.
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
- **Model Used**: `googleai/gemini-2.5-flash`.
- **Flow File**: `src/ai/flows/web-importer.ts`
- **API Route**: `src/app/api/web-importer/route.ts`
- **Technical Flow**:
    1.  The frontend sends a URL to `/api/web-importer`.
    2.  The API route calls the `webImporterFlow`, which fetches the page content and passes it to the Gemini model for analysis (title, summary, tags).
    3.  The API route uses the structured output to create a new `PortfolioItem` in Firestore.

---

## AI Content & Translation Services

### 1. AI Content Co-pilot

- **Purpose**: To help users overcome writer's block by generating professional headlines and summaries for their portfolio.
- **Model Used**: `googleai/gemini-2.5-flash` for its low latency.
- **Flow File**: `src/ai/flows/ai-powered-content-suggestions.ts`
- **Technical Flow**:
    1.  On the "AI Assistant" page, the user clicks "Generate Suggestions."
    2.  The user's professional data (from their parsed CV/LinkedIn) is passed to the `generatePortfolioContentSuggestions` flow.
    3.  The flow constructs a prompt that assigns the model the persona of an expert career coach.
    4.  The model generates a `suggestedDescription` and `suggestedSummary`, which are displayed to the user.

### 2. AI-Powered Translation

- **Purpose**: To provide on-the-fly translation for portfolio content, enabling users to reach a global audience.
- **Model Used**: `googleai/gemini-2.5-flash` for fast and accurate translation.
- **Flow File**: `src/ai/flows/translator.ts`
- **API Route**: `src/app/api/translate/route.ts`
- **Technical Flow**:
    1.  The user selects a target language and clicks a "Translate" button.
    2.  The frontend sends the text content and target language to the `/api/translate` route.
    3.  The `translatorFlow` is invoked, which instructs the Gemini model to translate the text.
    4.  The API route returns the translated text, which is then displayed in the UI.

