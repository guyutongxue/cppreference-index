import fs from "node:fs";

import { getSymbols } from "./symbol";
import { getHeaders } from "./header";
import { getKeywords, getStdAttributes } from "./keyword";
import { getPreprocessorTokens, getPredefinedMacros } from "./preprocessor";
import { Index } from "./typing";

export type Options = OptionsWithReturnValue | OptionsWithFile;

type OptionsBase = {
  categories?: {
    symbols?: boolean;
    headers?: boolean;
    keywords?: boolean;
    stdAttributes?: boolean;
    predefinedMacros?: boolean;
    preprocessorTokens?: boolean;
  };
};

type OptionsWithReturnValue = OptionsBase & {
  writeToFile?: false | null;
};

type OptionsWithFile = OptionsBase & {
  writeToFile: string;
};

function get(options: OptionsWithFile): Promise<void>;
function get(options?: OptionsWithReturnValue): Promise<Index[]>;
async function get(options?: Options): Promise<void | Index[]> {
  const {
    symbols = true,
    headers = true,
    keywords = true,
    stdAttributes = true,
    predefinedMacros = true,
    preprocessorTokens = true,
  } = options?.categories ?? {};
  const result: Index[] = [];
  symbols && result.push(...(await getSymbols()));
  headers && result.push(...(await getHeaders()));
  keywords && result.push(...getKeywords());
  stdAttributes && result.push(...getStdAttributes());
  predefinedMacros && result.push(...(await getPredefinedMacros()));
  preprocessorTokens && result.push(...getPreprocessorTokens());
  const writeToFile = options?.writeToFile;
  if (!writeToFile) {
    return result;
  } else {
    const json = JSON.stringify(result);
    if (typeof writeToFile === "string") {
      fs.writeFileSync(writeToFile, json);
    }
    if (typeof writeToFile === "number") {
      fs.writeSync(writeToFile, json);
    }
  }
}

export default get;
