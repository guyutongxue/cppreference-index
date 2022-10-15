export const MISSING_ENUMERATORS = [
  // std::float_round_style
  // https://en.cppreference.com/w/cpp/types/numeric_limits/float_round_style
  {
    name: "std::round_indeterminate",
    description: "rounding style cannot be determined",
  },
  {
    name: "std::round_toward_zero",
    description: "rounding toward zero",
  },
  {
    name: "std::round_to_nearest",
    description: "rounding toward nearest representable value",
  },
  {
    name: "std::round_toward_infinity",
    description: "rounding toward positive infinity",
  },
  {
    name: "std::round_toward_neg_infinity",
    description: "rounding toward negative infinity",
  },
  // std::codecvt_mode
  // https://en.cppreference.com/w/cpp/locale/codecvt_mode
  {
    name: "std::little_endian",
    description:
      "assume the input is in little-endian byte order (applies to UTF-16 input only, the default is big-endian)",
  },
  {
    name: "std::consume_header",
    description:
      "consume the byte order mark, if present at the start of input sequence, and (in case of UTF-16), rely on the byte order it specifies for decoding the rest of the input",
  },
  {
    name: "std::generate_header",
    description:
      "output the byte order mark at the start of the output sequence",
  },
  // std::float_denorm_style
  // https://en.cppreference.com/w/cpp/types/numeric_limits/float_denorm_style
  {
    name: "std::denorm_indeterminate",
    description: "support of subnormal values cannot be determined",
  },
  {
    name: "std::denorm_absent",
    description: "the type does not support subnormal values",
  },
  {
    name: "std::denorm_present",
    description: "the type allows subnormal values",
  },
  // std::memory_order
  // https://en.cppreference.com/w/cpp/atomic/memory_order
  // Already included
];

export const MISSING_HELPERS = [
  // <iterator>
  {
    name: "std::disable_sized_sentinel_for",
    type: "variableTemplate" as const,
    description:
      "used to prevent iterators and sentinels that can be subtracted but do not actually model sized_sentinel_for from satisfying the concept",
  },
  // <ranges>
  {
    name: "std::ranges::disable_sized_range",
    type: "variableTemplate" as const,
    description:
      "allows use of range types that provide a size function (either as a member or as a non-member) but do not in fact model sized_range",
  },
  {
    name: "std::ranges::enable_borrowed_range",
    type: "variableTemplate" as const,
    description: "used to indicate whether a range is a borrowed_range",
  },
  {
    name: "std::ranges::enable_view",
    type: "variableTemplate" as const,
    description: "used to indicate whether a range is a view",
  },
  {
    name: "std::ranges::view_base",
    type: "class" as const,
    description:
      "deriving from std::view_base enables range types to model std::view",
  },
  {
    name: "std::ranges::istream_view",
    type: "typeAliasTemplate" as const,
    description: "std::ranges::basic_istream_view<_, char>",
  },
  {
    name: "std::ranges::wistream_view",
    type: "typeAliasTemplate" as const,
    description: "std::ranges::basic_istream_view<_, wchar_t>",
  },
];

export const MISSING_RETURN_TYPES = [
  {
    name: "std::to_chars_result",
  },
  {
    name: "std::from_chars_result",
  },
  {
    name: "std::format_to_n_result",
  },
  // return type in std::ranges:: already included
];

export const NAMES_WITH_WRONG_TYPE = [
  { name: "std::in_place", type: "constant" as const },
  { name: "std::in_place_type", type: "variableTemplate" as const },
  { name: "std::in_place_index", type: "variableTemplate" as const },
  { name: "std::in_place_t", type: "class" as const },
  { name: "std::format_parse_context", type: "typeAlias" as const },
  { name: "std::wformat_parse_context", type: "typeAlias" as const },
  { name: "std::format_context", type: "typeAlias" as const },
  { name: "std::wformat_context", type: "typeAlias" as const },
  { name: "std::format_args", type: "typeAlias" as const },
  { name: "std::wformat_args", type: "typeAlias" as const },
  { name: "std::format_string", type: "typeAliasTemplate" as const },
  { name: "std::wformat_string", type: "typeAliasTemplate" as const },
  // Not yet finished in cppreference
  { name: "std::float16_t", type: "typeAlias" as const },
  { name: "std::float32_t", type: "typeAlias" as const },
  { name: "std::float64_t", type: "typeAlias" as const },
  { name: "std::float128_t", type: "typeAlias" as const },
  { name: "std::bfloat16_t", type: "typeAlias" as const },

  { name: "std::basic_const_iterator", type: "classTemplate" as const },
  { name: "std::const_iterator", type: "typeAliasTemplate" as const },
  { name: "std::const_sentinel", type: "typeAliasTemplate" as const },
  { name: "std::make_const_iterator", type: "functionTemplate" as const },
  { name: "std::make_const_sentinel", type: "functionTemplate" as const },
  
  { name: "std::ranges::fold_left", type: "niebloid" as const },
  { name: "std::ranges::fold_left_first", type: "niebloid" as const },
  { name: "std::ranges::fold_left_first_with_iter", type: "niebloid" as const },
  { name: "std::ranges::fold_left_with_iter", type: "niebloid" as const },
  { name: "std::ranges::fold_right", type: "niebloid" as const },
  { name: "std::ranges::fold_right_last", type: "niebloid" as const },
];

function generateRangeAdaptorObject(...args: string[]) {
  return args.flatMap((i) => [
    {
      name: `std::ranges::${i}_view`,
      type: "classTemplate" as const,
    },
    {
      name: `std::views::${i}`,
      type: "constant" as const,
    },
  ]);
}
