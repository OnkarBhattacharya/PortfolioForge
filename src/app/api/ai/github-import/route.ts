import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { openrouterAI } from '@/lib/ai';
import { z } from 'zod';

const GithubImportInputSchema = z.object({
  username: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }
  
  const parsed = GithubImportInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  try {
    // Fetch repos from GitHub API
    const response = await fetch(
      `https://api.github.com/users/${parsed.data.username}/repos?sort=updated&per_page=20`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorBody.message || 'Failed to fetch GitHub repositories' },
        { status: response.status }
      );
    }
    
    const repos = await response.json();
    const filteredRepos = repos
      .filter((r: any) => !r.fork)
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        language: r.language,
        stargazers_count: r.stargazers_count,
      }));
    
    const data = await openrouterAI.importGitHub(user.id, filteredRepos);
    
    // Create portfolio items from imported repos
    const items = data.repos.map((repo, index) => ({
      user_id: user.id,
      title: repo.name,
      description: repo.description,
      tags: repo.language ? [repo.language] : [],
      project_url: repo.url,
      repo_url: repo.url,
      sort_order: index,
    }));
    
    if (items.length > 0) {
      await supabase.from('portfolio_items').insert(items);
    }
    
    return NextResponse.json({ success: true, data: { imported: items.length } });
  } catch (error) {
    console.error('GitHub import error:', error);
    const message = error instanceof Error ? error.message : 'Failed to import from GitHub';
    const status = message.includes('rate limit') ? 429 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}