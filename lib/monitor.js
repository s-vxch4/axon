import { execSync } from 'child_process';
import fs from 'fs';
import crypto from 'crypto';
import { db } from './db.js';
import { logIncident } from './logger.js';
import { triggerFixPipeline } from './pipeline.js';

export async function checkSpecForChanges(spec) {
  const res = await fetch(spec.spec_url);
  const newSpecContent = await res.text();
  const newHash = crypto.createHash('sha256').update(newSpecContent).digest('hex');

  if (newHash === spec.spec_hash) {
    return;
  }

  const oldSpecPath = '/tmp/old-spec.yaml';
  const newSpecPath = '/tmp/new-spec.yaml';
  fs.writeFileSync(oldSpecPath, spec.spec_content);
  fs.writeFileSync(newSpecPath, newSpecContent);

  let breakingChanges = [];
  try {
    execSync('oasdiff breaking /tmp/old-spec.yaml /tmp/new-spec.yaml -f json', {
      timeout: 30000,
    });
  } catch (err) {
    const stdout = err.stdout ? err.stdout.toString() : '';
    try {
      const parsed = JSON.parse(stdout);
      breakingChanges = parsed.breakingChanges || parsed || [];
    } catch (_) {
      breakingChanges = [];
    }
  }

  await db.query(
    'UPDATE api_specs SET spec_hash = $1, spec_content = $2, last_checked = NOW() WHERE api_name = $3',
    [newHash, newSpecContent, spec.api_name]
  );

  if (breakingChanges.length > 0) {
    await triggerFixPipeline(spec.api_name, breakingChanges, newSpecContent);
  }
}
