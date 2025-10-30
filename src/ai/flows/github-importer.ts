
'use server';

/**
 * @fileOverview A Genkit flow for importing a user's public GitHub repositories.
 *
 * - importGithubRepositories - A function that fetches and processes GitHub repositories.
 * - GithubImporterInput - The input type for the importGithubRepositories function.
 * - GithubImporterOutput - The return type for the importGithubRepositories function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GithubRepositorySchema = z.object({
  name: z.string().describe('The name of the repository.'),
  description: z.string().nullable().describe('The description of the repository.'),
  url: z.string().url().describe('The URL of the repository.'),
  language: z.string().nullable().describe('The primary programming language of the repository.'),
});

const GithubImporterInputSchema = z.object({
  username: z.string().describe('The GitHub username.'),
});

const GithubImporterOutputSchema = z.array(GithubRepositorySchema);

export type GithubImporterInput = z.infer<typeof GithubImporterInputSchema>;
export type GithubImporterOutput = z.infer<typeof GithubImporterOutputSchema>;
export type GithubRepository = z.infer<typeof GithubRepositorySchema>;

export async function importGithubRepositories(
  input: GithubImporterInput
): Promise<GithubImporterOutput> {
  return githubImporterFlow(input);
}

const githubImporterFlow = ai.defineFlow(
  {
    name: 'githubImporterFlow',
    inputSchema: GithubImporterInputSchema,
    outputSchema: GithubImporterOutputSchema,
  },
  async ({ username }) => {
    // Note: In a production app, you would use an authenticated request with an OAuth token.
    // This uses the unauthenticated API, which has a lower rate limit.
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=10`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories for user: ${username}`);
    }

    const repos = await response.json();

    return repos
      .filter((repo: any) => !repo.fork && repo.description)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
      }))
      .slice(0, 10); // Limit to top 10 relevant repos
  }
);
