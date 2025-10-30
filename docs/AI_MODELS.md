
# PortfolioForge AI Model & Architecture Overview

This document provides a detailed description of the Generative AI models and architecture powering the intelligent features within the PortfolioForge platform. Our AI strategy is centered on creating a "co-pilot" experience, where AI assists and accelerates the user's workflow without taking away their control.

## Core Technology: Genkit & Google's Gemini Models

PortfolioForge's AI capabilities are built using **Firebase Genkit**, an open-source framework from Google that provides a streamlined and powerful way to build, deploy, and monitor production-grade AI-powered features. Genkit acts as the orchestration layer, connecting our Next.js application to state-of-the-art Generative AI models from Google.

We primarily leverage two models from the **Gemini family**:

1.  **Gemini 1.5 Pro**: A powerful, multi-modal model capable of processing large contexts, including text, images, and entire documents (like PDFs). This is the engine behind our CV parsing feature.
2.  **Gemini 2.5 Flash**: A fast and efficient model optimized for text generation tasks where low latency is critical. This powers our real-time content suggestions.

All AI logic is encapsulated in server-side "flows" located in the `src/ai/flows/` directory.

---

## Feature 1: Multi-Modal AI CV Parser

This is the cornerstone intelligent feature of PortfolioForge, designed to eliminate the tedious task of manual data entry.

### 1.1. Purpose & User Benefit

The CV Parser allows a user to upload their curriculum vitae (CV) in either **PDF or image format**. The AI analyzes the document and automatically extracts structured professional data, populating the user's profile in seconds.

### 1.2. Model Used: `googleai/gemini-1.5-pro`

We use the Gemini 1.5 Pro model for this task due to its advanced **multi-modal reasoning capabilities**. It can natively understand both the textual content and the **visual layout** of a document. This is crucial because CVs are often visually structured with columns, sections, and different font sizes, which provide important context that a simple text extraction would miss.

### 1.3. Technical Flow

The process works as follows:

1.  **Frontend Upload**: In `src/app/import-data/page.tsx`, the user selects a file (e.g., `my_cv.pdf`).
2.  **Data URI Conversion**: The frontend converts the file into a **data URI** (a Base64-encoded string with a MIME type, e.g., `data:application/pdf;base64,...`). This is a standard way to represent file data as a string.
3.  **API Request**: The data URI is sent to our backend API route at `/api/cv-parser`.
4.  **Genkit Flow Invocation**: The API route invokes the `cvParserFlow` located in `src/ai/flows/cv-parser.ts`.
5.  **Model Execution**: The flow passes the data URI to the Gemini 1.5 Pro model. The prompt instructs the model to act as an expert document analyst and return a structured JSON object.
6.  **Structured Output**: The model processes the document and returns the data in a JSON format that matches our predefined `CvDataSchema`.
7.  **Save to Firestore**: The API route receives the structured data and saves it to the user's document in the Firestore database.

### 1.4. Schema & Prompt Engineering

The reliability of this feature hinges on strong "structured output" prompting.

-   **Schema (`CvDataSchema`)**: In `src/ai/flows/cv-parser.ts`, we define a strict Zod schema (`CvDataSchema`) that outlines the exact JSON structure we expect back from the model. This includes nested objects for personal info, experience, education, and arrays for skills.
-   **Prompt**: The prompt explicitly tells the model to use this schema for its response. This ensures we always get back clean, predictable data that our application can use, rather than unstructured text.

---

## Feature 2: AI Content Co-pilot

Once a user's data has been imported, the AI Content Co-pilot helps them overcome writer's block and craft a compelling professional narrative.

### 2.1. Purpose & User Benefit

This feature generates professional, tailored suggestions for a user's portfolio headline and summary based on their imported CV data and identified profession.

### 2.2. Model Used: `googleai/gemini-2.5-flash`

We use the Gemini 2.5 Flash model for this feature. Since this is an interactive feature where the user clicks a button and expects a quick response, the low latency and high efficiency of Gemini 2.5 Flash are ideal.

### 2.3. Technical Flow

1.  **Frontend Request**: On the "AI Assistant" page (`src/app/ai-assistant/page.tsx`), the user clicks "Generate Suggestions."
2.  **Data Payload**: The frontend gathers the user's professional data (parsed CV data, profession, etc.) from local storage or state.
3.  **Flow Invocation**: The data is passed to the `generatePortfolioContentSuggestions` function in `src/ai/flows/ai-powered-content-suggestions.ts`.
4.  **Model Execution**: The Genkit flow constructs a prompt that includes the user's data and instructs the model to act as an expert career coach and copywriter.
5.  **Content Generation**: The Gemini model generates a `suggestedDescription` and `suggestedSummary`.
6.  **Display to User**: The suggestions are returned to the frontend and displayed for the user to review, copy, or edit.

### 2.4. Prompt Engineering

The prompt for this flow is engineered to produce high-quality, relevant content by:

-   **Assigning a Persona**: The prompt begins with, "You are an expert career coach and copywriter..." This puts the model in the correct mindset.
-   **Providing Context**: It injects the user's profession and data directly into the prompt, ensuring the suggestions are tailored to their specific field and experience.
-   **Requesting Structured Output**: Like the CV parser, it uses a Zod schema (`PortfolioContentSuggestionsOutputSchema`) to ensure the response is a clean JSON object with the expected fields.
