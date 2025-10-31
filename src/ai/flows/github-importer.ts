
'use server';

/**
 * @fileOverview A Genkit flow for importing a user's public GitHub repositories.
 * It now includes AI-powered summarization of README files for project descriptions.
 *
 * - importGithubRepositories - A function that fetches and processes GitHub repositories.
 * - GithubImporterInput - The input type for the importGithubRepositories function.
 * - GithubImporterOutput - The return type for the importGithubRepositories function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { summarizeReadme } from './readme-summarizer';

const GithubRepositorySchema = z.object({
  name: z.string().describe('The name of the repository.'),
  description: z.string().nullable().describe('The AI-generated summary of the repository\'s README.'),
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
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=10`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories for user: ${username}`);
    }

    const repos: any[] = await response.json();

    const processedRepos = await Promise.all(
      repos
        .filter((repo: any) => !repo.fork)
        .slice(0, 5) // Limit to top 5 to avoid long processing times & API limits
        .map(async (repo: any) => {
          let description = repo.description;
          try {
            // Attempt to fetch and summarize the README
            const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/master/README.md`;
            const readmeResponse = await fetch(readmeUrl);
            if (readmeResponse.ok) {
              const readmeContent = await readmeResponse.text();
              if (readmeContent.trim()) {
                description = await summarizeReadme({ readmeContent });
              }
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
