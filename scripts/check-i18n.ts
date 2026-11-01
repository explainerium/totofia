/**
 * Fails when messages/bn.json and messages/en.json do not have exactly the same keys,
 * or when a value is empty. Run with `npm run i18n:check` (also part of `npm run check`).
 */
import { readFileSync } from "node:fs";

type Tree = { [key: string]: string | Tree };

const load = (locale: string): Tree =>
  JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));

function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(path, value);
    else for (const [k, v] of flatten(value, path)) out.set(k, v);
  }
  return out;
}

const bn = flatten(load("bn"));
const en = flatten(load("en"));
const problems: string[] = [];

for (const key of bn.keys()) if (!en.has(key)) problems.push(`missing in en.json: ${key}`);
for (const key of en.keys()) if (!bn.has(key)) problems.push(`missing in bn.json: ${key}`);
for (const [name, map] of [
  ["bn", bn],
  ["en", en],
] as const) {
  for (const [key, value] of map)
    if (!value.trim()) problems.push(`empty value in ${name}.json: ${key}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`i18n OK — ${bn.size} keys in both bn and en`);
