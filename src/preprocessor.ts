// Should be manually updated

interface PreprocessorToken {
  token: string;
  type:
    | "directiveName"
    | "operator"
    | "replacement"
    | "operatorOutsideDirective";
  since?: string;
  link: string;
}

const PREPROCESSOR_TOKENS: PreprocessorToken[] = [
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
    token: "_Pragma",
    since: "c++11",
    type: "operatorOutsideDirective",
    link: "cpp/preprocessor/impl",
  },
  { token: "define", type: "directiveName", link: "cpp/preprocessor/replace" },
  { token: "defined", type: "operator", link: "cpp/preprocessor/conditional" },
  {
    token: "elif",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "elifdef",
    since: "c++23",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "elifndef",
    since: "c++23",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "else",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "endif",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  { token: "error", type: "directiveName", link: "cpp/preprocessor/error" },
  { token: "if", type: "directiveName", link: "cpp/preprocessor/conditional" },
  {
    token: "ifdef",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  {
    token: "ifndef",
    type: "directiveName",
    link: "cpp/preprocessor/conditional",
  },
  { token: "include", type: "directiveName", link: "cpp/preprocessor/include" },
  { token: "line", type: "directiveName", link: "cpp/preprocessor/line" },
  { token: "pragma", type: "directiveName", link: "cpp/preprocessor/impl" },
  { token: "undef", type: "directiveName", link: "cpp/preprocessor/replace" },
];

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
  { macro: "__STDC__" },
  { macro: "__STDC_VERSION__", since: "c++11" },
  { macro: "__STDC_ISO_10646__", since: "c++11" },
  { macro: "__STDC_MB_MIGHT_NEQ_WC__" },
  { macro: "__STDCPP_THREADS__", since: "c++11" },
  {
    macro: "__STDCPP_STRICt_POINTER_SAFETY__",
    since: "c++11",
    removed: "c++23",
  },
];
const PREDEFINED_MACRO_LINK = "cpp/preprocessor/replace";

