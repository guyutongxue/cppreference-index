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

