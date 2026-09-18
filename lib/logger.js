import { randomUUID } from 'crypto';
import { db } from './db.js';

export function createIncidentId() {
  return randomUUID();
}

export async function logIncident(incidentId, message, type) {
  await db.query(
    'INSERT INTO incident_logs (incident_id, message, type) VALUES ($1, $2, $3)',
    [incidentId, message, type]
  );
}
