// @ts-check
import fetch from "node-fetch";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DRAFT_URL = "https://cxx-index.guyutongxue.site/std-index.json";

const OUTPUT_DIR = path.join(__dirname, "..", "dist");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "missing-symbols.json");

/**
 * @param {any[]} nsArray
 * @returns {string}
 */
function namespaceToFQN(nsArray) {
  return nsArray
    .filter((n) => !n.inline)
    .map((n) => n.name ?? "(anon)")
    .join("::");
}

async function main() {
  const [draft, generated] = await Promise.all([
    fetch(DRAFT_URL).then((res) => /** @type {Promise<any>} */ (res.json())),
    readFile(path.join(OUTPUT_DIR, "generated.json"), "utf-8").then((data) =>
      JSON.parse(data),
    ),
  ]);

  // Flatten draft
  /** @type {{ name: string, kind: string, header: string }[]} */
  const draftSymbols = [];
  for (const hdr of draft.headers) {
    for (const sym of hdr.symbols) {
      const expositionOnly =
        sym.name.startsWith("__") && !sym.name.endsWith("__");
      if (expositionOnly) {
        continue;
      }
      // placeholder
      if (sym.name.includes("⟨")) {
        continue;
      }
      if (sym.operator) {
        continue;
      }
      let nsPrefix =
        sym.kind === "macro" || sym.kind === "functionLikeMacro"
          ? ""
          : `${namespaceToFQN(sym.namespace)}::`;
      nsPrefix = nsPrefix.replace(/^std::ranges::views::/, "std::views::");

      if (nsPrefix === "::") {
        // C compatibility symbols, skip?
        continue;
      }

      draftSymbols.push({
        name: nsPrefix + sym.name,
        kind: sym.kind ?? "unknown",
        header: sym.header ?? "",
      });
    }
  }
  console.log(`  Draft: ${draftSymbols.length} symbols`);

  // Build existing name set from generated.json
  const cpprefNames = new Set();
  for (const entry of generated) {
    if (entry.type === "symbol" && entry.name) {
      cpprefNames.add(entry.name);
    }
  }
  console.log(`  generated.json: ${cpprefNames.size} symbol names`);

  // Compute missing
  /** @type {{ name: string, kind: string, header: string }[]} */
  const missing = [];
  for (const sym of draftSymbols) {
    if (!cpprefNames.has(sym.name)) {
      missing.push(sym);
    }
  }
  console.log(`  Missing: ${missing.length} / ${draftSymbols.length}`);

  // Write output
  const output = {
    version: "1.0.0",
    generated_at: new Date().toISOString(),
    draft_source: DRAFT_URL,
    stats: {
      draft_total_symbols: draftSymbols.length,
      cppreference_total_symbols: cpprefNames.size,
      missing_count: missing.length,
    },
    missing,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Output written to ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
