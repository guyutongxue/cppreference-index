import fs from "node:fs";

import { getSymbols } from "./symbol";
import { getHeaders } from "./header";
import { getKeywords, getStdAttributes } from "./keyword";
import { getPreprocessorTokens, getPredefinedMacros } from "./preprocessor";
import { Index, SymbolIndex } from "./typing";
import { fetchDetailed, transformDetailed } from "./detailed";

type Options<Detailed extends boolean> = {
  categories?: {
    symbols?: boolean;
    headers?: boolean;
    keywords?: boolean;
    stdAttributes?: boolean;
    predefinedMacros?: boolean;
    preprocessorTokens?: boolean;
  };
  writeToFile?: string | number | false;
  detailedSymbols?: Detailed;
};

async function get<Detailed extends boolean>(options?: Options<Detailed>): Promise<Index<Detailed>[]> {
  const {
    symbols = true,
    headers = true,
    keywords = true,
    stdAttributes = true,
    predefinedMacros = true,
    preprocessorTokens = true,
  } = options?.categories ?? {};

  const symbolIndex: SymbolIndex[] = [];
  const result: Index<boolean>[] = [];

  symbols && symbolIndex.push(...(await getSymbols()));
  predefinedMacros && symbolIndex.push(...(await getPredefinedMacros()));
  if (options?.detailedSymbols) {
    const info = await fetchDetailed();
    result.push(...transformDetailed(info, symbolIndex));
  } else {
    result.push(...symbolIndex);
  }

  headers && result.push(...(await getHeaders()));
  keywords && result.push(...getKeywords());
  stdAttributes && result.push(...getStdAttributes());
  preprocessorTokens && result.push(...getPreprocessorTokens());

  const writeToFile = options?.writeToFile;
  if (writeToFile) {
    const json = JSON.stringify(result);
    if (typeof writeToFile === "string") {
      fs.writeFileSync(writeToFile, json);
    }
    if (typeof writeToFile === "number") {
      fs.writeSync(writeToFile, json);
    }
  }
  // @ts-ignore
  return result;
}

export default get;
