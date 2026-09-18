import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';

const appId = process.env.GITHUB_APP_ID;
const privateKey = process.env.GITHUB_PRIVATE_KEY;

let app;

function getApp() {
  if (!app) {
    app = new App({ id: appId, privateKey });
  }
  return app;
}

export async function getInstallationOctokit(installationId) {
  const octokit = await getApp().getInstallationOctokit(installationId);
  return octokit;
}

export async function getAuthenticatedOctokit(token) {
  return new Octokit({ auth: token });
}

export { getApp };
