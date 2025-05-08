
/**
 * Ensures that an object is treated as an object, not an array
 * This is particularly useful when working with Supabase nested join results
 * where sometimes a relation returns as an array when we're expecting a single object
 */
export function ensureObject<T>(obj: T | T[]): T {
  if (Array.isArray(obj)) {
    return obj[0] || {} as T;
  }
  return obj;
}
