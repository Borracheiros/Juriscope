#!/usr/bin/env node
/**
 * Sincroniza skills canônicas (.cursor/skills) → espelho Codex (.agents/skills).
 *
 * Uso:
 *   node scripts/governance/sync-agent-skills.cjs          # copia + verifica
 *   node scripts/governance/sync-agent-skills.cjs --check  # só verifica (exit 1 se divergir)
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "../..");
const srcRoot = path.join(root, ".cursor", "skills");
const dstRoot = path.join(root, ".agents", "skills");
const checkOnly = process.argv.includes("--check");

function listSkills(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(dir, name, "SKILL.md")))
    .sort();
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

const srcSkills = listSkills(srcRoot);
if (srcSkills.length === 0) {
  console.error("Nenhuma skill em", srcRoot);
  process.exit(1);
}

ensureDir(dstRoot);

const dstSkills = listSkills(dstRoot);
const report = {
  canonical: ".cursor/skills",
  mirror: ".agents/skills",
  synced: [],
  diverged: [],
  missingInMirror: [],
  extraInMirror: [],
};

for (const name of srcSkills) {
  const src = path.join(srcRoot, name, "SKILL.md");
  const dstDir = path.join(dstRoot, name);
  const dst = path.join(dstDir, "SKILL.md");

  if (!fs.existsSync(dst)) {
    report.missingInMirror.push(name);
    if (!checkOnly) {
      ensureDir(dstDir);
      fs.copyFileSync(src, dst);
      report.synced.push(name);
    }
    continue;
  }

  const a = sha256(src);
  const b = sha256(dst);
  if (a !== b) {
    report.diverged.push(name);
    if (!checkOnly) {
      fs.copyFileSync(src, dst);
      report.synced.push(name);
    }
  }
}

for (const name of dstSkills) {
  if (!srcSkills.includes(name)) report.extraInMirror.push(name);
}

if (!checkOnly) {
  // Re-hash after copy
  report.diverged = [];
  report.missingInMirror = [];
  for (const name of srcSkills) {
    const src = path.join(srcRoot, name, "SKILL.md");
    const dst = path.join(dstRoot, name, "SKILL.md");
    if (!fs.existsSync(dst) || sha256(src) !== sha256(dst)) {
      report.diverged.push(name);
    }
  }
}

const ok =
  report.diverged.length === 0 &&
  (checkOnly ? report.missingInMirror.length === 0 : true) &&
  report.extraInMirror.length === 0;

console.log(JSON.stringify({ ok, checkOnly, skills: srcSkills.length, ...report }, null, 2));

if (!ok) {
  console.error(
    checkOnly
      ? "Divergência: rode `npm run skills:sync` para alinhar o espelho."
      : "Falha ao sincronizar skills.",
  );
  process.exit(1);
}

console.log(
  checkOnly
    ? "OK: .cursor/skills e .agents/skills estão byte-identical."
    : "OK: espelho .agents/skills sincronizado a partir de .cursor/skills.",
);
