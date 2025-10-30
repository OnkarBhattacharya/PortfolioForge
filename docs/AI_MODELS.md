
# PortfolioForge AI Model & Architecture Overview

This document provides a detailed description of the Generative AI models and architecture powering the intelligent features within the PortfolioForge platform. Our AI strategy is centered on creating a "co-pilot" experience, where AI assists and accelerates the user's workflow without taking away their control.

## Core Technology: Genkit & Google's Gemini Models

PortfolioForge's AI capabilities are built using **Firebase Genkit**, an open-source framework from Google that provides a streamlined and powerful way to build, deploy, and monitor production-grade AI-powered features. Genkit acts as the orchestration layer, connecting our Next.js application to state-of-the-art Generative AI models from Google.

We primarily leverage two models from the **Gemini family**:

1.  **Gemini 1.5 Pro**: A powerful, multi-modal model capable of processing large contexts, including text, images, and entire documents (like PDFs). This is the engine behind our CV parsing feature.
2.  **Gemini 2.5 Flash**: A fast and efficient model optimized for text generation tasks where low latency is critical. This powers our real-time content suggestions and other data import features.

All AI logic is encapsulated in server-side "flows" located in the `src/ai/flows/` directory.

---

## The AI Data Import Engine

This is the core data aggregation suite of the platform, designed to eliminate the tedious task of manual data entry by leveraging AI to parse data from multiple sources.

### 1. Multi-Modal AI CV Parser

- **Purpose**: Allows a user to upload their curriculum vitae (CV) in **PDF or image format**. The AI analyzes the document and automatically extracts structured professional data.
- **Model Used**: `googleai/gemini-1.5-pro` for its advanced multi-modal reasoning capabilities, allowing it to understand both text and visual layout.
- **Flow File**: `src/ai/flows/cv-parser.ts`
- **Technical Flow**:
    1.  The frontend (`src/app/import-data/page.tsx`) converts the uploaded file into a **data URI**.
    2.  The data URI is sent to the backend API route at `/api/cv-parser`.
    3.  The API route invokes the `cvParserFlow`, which passes the data URI to the Gemini 1.5 Pro model.
    4.  The model returns a structured JSON object conforming to the `CvDataSchema` (defined in `src/lib/types.ts`).
    5.  The API route saves the structured data to the user's document in Firestore.

### 2. AI LinkedIn Profile Parser

- **Purpose**: Allows users to paste the raw text from their LinkedIn profile and have the AI intelligently structure it.
- **Model Used**: `googleai/gemini-2.5-flash` for its speed in text analysis.
- **Flow File**: `src/ai/flows/linkedin-parser.ts`
- **Technical Flow**:
    1.  The user pastes raw text into a dialog on the "Import Data" page.
    2.  The text is sent to the `/api/linkedin-parser` endpoint.
    3.  The `linkedInParserFlow` is invoked, which instructs the model to parse the text based on common LinkedIn section headers (Experience, Education, etc.).
    4.  The output is structured into the same shared `CvDataSchema`.
    5.  The structured data is saved to the user's profile in Firestore, unifying it with any existing CV data.

### 3. GitHub Repository Importer

- **Purpose**: To automatically import a user's public GitHub repositories as portfolio items.
- **Technology Used**: This flow uses the standard GitHub REST API and does not require a generative model.
- **Flow File**: `src/ai/flows/github-importer.ts`
- **Technical Flow**:
    1.  The user provides their GitHub username in a dialog on the "Import Data" page.
    2.  The username is sent to the `/api/github-importer` endpoint.
    3.  The `githubImporterFlow` fetches the user's public repositories, sorted by stars.
    4.  The flow extracts the name, description, URL, and primary language for the top repositories.
    5.  The API route then creates new `PortfolioItem` documents in Firestore for each imported repository.

### 4. AI Web Content Importer

- **Purpose**: To create a portfolio item from any public URL (e.g., a blog post, an article, or a project website).
- **Model Used**: `googleai/gemini-2.5-flash`.
- **Flow File**: `src/ai/flows/web-importer.ts`
- **Technical Flow**:
    1.  The user provides a URL in a dialog on the "Import Data" page.
    2.  The URL is sent to the `/api/web-importer` endpoint.
    3.  The `webImporterFlow` first fetches the raw HTML content of the page.
    4.  This content is then passed to the Gemini model with a prompt instructing it to act as a content analyst: extract the title, generate a professional summary, and suggest 3-5 relevant tags.
    5.  The structured output is used by the API route to create a new `PortfolioItem` in Firestore.

---

## AI Content Co-pilot

- **Purpose**: To help users overcome writer's block by generating professional headlines and summaries for their portfolio.
- **Model Used**: `googleai/gemini-2.5-flash` for its low latency, which is ideal for an interactive feature.
- **Flow File**: `src/ai/flows/ai-powered-content-suggestions.ts`
- **Technical Flow**:
    1.  On the "AI Assistant" page (`src/app/ai-assistant/page.tsx`), the user clicks "Generate Suggestions."
    2.  The user's professional data (from their parsed CV/LinkedIn) is passed to the `generatePortfolioContentSuggestions` flow.
    3.  The flow constructs a prompt that assigns the model the persona of an expert career coach and provides it with the user's data for context.
    4.  The model generates a `suggestedDescription` and `suggestedSummary`, which are displayed to the user.

    