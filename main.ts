// Tired Dark Lord — entry runner.
// Reads entry.txt beside this file, checks the bounty gate,
// and copies its exact bytes to the grader output directory.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const entryPath = join(here, "entry.txt");

const MIN_CHARS = 1;
const MAX_CHARS = 600;
const MIN_WORDS = 90;
const MAX_WORDS = 110;

function fail(message: string): never {
  console.error(`gate failed: ${message}`);
  process.exit(1);
}

function countWords(text: string): number {
  const parts = text.trim().split(/\s+/).filter((w) => w.length > 0);
  return parts.length;
}

function main(): void {
  if (!existsSync(entryPath)) {
    fail(`entry.txt not found beside main.ts (${entryPath})`);
  }
  const raw = readFileSync(entryPath);
  const text = raw.toString("utf-8");
  if (text !== raw.toString("utf-8")) {
    fail("entry is not valid UTF-8 text");
  }
  if (text.trim().length === 0) {
    fail("entry is only whitespace");
  }
  const chars = [...text].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    fail(`entry is ${chars} characters, gate needs ${MIN_CHARS}-${MAX_CHARS}`);
  }
  const words = countWords(text);
  if (words < MIN_WORDS || words > MAX_WORDS) {
    fail(`entry is ${words} words, expected about 100 (${MIN_WORDS}-${MAX_WORDS})`);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || join(here, "out");
  const target = resolve(outDir);
  mkdirSync(target, { recursive: true });
  const outPath = join(target, "entry.txt");
  writeFileSync(outPath, raw);
  const written = readFileSync(outPath);
  if (!written.equals(raw)) {
    fail("output bytes differ from entry.txt bytes");
  }
  if (text.endsWith("\n")) {
    fail("entry must not end with a trailing newline");
  }
  console.log(`ok: ${words} words, ${chars} characters -> ${outPath}`);
}

main();
