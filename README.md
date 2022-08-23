# CppReference 索引整理

此项目遍历 [CppReference](http://en.cppreference.com) 上的若干页面、以及一些手动维护的数据，实现 C++ 源代码单词到对应页面的映射关系。

目前已整理的数据：
- 标准库符号；包括定义于 `std` 命名空间的符号及宏符号。（从[索引页面](https://en.cppreference.com/w/cpp/symbol_index)爬取）
- 头文件；（从[头文件页面](https://en.cppreference.com/w/cpp/header)爬取）
- 关键字；（手动维护）
- 标准特性（Attribute）；（手动维护）
- 预处理记号。（手动维护）

## 使用

由于使用 Python 库 `mwparserfromhell` 作为 MediaWiki 语法分析器，故首先需要
```
pip install mwparserfromhell
```

## 待补充符号

下列符号（库设施、语法核心等）尚未收入 CppReference。
- `<ranges>`
  - `std::ranges::elements_of`（用于协程，见 `std::generator`）
- `<format>`
  - `std::basic_format_string`
  - `std::format_string`
  - `std::wformat_string`
- `<generator>`
  - `std::generator`
- `<stdfloat>`
  - `__STDCPP_FLOAT16_T__`（语核）
  - `__STDCPP_FLOAT32_T__`（语核）
  - `__STDCPP_FLOAT64_T__`（语核）
  - `__STDCPP_FLOAT128_T__`（语核）
  - `__STDCPP_BFLOAT16_T__`（语核）
  - `std::float16_t`
  - `std::float32_t`
  - `std::float64_t`
  - `std::float128_t`
  - `std::bfloat16_t`
- `<print>`
  - `std::print`
  - `std::println`
  - `std::vprint_unicode`
  - `std::vprint_nonunicode`
- `<mdspan>`
  - `std::extents`
  - `std::dextents`
  - `std::layout_left`
  - `std::layout_right`
  - `std::layout_stride`
  - `std::default_accessor`
  - `std::mdspan`
- 语核部分的特性测试宏

### 缺少详情（已打补丁）

下列符号仍未收入 CppReference，但已经出现在符号索引中。
- 迭代器（`<iterator>`）
  - `std::basic_const_iterator`
  - `std::const_iterator`
  - `std::const_sentinel`
  - `std::make_const_iterator`
  - `std::make_const_sentinel`
- STLv2 算法（`<algorithm>`）
  - `std::ranges::fold_left`
  - `std::ranges::fold_left_first`
  - `std::ranges::fold_left_first_with_iter`
  - `std::ranges::fold_left_with_iter`
  - `std::ranges::fold_right`
  - `std::ranges::fold_right_last`

### 有详情，但没有内容

下列符号已经在 CppReference 中被一次或多次引用，但相关页面尚未创建。

- `std::ranges::range_adaptor_closure`
- `std::ranges::adjacent_transform_view`
- `std::views::adjacent_transform`
- `std::ranges::cartesian_product_view`
- `std::views::cartesian_product`
- `std::ranges::repeat_view`
- `std::views::repeat`
- `std::ranges::chunk_view`
- `std::views::chunk`
- `std::ranges::chunk_by_view`
- `std::views::chunk_by`
- `std::ranges::slide_view`
- `std::views::slide`
- `std::ranges::stride_view`
- `std::views::stride`
- `std::unexpected`
- `std::bad_expected_access`
- `std::unexpect_t`
- `std::unexpect`
- `std::flat_set`
- `std::flat_map`
- `std::flat_multiset`
- `std::flat_multimap`
- `std::erase_if` (`std::flat_map` `std::flat_multimap` `std::flat_set` `std::flat_multiset`)
- `std::sorted_equivalent`
- `std::sorted_equivalent_t`
- `std::sorted_unique_t`
- `std::sorted_unique`
