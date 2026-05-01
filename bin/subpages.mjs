// @ts-check
import { getSubpages } from "../dist/index.js";
import { argv } from "node:process";

const distDir = argv[2] || "dist";

getSubpages(distDir)
  .then((r) => console.log(`Done. ${r.length} parent pages processed.`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
