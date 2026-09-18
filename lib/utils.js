export function extractJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    // fall through
  }

  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (_) {
    // fall through
  }

  console.warn('extractJSON: failed to parse JSON. First 200 chars:', raw.slice(0, 200));
  return [];
}
