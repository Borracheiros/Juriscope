#!/usr/bin/env node
/** Cria/verifica baseline SHA-256 append-only de Docs/audits/codex. */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const auditRoot = path.join(root, "Docs", "audits", "codex");
const manifestPath = path.join(auditRoot, "MANIFEST.sha256.json");
const writeMode = process.argv.includes("--write");

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute));
    else if (absolute !== manifestPath) files.push(absolute);
  }
  return files;
}

function snapshot() {
  if (!fs.existsSync(auditRoot)) throw new Error(`Diretório ausente: ${auditRoot}`);
  const files = walk(auditRoot)
    .map((absolute) => ({
      path: path.relative(auditRoot, absolute).replace(/\\/g, "/"),
      bytes: fs.statSync(absolute).size,
      sha256: sha256(absolute),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  return { version: 1, algorithm: "sha256", scope: "Docs/audits/codex", fileCount: files.length, files };
}

try {
  const current = snapshot();
  if (writeMode) {
    fs.writeFileSync(manifestPath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
    console.log(`OK: manifesto criado com ${current.fileCount} arquivos.`);
    console.log(path.relative(root, manifestPath).replace(/\\/g, "/"));
  } else {
    if (!fs.existsSync(manifestPath)) {
      throw new Error("Manifesto ausente; execute `npm run audit:evidence:manifest` antes da baseline.");
    }
    const expected = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const expectedByPath = new Map(expected.files.map((entry) => [entry.path, entry]));
    const currentByPath = new Map(current.files.map((entry) => [entry.path, entry]));
    const missing = expected.files.filter((entry) => !currentByPath.has(entry.path)).map((entry) => entry.path);
    const extra = current.files.filter((entry) => !expectedByPath.has(entry.path)).map((entry) => entry.path);
    const changed = current.files
      .filter((entry) => expectedByPath.has(entry.path) && (expectedByPath.get(entry.path).sha256 !== entry.sha256 || expectedByPath.get(entry.path).bytes !== entry.bytes))
      .map((entry) => entry.path);
    const ok = missing.length === 0 && extra.length === 0 && changed.length === 0 && expected.fileCount === current.fileCount;
    console.log(JSON.stringify({ ok, expectedFiles: expected.fileCount, currentFiles: current.fileCount, missing, extra, changed }, null, 2));
    if (!ok) throw new Error("Evidência de auditoria divergiu da baseline append-only.");
    console.log("OK: pacotes Codex correspondem ao manifesto SHA-256.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
