#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "dist", ".next", "coverage", "docker/postgres-data"]);
const PATTERNS = [
  { id: "pem", re: /-----BEGIN (?:RSA )?PRIVATE KEY-----/ },
  { id: "aws", re: /AKIA[0-9A-Z]{16}/ },
  { id: "generic-secret", re: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{12,}['"]/i },
];

const ALLOW = [
  path.normalize("apps/api/test/fixtures.ts"),
  path.normalize("apps/api/test/foundation.test.ts"),
  path.normalize(".env.example"),
];

let hits = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|js|cjs|mjs|json|yml|yaml|md|env)$/i.test(name)) continue;
    if (ALLOW.some((a) => rel.replace(/\\/g, "/").endsWith(a.replace(/\\/g, "/")))) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const p of PATTERNS) {
      if (p.re.test(text)) {
        console.error(`[secret-scan] ${p.id} in ${rel}`);
        hits += 1;
      }
    }
  }
}

walk(ROOT);
if (hits > 0) {
  process.exit(1);
}
console.log("secret-scan: ok");
