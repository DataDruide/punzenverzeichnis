/**
 * Environment variable validation
 * Validates that all required environment variables are present at runtime
 */

const requiredEnvVars = [
  'VITE_SUPABASE_PROJECT_ID',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_URL',
] as const;

export interface ValidatedEnv {
  VITE_SUPABASE_PROJECT_ID: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_SUPABASE_URL: string;
}

/**
 * Validates environment variables at runtime
 * Throws an error if any required variable is missing
 */
export function validateEnv(): ValidatedEnv {
  const missing: string[] = [];

  requiredEnvVars.forEach((key) => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(message);
    throw new Error(message);
  }

  return {
    VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  };
}

/**
 * Get validated environment safely
 * Returns null if validation fails (graceful degradation)
 */
export function getSafeEnv(): ValidatedEnv | null {
  try {
    return validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    return null;
  }
}
