/**
 * Runtime environment configuration
 * All values are embedded at build time from .env
 */

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL!,
  APP_URL: process.env.NEXT_PUBLIC_ADDRESS!,
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
} as const;

// Validate required env vars
if (!ENV.API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is required but not set");
}

if (!ENV.APP_URL) {
  throw new Error("NEXT_PUBLIC_ADDRESS is required but not set");
}
