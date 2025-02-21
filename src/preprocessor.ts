// Should be manually updated

import { fetchSrc } from "./fetch";
import {
  PreprocessorToken,
  PreprocessorTokenIndex,
  SymbolIndex,
} from "./typing";

const PREPROCESSOR_TOKENS: PreprocessorToken[] = [
  { token: "#define", type: "directiveName", link: "cpp/preprocessor/replace" },
  {
    token: "#elif",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "#elifdef",
    since: "c++23",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "#elifndef",
    since: "c++23",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "#else",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "#endif",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  { token: "#error", type: "directiveName", link: "cpp/preprocessor/error" },
  { token: "#if", type: "directiveName", link: "cpp/preprocessor/conditional" },
  {
    token: "#ifdef",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "#ifndef",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "#include",
    type: "directiveName",
    link: "cpp/preprocessor/include",
  },
  {
    token: "#embed",
    since: "c++26",
    type: "directiveName",
    link: "cpp/preprocessor/embed",
  },
  { token: "#line", type: "directiveName", link: "cpp/preprocessor/line" },
  { token: "#pragma", type: "directiveName", link: "cpp/preprocessor/impl" },
  { token: "#undef", type: "directiveName", link: "cpp/preprocessor/replace" },
  {
    token: "#warning",
    type: "directiveName",
    since: "c++23",
    link: "cpp/preprocessor/error",
  },
  {
    token: "__has_cpp_attribute",
    since: "c++20",
    type: "operator",
    link: "cpp/feature_test",
  },
  {
    token: "__has_include",
    since: "c++17",
    type: "operator",
    link: "cpp/preprocessor/include",
  },
  {
    token: "__has_embed",
    since: "c++26",
    type: "operator",
    link: "cpp/feature_test",
  },
  {
    token: "__VA_ARGS__",
    type: "replacement",
    link: "cpp/preprocessor/replace",
  },
  {
    token: "__VA_OPT__",
    type: "replacement",
    link: "cpp/preprocessor/replace",
  },
  {
    token: "_Pragma",
    since: "c++11",
    type: "operatorOutsideDirective",
    link: "cpp/preprocessor/impl",
  },
  { token: "defined", type: "operator", link: "cpp/preprocessor/conditional" },
];

export function getPreprocessorTokens(): PreprocessorTokenIndex[] {
  return PREPROCESSOR_TOKENS.map<PreprocessorTokenIndex>((t) => ({
    type: "preprocessorToken",
    name: t.token,
    tokenType: t.type,
    link: t.link,
    marks: {
      since: t.since,
    },
  }));
}

interface PredefinedMacro {
  macro: string;
  since?: string;
  removed?: string;
}

const PREDEFINED_MACROS: PredefinedMacro[] = [
  { macro: "__cplusplus" },
  { macro: "__STDC_HOSTED__", since: "c++11" },
  { macro: "__FILE__" },
  { macro: "__LINE__" },
  { macro: "__DATE__" },
  { macro: "__TIME__" },
  { macro: "__STDCPP_DEFAULT_NEW_ALIGNMENT__", since: "c++17" },
  {
    macro: "__STDCPP_BFLOAT16_T__",
    since: "c++23",
  },
  {
    macro: "__STDCPP_FLOAT16_T__",
    since: "c++23",
  },
  {
    macro: "__STDCPP_FLOAT32_T__",
    since: "c++23",
  },
  {
    macro: "__STDCPP_FLOAT64_T__",
    since: "c++23",
  },
  {
    macro: "__STDCPP_FLOAT128_T__",
    since: "c++23",
  },
  { macro: "__STDC__" },
  { macro: "__STDC_VERSION__", since: "c++11" },
  { macro: "__STDC_ISO_10646__", since: "c++11" },
  { macro: "__STDC_MB_MIGHT_NEQ_WC__", since: "c++11" },
  { macro: "__STDCPP_THREADS__", since: "c++11" },
  {
    macro: "__STDCPP_STRICT_POINTER_SAFETY__",
    since: "c++11",
    removed: "c++23",
  },
];

async function getLangFeatureMacros(): Promise<SymbolIndex[]> {
  const src = await fetchSrc("Template:cpp/utility/lang_feature_macros");
  const matches = src.matchAll(/(__cpp[_a-z]+).*\{\{mark c\+\+(\d{2})\}\}/g);
  const result: SymbolIndex[] = [];
  for (const match of matches) {
    const year = Number(match[2]);
    result.push({
      type: "symbol",
      symbolType: "macro",
      name: match[1],
      link: "cpp/feature_test",
      marks: {
        since: `c++${Math.max(year, 20)}`,
      },
    });
  }
  return result;
}

export async function getPredefinedMacros(): Promise<SymbolIndex[]> {
  return [
    ...PREDEFINED_MACROS.map<SymbolIndex>((m) => ({
      type: "symbol",
      symbolType: "macro",
      name: m.macro,
      link: "cpp/preprocessor/replace",
      marks: {
        since: m.since,
        removed: m.removed,
      },
    })),
    ...(await getLangFeatureMacros()),
  ];
}
