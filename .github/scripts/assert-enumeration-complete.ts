// Proves that the repository list the sync works from is complete, and writes
// that conclusion to GITHUB_OUTPUT as UMBRELLA_ENUMERATION_COMPLETE.
//
// Why this exists as a separate step: the sync's only destructive operation is
// removing a submodule whose repository is absent from the list. An App installed
// on a subset still authenticates, still returns 200, and still returns a short
// list, so "no error" is not evidence that a repository is gone. Reading the
// installation's `repository_selection` is the only positive proof available,
// and an installation token is refused by that endpoint -- it needs an app-level
// JWT, which is why this runs before the sync rather than inside it.
//
// Deliberately narrow: it reads one field and exits. It does not enumerate
// repositories, and it never receives an installation token.
import { appCredentialsFromEnv, appJwt } from "./app-jwt.ts";

interface Installation {
  id: number;
  account: { login: string };
  repository_selection: "all" | "selected";
}

async function fetchInstallations(token: string): Promise<Installation[]> {
  const response = await fetch("https://api.github.com/app/installations", {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "marius-patrik-umbrella"
    }
  });

  if (!response.ok) {
    throw new Error(`GET /app/installations failed with ${response.status}`);
  }
  return (await response.json()) as Installation[];
}

async function main(): Promise<void> {
  const token = appJwt(appCredentialsFromEnv());
  const installations = await fetchInstallations(token);

  if (installations.length === 0) {
    throw new Error("the App has no installations, so it can see no repositories at all");
  }

  const narrow = installations.filter(
    (installation) => installation.repository_selection !== "all"
  );

  for (const installation of installations) {
    console.log(
      `installation ${installation.id} (${installation.account.login}): ${installation.repository_selection}`
    );
  }

  const complete = narrow.length === 0;
  console.log(
    complete
      ? "every installation covers all repositories; the repository list is complete"
      : `${narrow.length} installation(s) cover only selected repositories; the list is NOT complete`
  );

  // Written even when false. A falsy conclusion has to reach the sync as an
  // explicit "not proven" rather than as a missing variable, so that the sync
  // refuses removals rather than assuming completeness by omission.
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(process.env.GITHUB_OUTPUT, `complete=${complete}\n`);
  }

  if (!complete) {
    console.error(
      "\nerror: the App is not installed on all repositories. Widen it at " +
        "Settings -> Your Account -> Installations -> Configure -> All repositories. " +
        "The sync will refuse to remove submodules until this is true, which is the " +
        "correct outcome: a partial list must never be read as a set of deletions."
    );
    process.exit(1);
  }
}

main().catch((error: Error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});