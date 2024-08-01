export const MISSING_T_HELPERS = [
  // <compare>
  "std::common_comparison_category",
  "std::compare_three_way_result",
  // <tuple>
  "std::tuple_element",
];

export const MISSING_V_HELPERS = [
  // <functional>
  "std::is_placeholder",
  "std::is_bind_expression",
  // <system_error>
  "std::is_error_condition_enum",
  // <execution>
  "std::is_execution_policy",
  // <ratio>
  "std::ratio_equal",
  "std::ratio_greater",
  "std::ratio_greater_equal",
  "std::ratio_less",
  "std::ratio_less_equal",
  "std::ratio_not_equal",
  // <tuple>
  "std::tuple_size",
  // <memory>
  "std::uses_allocator"
]

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
  // <utility>
  {
    name: "std::make_integer_sequence",
    type: "typeAliasTemplate" as const,
    description: "std::integer_sequence<T, 0, 1, 2, ..., N - 1>"
  },
  {
    name: "std::index_sequence",
    type: "typeAliasTemplate" as const,
    description: "std::integer_sequence<std::size_t, Ints...>"
  },
  {
    name: "std::make_index_sequence",
    type: "typeAliasTemplate" as const,
    description: "std::make_integer_sequence<std::size_t, N>"
  },
  {
    name: "std::index_sequence_for",
    type: "typeAliasTemplate" as const,
    description: "std::make_index_sequence<sizeof...(Ts)>"
  },
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
  {
    name: "std::views::pairwise",
    type: "constant" as const,
    description: "std::views::adjacent<2>"
  },
  {
    name: "std::views::pairwise_transform",
    type: "constant" as const,
    description: "std::views::adjacent_transform<2>"
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
  {
    name: "std::linalg::setup_givens_rotation_result",
  },
  {
    name: "std::linalg::sum_of_squares_result",
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
