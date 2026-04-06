import fs from "fs";
import path from "path";

type AuthToken = {
  sub: string;
  name: string;
  email: string;
  picture?: string;
};

const DEFAULT_BLOOM_FRONTEND_DIR = "C:\\Users\\user\\Documents\\Coding\\bloom\\frontend";
const DEFAULT_SESSION_COOKIE = "authjs.session-token";

function parseEnvFile(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const result: Record<string, string> = {};
  const content = fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    result[key] = value;
  }

  return result;
}

function getBloomFrontendDir() {
  return process.env.BLOOM_FRONTEND_DIR || DEFAULT_BLOOM_FRONTEND_DIR;
}

function getAuthSecret() {
  if (process.env.BLOOM_AUTH_SECRET) {
    return process.env.BLOOM_AUTH_SECRET;
  }

  const frontendDir = getBloomFrontendDir();
  const mergedEnv = {
    ...parseEnvFile(path.join(frontendDir, ".env")),
    ...parseEnvFile(path.join(frontendDir, ".env.local")),
  };

  const secret = mergedEnv.AUTH_SECRET || mergedEnv.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      `Unable to find AUTH_SECRET for Bloom. Set BLOOM_AUTH_SECRET or BLOOM_FRONTEND_DIR.`
    );
  }

  return secret;
}

function getCookieName(baseUrl: string) {
  return new URL(baseUrl).protocol === "https:" ? "__Secure-authjs.session-token" : DEFAULT_SESSION_COOKIE;
}

export function buildTestUser(seed: string) {
  const normalized = seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "scenario";
  const stamp = Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);
  const userId = `ui-${normalized}-${stamp}-${suffix}`;

  return {
    id: userId,
    name: "UI Automation",
    email: `${userId}@example.com`,
  };
}

export async function createSessionCookie(baseUrl: string, token: AuthToken) {
  const secret = getAuthSecret();
  const cookieName = getCookieName(baseUrl);
  const authCoreJwtPath = path.join(getBloomFrontendDir(), "node_modules", "@auth", "core", "jwt.js");
  const { encode } = await import(authCoreJwtPath);

  const value = await encode({
    secret,
    salt: cookieName,
    token,
  });

  const url = new URL(baseUrl);
  const expires = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  return {
    name: cookieName,
    value,
    domain: url.hostname,
    path: "/",
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "Lax" as const,
    expires,
  };
}
