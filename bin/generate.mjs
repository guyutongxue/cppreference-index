// @ts-check
import get from "../dist/index.js";
import { argv } from "node:process";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const jsonPath = path.join(argv[2], "generated.json");
const jsPath = path.join(argv[2], "generated.js");
const dtsPath = path.join(argv[2], "generated.d.ts");

get({ detailedSymbols: true })
  .then((r) =>
    Promise.all([
      writeFile(jsPath, `export default ${JSON.stringify(r)};`),
      writeFile(dtsPath, `import { Index } from "./index";
declare const INDEXES: Index<true>[];
export default INDEXES;
`),
      writeFile(jsonPath, JSON.stringify(r, undefined, 2)),
    ])
  )
  .catch((e) => console.error(e));
