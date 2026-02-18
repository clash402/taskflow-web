const DEFAULT_API_BASE_URL = "http://localhost:8000";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const USE_LOCAL_API_IN_PROD = process.env.NEXT_PUBLIC_USE_LOCAL_API_IN_PROD === "true";

export const API_BASE_URL = trimTrailingSlash(configuredApiBaseUrl || DEFAULT_API_BASE_URL);

if (!configuredApiBaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(`NEXT_PUBLIC_API_BASE_URL is not set. Falling back to ${DEFAULT_API_BASE_URL}.`);
}
