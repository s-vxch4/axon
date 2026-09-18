import cron from 'node-cron';
import { db } from './db.js';
import { checkSpecForChanges } from './monitor.js';

const schedule = process.env.NODE_ENV === 'development' ? '*/2 * * * *' : '0 */6 * * *';

export function startCron() {
  cron.schedule(schedule, async () => {
    console.log('[cron] running spec checks...');
    try {
      const specs = await db.query('SELECT * FROM api_specs');
      for (const spec of specs) {
        try {
          await checkSpecForChanges(spec);
        } catch (err) {
          console.error(`[cron] error checking ${spec.api_name}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[cron] error:', err.message);
    }
  });

  console.log(`[cron] scheduled: ${schedule}`);
}
