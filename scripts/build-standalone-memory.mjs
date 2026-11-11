/**
 * Generates a single-file LaTeX source for Codex's standalone compiler.
 * The editable source remains memoria/main.tex with modular chapters.
 * This generator recursively expands \input directives and replaces the
 * BibTeX call with a static bibliography derived from bibliografia.bib.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

// Resolve from this script rather than the shell's working directory so the
// command works consistently from the project root or from memoria/.
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const memoryRoot = resolve(projectRoot, "memoria");
const entryPath = resolve(memoryRoot, "main.tex");
const outputPath = resolve(memoryRoot, "TFM_Mikel_Alvarez_Barroso.tex");
const bibPath = resolve(memoryRoot, "bibliografia.bib");

function readUtf8(path) {
  if (!existsSync(path)) throw new Error(`Required file not found: ${path}`);
  return readFileSync(path, "utf8");
}

function expandInputs(source, currentFile, visited = new Set()) {
  return source.split("\n").map((line) => {
    if (line.trimStart().startsWith("%")) return line;
    return line.replace(/\\input\{([^}]+)\}/g, (_whole, includeName) => {
    // LaTeX resolves these project paths from the main document's directory,
    // even when an \input directive appears inside an included chapter.
    const childPath = resolve(memoryRoot, `${includeName}.tex`);
    if (visited.has(childPath)) {
      throw new Error(`Circular LaTeX input detected: ${relative(memoryRoot, childPath)}`);
    }
    visited.add(childPath);
    const child = readUtf8(childPath);
    const expanded = expandInputs(child, childPath, visited);
    visited.delete(childPath);
      return `\n% ----- Begin ${relative(memoryRoot, childPath).replaceAll("\\", "/")} -----\n${expanded}\n% ----- End ${relative(memoryRoot, childPath).replaceAll("\\", "/")} -----\n`;
    });
  }).join("\n");
}

function clean(value) {
  return value.replace(/\s+/g, " ").trim();
}

function parseFieldBlock(block) {
  const fields = new Map();
  let index = block.indexOf(",") + 1;
  while (index > 0 && index < block.length) {
    while (index < block.length && /[\s,]/.test(block[index])) index += 1;
    const fieldStart = index;
    while (index < block.length && /[A-Za-z]/.test(block[index])) index += 1;
    const name = block.slice(fieldStart, index).toLowerCase();
    if (!name) break;
    while (index < block.length && /\s/.test(block[index])) index += 1;
    if (block[index] !== "=") break;
    index += 1;
    while (index < block.length && /\s/.test(block[index])) index += 1;
    if (block[index] !== "{") break;
    index += 1;
    const valueStart = index;
    let depth = 1;
    while (index < block.length && depth > 0) {
      if (block[index] === "{") depth += 1;
      if (block[index] === "}") depth -= 1;
      index += 1;
    }
    fields.set(name, clean(block.slice(valueStart, index - 1)));
  }
  return fields;
}

function parseBibtex(bibText) {
  const entries = [];
  let position = 0;
  while (position < bibText.length) {
    const marker = bibText.indexOf("@", position);
    if (marker === -1) break;
    const opening = bibText.indexOf("{", marker);
    if (opening === -1) break;
    const type = bibText.slice(marker + 1, opening).trim().toLowerCase();
    let cursor = opening + 1;
    let depth = 1;
    while (cursor < bibText.length && depth > 0) {
      if (bibText[cursor] === "{") depth += 1;
      if (bibText[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    const block = bibText.slice(opening + 1, cursor - 1);
    const comma = block.indexOf(",");
    if (comma !== -1) {
      entries.push({
        type,
        key: block.slice(0, comma).trim(),
        fields: parseFieldBlock(block),
      });
    }
    position = cursor;
  }
  return entries;
}

function bibliographyToLatex(entries) {
  const lines = ["\\begin{thebibliography}{99}"];
  for (const entry of entries) {
    const fields = entry.fields;
    const author = fields.get("author") || "Autor no especificado";
    const title = fields.get("title") || "Sin t\'itulo";
    const venue = fields.get("journal") || fields.get("booktitle") || fields.get("institution") || fields.get("howpublished") || "";
    const volume = fields.get("volume");
    const number = fields.get("number");
    const pages = fields.get("pages");
    const year = fields.get("year") || "s. f.";
    const note = fields.get("note") || (fields.get("doi") ? `DOI: \\url{https://doi.org/${fields.get("doi")}}` : "");
    const details = [venue, volume ? `vol. ${volume}` : "", number ? `n. ${number}` : "", pages ? `pp. ${pages}` : "", year].filter(Boolean).join(", ");
    lines.push(`\\bibitem{${entry.key}} ${author}. \\textit{${title}}. ${details}.${note ? ` ${note}` : ""}`);
  }
  lines.push("\\end{thebibliography}");
  return lines.join("\n\n");
}

const expanded = expandInputs(readUtf8(entryPath), entryPath);
const bibliography = bibliographyToLatex(parseBibtex(readUtf8(bibPath)));
const standalone = expanded.replace(
  /\\bibliographystyle\{[^}]+\}\s*\\bibliography\{bibliografia\}/,
  bibliography,
);

const withoutCommentLines = standalone.split("\n").filter((line) => !line.trimStart().startsWith("%")).join("\n");
if (/\\input\{/.test(withoutCommentLines)) throw new Error("Standalone source still contains an input directive.");
if (/\\bibliography\{/.test(withoutCommentLines)) throw new Error("Standalone source still contains a BibTeX directive.");
writeFileSync(outputPath, standalone, "utf8");
console.log(`Generated ${relative(projectRoot, outputPath)} with ${parseBibtex(readUtf8(bibPath)).length} bibliography entries.`);
