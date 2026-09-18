import crypto from 'crypto';
import { db } from './db.js';

export async function storeSpecBaseline(apiName, specUrl) {
  const res = await fetch(specUrl);
  const specContent = await res.text();
  const specHash = crypto.createHash('sha256').update(specContent).digest('hex');

  await db.query(
    `INSERT INTO api_specs (api_name, spec_url, spec_hash, spec_content)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (api_name)
     DO UPDATE SET spec_hash = $3, spec_content = $4, last_checked = NOW()`,
    [apiName, specUrl, specHash, specContent]
  );

  console.log(`[specs] baseline stored for ${apiName}`);
}
