function readApiKey(): string {
  return process.env.FAST_APPLY_API_KEY || "optional-api-key";
}

function readUrl(): string {
  return (process.env.FAST_APPLY_URL || "http://localhost:1234/v1").replace(/\/v1\/?$/, "");
}

function readModel(): string {
  return process.env.FAST_APPLY_MODEL || "fastapply-1.5b";
}

export const FAST_APPLY_API_KEY = readApiKey;

export const FAST_APPLY_URL = readUrl;

export const FAST_APPLY_MODEL = readModel;
