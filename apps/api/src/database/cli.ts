import { loadEnv } from "@juridico-ia/config";
import { pendingCount, runMigrations, schemaFingerprint, showMigrations } from "./migrator";

async function main() {
  const cmd = process.argv[2] ?? "show";
  const env = loadEnv(process.env);
  if (cmd === "run") {
    const result = await runMigrations(env.DATABASE_URL);
    console.log(JSON.stringify({ ...result, fingerprint: schemaFingerprint() }));
    return;
  }
  if (cmd === "show") {
    console.log(JSON.stringify(await showMigrations(env.DATABASE_URL), null, 2));
    return;
  }
  if (cmd === "pending") {
    const n = await pendingCount(env.DATABASE_URL);
    console.log(JSON.stringify({ pending: n, fingerprint: schemaFingerprint() }));
    if (n !== 0) process.exit(1);
    return;
  }
  if (cmd === "fingerprint") {
    console.log(schemaFingerprint());
    return;
  }
  throw new Error(`Unknown command ${cmd}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
