#!/usr/bin/env node
/**
 * Extrai OOXML de Docs/Proposta-TCC-Orion-Juridico.docx para Markdown.
 * Preserva ordem, headings pelos estilos do Word, listas e tabelas.
 *
 * Uso:
 *   node scripts/governance/extract-proposta-docx.cjs
 *   node scripts/governance/extract-proposta-docx.cjs --check
 */
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "../..");
const docx = path.join(root, "Docs", "Proposta-TCC-Orion-Juridico.docx");
const outMd = path.join(root, "Docs", "Proposta-TCC-Orion-Juridico.md");
const checkOnly = process.argv.includes("--check");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCodePoint(parseInt(h, 16)),
    );
}

function attr(xml, name) {
  const match = xml.match(new RegExp(`${name}="([^"]*)"`));
  return match ? decodeXml(match[1]) : null;
}

function textFromParagraph(xml) {
  const tokens = [];
  const tokenRe = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
  let match;
  while ((match = tokenRe.exec(xml))) {
    if (match[1] !== undefined) tokens.push(decodeXml(match[1]));
    else if (match[0].startsWith("<w:tab")) tokens.push("\t");
    else tokens.push("\n");
  }
  return tokens.join("").replace(/\u00a0/g, " ").trim();
}

function parseStyles(xml) {
  const styles = new Map();
  const styleRe = /<w:style\b[\s\S]*?<\/w:style>/g;
  for (const block of xml.match(styleRe) || []) {
    const open = block.match(/<w:style\b[^>]*>/)?.[0] || "";
    if (attr(open, "w:type") !== "paragraph") continue;
    const id = attr(open, "w:styleId");
    if (!id) continue;
    const nameTag = block.match(/<w:name\b[^>]*\/>/)?.[0] || "";
    const outlineTag = block.match(/<w:outlineLvl\b[^>]*\/>/)?.[0] || "";
    const name = attr(nameTag, "w:val") || id;
    const outlineValue = attr(outlineTag, "w:val");
    const outline = outlineValue === null ? null : Number(outlineValue);
    let headingLevel = Number.isInteger(outline) && outline >= 0 && outline <= 8
      ? outline + 1
      : null;
    if (!headingLevel) {
      const byName = name.match(/^(?:heading|t[ií]tulo)\s*([1-6])$/i);
      if (byName) headingLevel = Number(byName[1]);
    }
    styles.set(id, { name, headingLevel });
  }
  return styles;
}

function parseNumbering(xml) {
  const abstractLevels = new Map();
  const abstractRe = /<w:abstractNum\b[\s\S]*?<\/w:abstractNum>/g;
  for (const block of xml.match(abstractRe) || []) {
    const open = block.match(/<w:abstractNum\b[^>]*>/)?.[0] || "";
    const abstractId = attr(open, "w:abstractNumId");
    const levels = new Map();
    const levelRe = /<w:lvl\b[\s\S]*?<\/w:lvl>/g;
    for (const levelBlock of block.match(levelRe) || []) {
      const levelOpen = levelBlock.match(/<w:lvl\b[^>]*>/)?.[0] || "";
      const level = Number(attr(levelOpen, "w:ilvl") || 0);
      const fmtTag = levelBlock.match(/<w:numFmt\b[^>]*\/>/)?.[0] || "";
      const startTag = levelBlock.match(/<w:start\b[^>]*\/>/)?.[0] || "";
      levels.set(level, {
        format: attr(fmtTag, "w:val") || "bullet",
        start: Number(attr(startTag, "w:val") || 1),
      });
    }
    if (abstractId !== null) abstractLevels.set(abstractId, levels);
  }

  const numToAbstract = new Map();
  const numRe = /<w:num\b[\s\S]*?<\/w:num>/g;
  for (const block of xml.match(numRe) || []) {
    const open = block.match(/<w:num\b[^>]*>/)?.[0] || "";
    const numId = attr(open, "w:numId");
    const abstractTag = block.match(/<w:abstractNumId\b[^>]*\/>/)?.[0] || "";
    const abstractId = attr(abstractTag, "w:val");
    if (numId !== null && abstractId !== null) numToAbstract.set(numId, abstractId);
  }
  return { abstractLevels, numToAbstract };
}

function paragraphMetadata(xml, styles, numbering, counters) {
  const styleTag = xml.match(/<w:pStyle\b[^>]*\/>/)?.[0] || "";
  const styleId = attr(styleTag, "w:val");
  const style = styles.get(styleId) || { name: styleId || "Normal", headingLevel: null };
  const numIdTag = xml.match(/<w:numId\b[^>]*\/>/)?.[0] || "";
  const levelTag = xml.match(/<w:ilvl\b[^>]*\/>/)?.[0] || "";
  const numId = attr(numIdTag, "w:val");
  const level = Number(attr(levelTag, "w:val") || 0);
  let list = null;
  if (numId !== null) {
    const abstractId = numbering.numToAbstract.get(numId);
    const levelDef = numbering.abstractLevels.get(abstractId)?.get(level) || {
      format: "bullet",
      start: 1,
    };
    const key = `${numId}:${level}`;
    const current = counters.has(key) ? counters.get(key) + 1 : levelDef.start;
    counters.set(key, current);
    const ordered = !["bullet", "none"].includes(levelDef.format);
    list = { level, marker: ordered ? `${current}.` : "-", format: levelDef.format };
  }
  return { styleName: style.name, headingLevel: style.headingLevel, list };
}

function escapeCell(value) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

