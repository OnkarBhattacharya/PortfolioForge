/**
 * @fileOverview A Genkit flow for importing a user's public GitHub repositories.
 * It now includes AI-powered summarization of README files for project descriptions.
 *
 * - importGithubRepositories - A function that fetches and processes GitHub repositories.
 * - GithubImporterInput - The input type for the importGithubRepositories function.
 * - GithubImporterOutput - The return type for the importGithubRepositories function.
 */

import { ai } from '@/ai/genkit';
import { z } from '@/ai/genkit';
import { summarizeReadme } from './readme-summarizer';

// For better type safety, define an interface for the GitHub API response.
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

export async function importGithubRepositories(
  input: GithubImporterInput
): Promise<GithubImporterOutput> {
  return githubImporterFlow(input);
}

const GITHUB_API_BASE_URL = 'https://api.github.com';

const githubImporterFlow = ai.defineFlow(
  {
    name: 'githubImporterFlow',
    inputSchema: GithubImporterInputSchema,
    outputSchema: GithubImporterOutputSchema,
  },
  async ({ username }) => {
    // For higher rate limits, you should use a GitHub personal access token.
    // Store it in your environment variables (e.g., GITHUB_TOKEN) and use it in the headers.
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      // 'Authorization': `token ${process.env.GITHUB_TOKEN}`, // Uncomment and set GITHUB_TOKEN
    };

    const response = await fetch(
      `${GITHUB_API_BASE_URL}/users/${username}/repos?sort=updated&per_page=10`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch repositories for user: ${username}. Status: ${response.status}. Details: ${errorText}`);
    }

    const repos: GithubRepoApiResponse[] = await response.json();

    const processedRepos = await Promise.all(
      repos
        .filter((repo) => !repo.fork)
        .slice(0, 5) // Limit to top 5 to avoid long processing times & API limits
        .map(async (repo) => {
          let description = repo.description; // Default to the repo description

          const getReadmeContent = async (branch: string): Promise<string | null> => {
            const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/${branch}/README.md`;
            const readmeResponse = await fetch(readmeUrl);
            if (readmeResponse.ok) {
              return readmeResponse.text();
            }
            return null;
          };

          try {
            // Try fetching README from 'main' then 'master' branch
            const readmeContent = (await getReadmeContent('main')) ?? (await getReadmeContent('master'));

            if (readmeContent && readmeContent.trim()) {
              // If README content is available, summarize it for a better description
              description = await summarizeReadme({ readmeContent });
            }
          } catch (error) {
            console.warn(`Could not summarize README for ${repo.name}:`, error);
            // Fallback to the original GitHub description if summarization fails
          }
          
          return {
            name: repo.name,
            description: description,
            url: repo.html_url,
            language: repo.language,
          };
        })
    );

    return processedRepos;
  }
);
