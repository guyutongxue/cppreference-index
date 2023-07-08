# CppReference 索引整理

此项目遍历 [CppReference](http://en.cppreference.com) 上的若干页面、以及一些手动维护的数据，实现 C++ 源代码单词到对应页面的映射关系。

> 官方的数据 [MediaWiki:Autolinker-definition-cpp](https://en.cppreference.com/mwiki/index.php?title=MediaWiki:Autolinker-definition-cpp&action=edit)（本应）与[离线文档发布](https://github.com/p12tic/cppreference-doc)同步，但目前存在大量缺失且更新不及时。

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
  - `std::formattable`
  - `std::range_formatter`
  - `std::range_format`
  - `std::format_kind`

### 缺少详情（已打补丁）

下列符号仍未收入 CppReference，但已经出现在符号索引中。
- 迭代器（`<iterator>`）
  - `std::basic_const_iterator`
  - `std::const_iterator`
  - `std::const_sentinel`
  - `std::make_const_iterator`
  - `std::make_const_sentinel`

### 有详情，但没有内容

下列符号已经在 CppReference 中被一次或多次引用，但相关页面尚未创建。

- `std::flat_set`
- `std::flat_map`
- `std::flat_multiset`
- `std::flat_multimap`
- `std::erase_if` (`std::flat_map` `std::flat_multimap` `std::flat_set` `std::flat_multiset`)
- `std::sorted_equivalent`
- `std::sorted_equivalent_t`
- `std::sorted_unique_t`
- `std::sorted_unique`
- `std::layout_left`
- `std::layout_right`
- `std::layout_stride`
- `std::default_accessor`
