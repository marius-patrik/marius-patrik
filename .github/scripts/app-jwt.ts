// Mints an app-level JSON Web Token.
//
// Only one thing needs this, and it is the thing an installation token cannot do:
// read the App's installation scope. GET /app/installations answers 401 to an
// installation token, because an installation cannot inspect itself. The
// repository sync needs that scope to know whether its repository list is
// complete, and completeness is what separates "this repository was deleted or
// renamed" from "this credential cannot see it".
//
// An app-level JWT is the only credential that can answer it, which is why the
// workflow runs this as its own step rather than handing the private key to the
// sync itself. Keep it that way: the sync receives a boolean, never a key.
import { createSign } from "node:crypto";

export interface AppCredentials {
  appId: string;
  privateKey: string;
}

// Ten minutes is GitHub's maximum and matches what the workflow needs; the token
// is minted and spent within a single step.
export function appJwt({ appId, privateKey }: AppCredentials): string {
  const base64url = (input: Buffer | string): string =>
    Buffer.from(input).toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iat: now - 60, exp: now + 540, iss: Number(appId) })
  );
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(privateKey)
    .toString("base64url");

  return `${header}.${payload}.${signature}`;
}

export function appCredentialsFromEnv(): AppCredentials {
  const appId = process.env.APP_ID?.trim();
  const privateKey = process.env.APP_PRIVATE_KEY?.trim();

  if (!appId || !privateKey) {
    throw new Error("APP_ID and APP_PRIVATE_KEY must both be set to mint an app-level token");
  }
  return { appId, privateKey };
}