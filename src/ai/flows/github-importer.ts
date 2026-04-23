/**
 * @fileOverview A Genkit flow for importing a user's public GitHub repositories.
 * It now includes AI-powered summarization of README files for project descriptions.
 *
 * - importGithubRepositories - A function that fetches and processes GitHub repositories.
 * - GithubImporterInput - The input type for the importGithubRepositories function.
 * - GithubImporterOutput - The return type for the importGithubRepositories function.
 */

import { z } from '@/ai/genkit';
import { summarizeReadme } from './readme-summarizer';

interface GithubRepoApiResponse {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  fork: boolean;
  full_name: string;
}

const GithubRepositorySchema = z.object({
  name: z.string().describe('The name of the repository.'),
  description: z.string().nullable().describe("The AI-generated summary of the repository's README or the original description."),
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

const GITHUB_API_BASE_URL = 'https://api.github.com';

export async function importGithubRepositories(
  input: GithubImporterInput
): Promise<GithubImporterOutput> {
  const headers = { 'Accept': 'application/vnd.github.v3+json' };

  const response = await fetch(
    `${GITHUB_API_BASE_URL}/users/${input.username}/repos?sort=updated&per_page=10`,
    { headers }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch repositories for user. Status: ${response.status}.`);
  }

  const repos: GithubRepoApiResponse[] = await response.json();

  const getReadmeContent = async (fullName: string, branch: string): Promise<string | null> => {
    const res = await fetch(`https://raw.githubusercontent.com/${fullName}/${branch}/README.md`);
    return res.ok ? res.text() : null;
  };

  return Promise.all(
    repos
      .filter((repo) => !repo.fork)
      .slice(0, 5)
      .map(async (repo) => {
        let description = repo.description;
        try {
          const readmeContent = (await getReadmeContent(repo.full_name, 'main')) ?? (await getReadmeContent(repo.full_name, 'master'));
          if (readmeContent?.trim()) {
            description = await summarizeReadme({ readmeContent });
          }
        } catch (error) {
          console.warn(`Could not summarize README for ${repo.name}:`, error);
        }
        return { name: repo.name, description, url: repo.html_url, language: repo.language };
      })
  );
}
