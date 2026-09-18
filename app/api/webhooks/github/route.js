import { db } from '../../../../lib/db.js';
import { checkSpecForChanges } from '../../../../lib/monitor.js';

export async function POST(request) {
  const event = request.headers.get('x-github-event');
  const payload = await request.json();

  if (event === 'push') {
    const repoName = payload.repository?.name;
    if (repoName) {
      const specs = await db.query(
        'SELECT * FROM api_specs WHERE api_name = $1',
        [repoName]
      );
      if (specs && specs.length > 0) {
        for (const spec of specs) {
          checkSpecForChanges(spec).catch((err) =>
            console.error('[webhook] checkSpecForChanges error:', err.message)
          );
        }
      }
    }
  }

  return Response.json({ ok: true });
}
