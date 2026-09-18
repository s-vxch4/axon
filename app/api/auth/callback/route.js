import { App } from '@octokit/app';
import { db } from '../../../../lib/db.js';

export async function POST(request) {
  const body = await request.json();
  const code = body.code || body.installation_id;

  const app = new App({
    id: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_PRIVATE_KEY,
  });

  const octokit = await app.getInstallationOctokit(code);
  const repos = await octokit.apps.listReposAccessibleToInstallation();

  for (const repo of repos.data.repositories) {
    await db.query(
      `INSERT INTO repositories (owner, repo, installation_id)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [repo.owner.login, repo.name, String(code)]
    );
  }

  return Response.redirect(new URL('/dashboard', request.url));
}
