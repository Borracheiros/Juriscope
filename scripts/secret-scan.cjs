#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".next", "coverage", "docker/postgres-data"]);
const BEGIN = "SECRET_SCAN_ALLOW_SYNTHETIC_BEGIN";
const END = "SECRET_SCAN_ALLOW_SYNTHETIC_END";

const PATTERNS = [
  { id: "pem", re: /-----BEGIN (?:RSA )?PRIVATE KEY-----/ },
  { id: "aws", re: /AKIA[0-9A-Z]{16}/ },
  { id: "generic-secret", re: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{12,}['"]/i },
  { id: "sql-password", re: /\bPASSWORD\s+'[^']+'/i },
  { id: "pg-url-credentials", re: /postgres(?:ql)?:\/\/[^/\s:]+:[^@\s/]+@/i },
];

function stripAllowed(text) {
  const re = new RegExp(`${BEGIN}[\\s\\S]*?${END}`, "g");
  return text.replace(re, "");
}

function scanText(text, relPath = "<memory>") {
  const cleaned = stripAllowed(text);
  const hits = [];
  for (const p of PATTERNS) {
    if (p.re.test(cleaned)) {
      hits.push({ id: p.id, path: relPath });
    }
  }
  return hits;
}

function shouldScanFile(name) {
  return /\.(ts|tsx|js|cjs|mjs|json|yml|yaml|md|env|sql|sh|example)$/i.test(name) || name === ".env.example";
}

function walk(dir, hits) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full).replace(/\\/g, "/");
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walk(full, hits);
      continue;
    }
    if (!shouldScanFile(name) && !rel.endsWith(".env.example")) continue;
    const text = fs.readFileSync(full, "utf8");
    hits.push(...scanText(text, rel));
  }
}

function scanRepository(root = ROOT) {
  const hits = [];
  walk(root, hits);
  return hits;
}

module.exports = { PATTERNS, stripAllowed, scanText, scanRepository, BEGIN, END };

if (require.main === module) {
  const hits = scanRepository();
  for (const h of hits) {
    console.error(`[secret-scan] ${h.id} in ${h.path}`);
  }
  if (hits.length > 0) process.exit(1);
  console.log("secret-scan: ok");
}
