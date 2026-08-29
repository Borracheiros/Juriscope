#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");
const { scanText, BEGIN, END, scanRepository } = require("./secret-scan.cjs");

/* SECRET_SCAN_ALLOW_SYNTHETIC_BEGIN */
const POSITIVE_SQL = "CREATE ROLE x LOGIN PASSWORD 'juridico_app';";
const POSITIVE_URL = "postgresql://juridico:juridico@127.0.0.1:5432/db";
const POSITIVE_GENERIC = 'password = "SyntheticPass1!"';
const ALLOWED_BLOCK = `${BEGIN}\nexport const SYNTHETIC_PASSWORD = "SyntheticPass1!";\n${END}\n`;
/* SECRET_SCAN_ALLOW_SYNTHETIC_END */

function run() {
  assert.ok(scanText(POSITIVE_SQL, "bad.sql").some((h) => h.id === "sql-password"));
  assert.ok(scanText(POSITIVE_URL, ".env.example").some((h) => h.id === "pg-url-credentials"));
  assert.strictEqual(
    scanText("DATABASE_APP_URL=postgresql://juridico_app@127.0.0.1:5432/juridico_ia\n", ".env.example").filter(
      (h) => h.id === "pg-url-credentials",
    ).length,
    0,
  );
  assert.ok(scanText(POSITIVE_GENERIC, "x.ts").length > 0);
  assert.strictEqual(scanText(ALLOWED_BLOCK, "fixtures.ts").length, 0);
  assert.ok(scanText(POSITIVE_SQL, ".env.example").some((h) => h.id === "sql-password"));

  const hits = scanRepository(path.resolve(__dirname, ".."));
  assert.strictEqual(hits.length, 0, `unexpected hits: ${JSON.stringify(hits)}`);

  console.log("secret-scan tests: ok");
}

run();
