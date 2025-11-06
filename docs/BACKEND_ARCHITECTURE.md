
# PortfolioForge Backend Architecture

This document provides a technical overview of the backend infrastructure for the PortfolioForge application. It is intended for developers to understand the data models, database structure, and authentication mechanisms.

Our backend is built entirely on **Firebase**, leveraging its powerful, scalable, and serverless services.

## Core File: `docs/backend.json`

The file `docs/backend.json` is the single source of truth for the backend's structure. It is a blueprint that defines our data models and how they are stored in Firestore. This file is not just documentation; it is used as a reference for code generation and to provision the backend environment.

The `backend.json` file has three main sections:

1.  `entities`: JSON Schema definitions for our core data models.
2.  `firestore`: The structure of our Cloud Firestore database.
3.  `auth`: Configuration for Firebase Authentication.

---

## 1. Data Models (Entities)

The `entities` section defines the shape and validation rules for all data objects in the application.

### `UserProfile`
- **Description**: Represents a user's core profile information, settings, and subscription status.
- **Key Properties**:
    - `id` (string): The user's unique ID (matches Firebase Auth UID).
    - `fullName` (string): The user's full name.
    - `email` (string): The user's email address.
    - `role` (string, enum): The user's role in the system. Can be `user` or `admin`.
    - `themeId` (string): The ID of the visual theme selected for the user's portfolio.
    - `customDomain` (string, hostname): The custom domain connected to their portfolio.
    - `customDomainStatus` (string, enum): The verification status of the custom domain (`pending`, `active`, `error`).
    - `subscriptionTier` (string, enum): The user's current subscription plan (`free`, `pro`).
    - `subscriptionStatus` (string, enum): The status of the subscription (`active`, `canceled`, `past_due`).
    - `subscriptionPeriodEndDate` (string, date-time): The date when the current subscription period ends.

### `CvData`
- **Description**: An intermediate data structure that holds the professional information extracted by our AI parsers (from a CV or LinkedIn profile). This data is then merged into the `UserProfile` document.
- **Key Properties**:
    - `fullName` (string): The user's full name, as extracted from the document.
    - `email` (string): The user's email address.
    - `phoneNumber` (string): The user's phone number.
    - `website` (string, uri): The user's personal website or portfolio link.
    - `location` (string): The user's general location (e.g., "London, UK").
    - `professionalSummary` (string): A summary of the user's professional background.
    - `workExperience` (array of objects): A list of previous jobs, including company, role, dates, and responsibilities.
    - `education` (array of objects): A list of educational qualifications, including institution, degree, and dates.
    - `skills` (array of strings): A list of identified skills.

### `PortfolioItem`
- **Description**: A generic item within a user's portfolio. This can represent a software project, a design case study, a marketing campaign, etc.
- **Key Properties**:
    - `id` (string): A unique ID for the portfolio item.
    - `userProfileId` (string): A reference to the owning `UserProfile`.
    - `name` (string): The title of the item.
    - `description` (string): A detailed description of the item.
    - `itemUrl` (string, uri): A link to the live project, code repository, or case study.
    - `tags` (array of strings): Skills or technologies associated with the item (e.g., "React", "UI/UX", "SEO").

### `Theme`
- **Description**: Represents a visual theme that can be applied to a public portfolio.
- **Key Properties**:
    - `id` (string): A unique identifier for the theme (e.g., "default", "dark-sapphire").
    - `name` (string): The display name of the theme.
    - `previewImageUrl` (string, uri): A URL to an image showing a preview of the theme.
    - `isPremium` (boolean): Whether the theme is a premium theme.

### `Message`
- **Description**: Represents a message sent via the contact form on a user's public portfolio.
- **Key Properties**:
    - `id` (string): A unique identifier for the message.
    - `userProfileId` (string): The ID of the portfolio owner receiving the message.
    - `name` (string): The name of the sender.
    - `email` (string): The email address of the sender.
    - `message` (string): The content of the message.
    - `createdAt` (string, date-time): Timestamp when the message was sent.
    - `read` (boolean): Flag to indicate if the message has been read.

---

## 2. Firestore Database Structure

The `firestore.structure` section in `backend.json` maps our entities to specific collection paths in Cloud Firestore. This defines our database's hierarchy and access patterns.

### `/users/{userId}`
- **Schema**: `UserProfile`
- **Description**: This is the root collection for all user data. The document ID (`userId`) is the same as the user's Firebase Authentication UID. This document stores the user's profile information, settings, and subscription details. When a user parses their CV or LinkedIn profile, the extracted `CvData` is merged into this document.

### `/users/{userId}/portfolioItems/{itemId}`
- **Schema**: `PortfolioItem`
- **Description**: This is a **sub-collection** under each user document. It stores all the portfolio items belonging to that specific user. This structure is efficient and secure, as it allows us to query for a single user's items without scanning a global collection.

### `/users/{userId}/messages/{messageId}`
- **Schema**: `Message`
- **Description**: This is a **sub-collection** under each user document for storing messages submitted via the contact form. This allows for secure, user-specific message retrieval. The security rules are configured to only allow the user to read their own messages, while writes are handled by a trusted backend process.

### `/themes/{themeId}`
- **Schema**: `Theme`
- **Description**: A top-level collection that stores all available portfolio themes. This collection is configured to be publicly readable so that themes can be displayed and selected by users in the settings.

---

## 3. Firebase Authentication

The `auth` section defines the sign-in methods enabled for the application.

- **Providers**:
    - `"password"`: Standard email and password authentication.
    - `"anonymous"`: Anonymous sign-in, which allows new visitors to explore the app in a "guest" or "read-only" mode before creating a full account.
