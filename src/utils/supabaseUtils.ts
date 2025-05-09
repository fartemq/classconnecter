/**
 * Ensures that a value is treated as an object.
 * This is useful when dealing with potentially null/undefined values from the database,
 * especially in join queries or JSON columns.
 */
export function ensureObject<T>(value: T | null | undefined): T {
  return value as T;
}

/**
 * Ensures that an array with a single item is accessed correctly.
 * This is especially useful when dealing with nested JSON objects returned as arrays from Supabase joins.
 */
export function ensureSingleObject<T>(arrayOrObject: T | T[] | null | undefined): T {
  if (!arrayOrObject) return {} as T;
  
  // If it's already an array, return the first item or an empty object
  if (Array.isArray(arrayOrObject)) {
    return arrayOrObject.length > 0 ? arrayOrObject[0] : {} as T;
  }
  
  // Otherwise, return the object itself
  return arrayOrObject;
}
