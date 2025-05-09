
/**
 * Ensures that a value is treated as an object.
 * This is useful when dealing with potentially null/undefined values from the database,
 * especially in join queries or JSON columns.
 */
export function ensureObject<T>(value: T | null | undefined): T {
  return value as T;
}