function extractTable(xml, structuralText) {
  const rows = [];
  const rowRe = /<w:tr\b[\s\S]*?<\/w:tr>/g;
  for (const rowBlock of xml.match(rowRe) || []) {
    const cells = [];
    const cellRe = /<w:tc\b[\s\S]*?<\/w:tc>/g;
    for (const cellBlock of rowBlock.match(cellRe) || []) {
      const paragraphs = [];
      const paragraphRe = /<w:p\b[\s\S]*?<\/w:p>/g;
      for (const paragraphBlock of cellBlock.match(paragraphRe) || []) {
        const text = textFromParagraph(paragraphBlock);
        if (text) paragraphs.push(text);
      }
      const cellText = paragraphs.join("\n");
      structuralText.push(`cell:${cellText}`);
      cells.push(cellText);
    }
    rows.push(cells);
  }
  const columns = Math.max(0, ...rows.map((row) => row.length));
  for (const row of rows) while (row.length < columns) row.push("");
  if (!rows.length || !columns) return [];
  const output = [];
  output.push(`| ${rows[0].map(escapeCell).join(" | ")} |`);
  output.push(`| ${rows[0].map(() => "---").join(" | ")} |`);
  for (const row of rows.slice(1)) output.push(`| ${row.map(escapeCell).join(" | ")} |`);
  return output;
}

function buildMarkdown(parts, sourceBuffer) {
  const styles = parseStyles(parts.styles);
  const numbering = parseNumbering(parts.numbering);
  const counters = new Map();
  const structuralText = [];
  const body = parts.document.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)?.[1];
  if (!body) throw new Error("w:body não encontrado em document.xml");

  const content = [];
  const metrics = { paragraphs: 0, headings: 0, lists: 0, tables: 0 };
  const childRe = /<w:p\b[\s\S]*?<\/w:p>|<w:tbl\b[\s\S]*?<\/w:tbl>/g;
  for (const block of body.match(childRe) || []) {
    if (block.startsWith("<w:tbl")) {
      metrics.tables += 1;
      structuralText.push("table:start");
      content.push(...extractTable(block, structuralText), "");
      structuralText.push("table:end");
      continue;
    }
    metrics.paragraphs += 1;
    const text = textFromParagraph(block);
    if (!text) continue;
    const meta = paragraphMetadata(block, styles, numbering, counters);
    structuralText.push(
      `paragraph:${meta.styleName}:${meta.headingLevel || 0}:${meta.list?.format || "none"}:${text}`,
    );
    if (meta.headingLevel) {
      metrics.headings += 1;
      content.push(`${"#".repeat(Math.min(meta.headingLevel, 6))} ${text}`, "");
    } else if (meta.list) {
      metrics.lists += 1;
      content.push(`${"  ".repeat(meta.list.level)}${meta.list.marker} ${text}`);
    } else {
      content.push(text, "");
    }
  }

  const sourceSha256 = sha256(sourceBuffer);
  const structureSha256 = sha256(structuralText.join("\n"));
  const header = [
    "<!--",
    "  Arquivo gerado de forma determinística a partir do DOCX. Não editar manualmente.",
    `  source-docx-sha256: ${sourceSha256}`,
    `  extracted-structure-sha256: ${structureSha256}`,
    `  paragraphs: ${metrics.paragraphs}; headings: ${metrics.headings}; lists: ${metrics.lists}; tables: ${metrics.tables}`,
    "-->",
    "",
  ];
  return {
    markdown: [...header, ...content].join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n",
    metrics,
    sourceSha256,
    structureSha256,
  };
}

function extractParts() {
  if (!fs.existsSync(docx)) throw new Error(`DOCX não encontrado: ${docx}`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "proposta-orion-"));
  const zipPath = path.join(tmp, "doc.zip");
  fs.copyFileSync(docx, zipPath);
  try {
    try {
      execFileSync("tar", ["-xf", zipPath, "-C", tmp], { stdio: "pipe" });
    } catch {
      const escapedZip = zipPath.replace(/'/g, "''");
      const escapedTmp = tmp.replace(/'/g, "''");
      execFileSync(
        "powershell",
        ["-NoProfile", "-Command", `Expand-Archive -LiteralPath '${escapedZip}' -DestinationPath '${escapedTmp}' -Force`],
        { stdio: "pipe" },
      );
    }
    const readPart = (relative, required = true) => {
      const file = path.join(tmp, ...relative.split("/"));
      if (!fs.existsSync(file)) {
        if (required) throw new Error(`${relative} não encontrado no DOCX`);
        return "";
      }
      return fs.readFileSync(file, "utf8");
    };
    return {
      sourceBuffer: fs.readFileSync(docx),
      document: readPart("word/document.xml"),
      styles: readPart("word/styles.xml"),
      numbering: readPart("word/numbering.xml", false),
    };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

try {
  const parts = extractParts();
  const result = buildMarkdown(parts, parts.sourceBuffer);
  if (checkOnly) {
    if (!fs.existsSync(outMd)) throw new Error(`Markdown extraído não encontrado: ${outMd}`);
    const current = fs.readFileSync(outMd, "utf8");
    if (current !== result.markdown) {
      throw new Error("Markdown diverge do DOCX; execute `npm run proposta:extract`.");
    }
    console.log(JSON.stringify({ ok: true, checkOnly, ...result.metrics, sourceSha256: result.sourceSha256, structureSha256: result.structureSha256 }, null, 2));
    console.log("OK: extração Markdown corresponde estruturalmente ao DOCX.");
  } else {
    fs.writeFileSync(outMd, result.markdown, "utf8");
    console.log(JSON.stringify({ ok: true, checkOnly, output: path.relative(root, outMd).replace(/\\/g, "/"), ...result.metrics, sourceSha256: result.sourceSha256, structureSha256: result.structureSha256 }, null, 2));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
