import { Cheerio, Element, load } from "cheerio";
import {
  MISSING_HELPERS,
  MISSING_ENUMERATORS,
  MISSING_RETURN_TYPES,
  NAMES_WITH_WRONG_TYPE,
} from "./detailed_missing";
import { fetchSrc } from "./fetch";
import { getHeaders } from "./header";
import { DetailedSymbolIndex, DetailedSymbolType, SymbolIndex } from "./typing";

interface DetailedInfo {
  header: string;
  names: Name[];
  description: string;
  marks: string[];
}

interface Name {
  name: string;
  note?: string;
}

export async function fetchDetailed() {
  const headers = await getHeaders();
  const viewedHeaders = new Set<string>();
  const result: DetailedInfo[] = [];
  for (const { name: header, link } of headers) {
    if (viewedHeaders.has(link)) continue;
    if (link.includes("redlink=1")) continue; // 未创建
    const html = await fetchSrc(link, true);
    const $ = load(html);
    $(".editsection,.mjax").remove();
    result.push(
      ...$(".t-dsc")
        .map(function () {
          const children: Cheerio<Element> = $(this).children();
          const names = children
            .eq(0)
            .find(".t-dsc-member-div>:first-child .t-lines")
            .children()
            .map(function () {
              const name: Cheerio<Element> = $(this).clone();
              const note = name.find(".t-dsc-small").remove().text();
              return <Name>{
                name: name.text().trim(),
                note: note.substring(1, note.length - 1) || undefined,
              };
            })
            .toArray();
          const isTypedef = names.length === 0;
          // entity not provided as "member", e.g. type alias
          if (isTypedef) {
            const name = children.eq(0).clone();
            name.find(".t-mark-rev").remove();
            names.push({ name: name.text().trim() });
          }
          const desc = children.eq(1).clone();
          const markElem = desc.find(".t-mark").remove();
          // replace <br> to \n
          desc.html(desc.html()?.replace(/<br\s*\/?>/gi, "\n") ?? "");
          const marks = markElem
            .map(function () {
              const text = $(this).text();
              return text.substring(1, text.length - 1);
            })
            .toArray();
          if (isTypedef && marks.length === 0) {
            marks.push("typedef");
          }
          return {
            header,
            names,
            description: desc
              .text()
              .replace(/\s{2,}/g, " ")
              .trim(),
            marks,
          };
        })
        .toArray()
    );
    viewedHeaders.add(link);
  }
  return result;
}

function markToType(mark: string, name?: string): DetailedSymbolType {
  switch (mark) {
    case "concept":
      return "concept";
    case "customization point object":
      return "constant";
    case "class template":
      return "classTemplate";
    case "class template specialization":
      return "classTemplateSpecialization";
    case "class":
      return "class";
    case "typedef":
      return "typeAlias";
    case "function":
      return "function";
    case "function template":
      return "functionTemplate";
    case "variable template":
      return "variableTemplate";
    case "enum":
      return "enumeration";
    case "function macro":
      return "functionLikeMacro";
    case "macro constant":
      return "macro";
    case "struct":
      return "class";
    case "constant":
      return "constant";
    case "alias template":
      return "typeAliasTemplate";
    case "niebloid":
      return "niebloid";
    case "macro variable":
      return "macro";
    case "range adaptor object":
      return "constant";
    case "global object":
      return "object";
    default:
      console.error(`Unknown type ${mark} (${name})`);
      return "other";
  }
}

export function transformDetailed(
  detailed: DetailedInfo[],
  generated: SymbolIndex[]
) {
  // 第一步：将一行多名字的格式分解为一名、一类型、一说明
  const result: {
    header: string;
    name: string;
    note?: string;
    description: string;
    mark: string;
  }[] = [];
  for (const d of detailed) {
    const firstName = d.names[0].name;
    const nameLength = d.names.length;
    if (firstName.match(/^(<\w+>|operator\b.*)$/)) {
      // ignore included headers and operator overloads
      if (!firstName.includes('""')) continue;
    }
    if (firstName === "_1, _2, _3, _4, ...") {
      d.names[0].name = "std::placeholders::_1, _2, ..., _N";
    } else if (firstName.includes(" ")) {
      // strange things (like language core pages in See Also section)
      continue;
    }
    // const csl = /\w+(, \w+)+(,? and|,? or|,) \w+/.exec(d.description);
    let marks = d.marks;
    let descs = new Array(nameLength).fill(d.description);
    if (d.marks.length === 1) {
      marks = new Array(nameLength).fill(d.marks[0]);
    } else if (d.marks.length !== nameLength) {
      console.error(`Invalid marks length: ${d.names.map((n) => n.name)}`);
    }
    if (d.description.includes("\n")) {
      const separated = d.description.split("\n");
      if (descs.length === nameLength) {
        descs = separated;
      }
    }
    result.push(
      ...d.names.map((name, index) => ({
        header: d.header,
        name: name.name,
        note: name.note,
        description: d.description,
        mark: marks[index],
      }))
    );
  }

  // 第二步：补全 std:: 前缀
  for (const i of result) {
    if (i.name.startsWith('operator""')) {
      // https://en.cppreference.com/w/cpp/language/user_literal#Standard_library
      const lit = i.name.substring(i.name.search('""') + 2);
      if (i.header === "<complex>") {
        i.name = "std::complex_literals::" + lit;
      } else if (i.header === "<chrono>") {
        i.name = "std::chrono_literals::" + lit;
      } else if (i.header === "<string>") {
        i.name = "std::string_literals::" + lit;
      } else if (i.header === "<string_view>") {
        i.name = "std::string_view_literals::" + lit;
      }
    }
    if (i.mark.includes("macro")) continue;
    else if (i.header === "<filesystem>") {
      // https://en.cppreference.com/w/cpp/header/filesystem
      i.name = "std::filesystem::" + i.name;
    } else if (i.header === "<memory_resource>") {
      // https://en.cppreference.com/w/cpp/header/memory_resource
      i.name = "std::pmr::" + i.name;
    } else if (i.header === "<chrono>") {
      if (!i.name.includes("::")) {
        i.name = "std::chrono::" + i.name;
      }
    } else if (
      i.header === "<thread>" &&
      ["yield", "get_id", "sleep_for", "sleep_until"].includes(i.name)
    ) {
      i.name = "std::this_thread::" + i.name;
    } else if (
      [
        "sequenced_policy",
        "parallel_policy",
        "parallel_unsequenced_policy",
        "unsequenced_policy",
        "seq",
        "par",
        "par_unseq",
        "unseq",
      ].includes(i.name)
    ) {
      // https://en.cppreference.com/w/cpp/header/execution
      i.name = "std::execution::" + i.name;
    } else if (
      ["syntax_option_type", "match_flag_type", "error_type"].includes(i.name)
    ) {
      // https://en.cppreference.com/w/cpp/header/regex#regex_constant_types
      i.name = "std::regex_constants::" + i.name;
    } else if (
      i.header === "<iterator>" &&
      ["iter_move", "iter_swap"].includes(i.name)
    ) {
      // https://en.cppreference.com/w/cpp/header/iterator#Customization_point_objects
      i.name = "std::ranges::" + i.name;
    } else if (!i.name.startsWith("std::")) {
      i.name = "std::" + i.name;
    }
  }

  // 第三步：与原有索引合并
  const combined: DetailedSymbolIndex[] = [];
  for (const i of generated) {
    const t = result.find((v) => v.name === i.name && v.note === i.note);
    if (typeof t === "undefined") {
      if (i.symbolType === "other" || i.symbolType === "template") {
        // Original is fuzzy
        if (i.name.startsWith("std::numbers")) {
          // https://en.cppreference.com/w/cpp/numeric/constants
          if (i.name.endsWith("_v")) {
            combined.push({
              ...i,
              symbolType: "variableTemplate",
            });
          } else {
            combined.push({
              ...i,
              symbolType: "constant",
              description: `${i.name}_v<double>`,
            });
          }
        } else if (i.name.startsWith("std::chrono")) {
          if (i.name.endsWith("_time")) {
            combined.push({
              ...i,
              symbolType: "typeAliasTemplate",
              description: `std::chrono::time_point<${i.name.substring(
                0,
                i.name.length - 5
              )}_clock, _>`,
            });
          } else if (i.name.endsWith("_seconds")) {
            combined.push({
              ...i,
              symbolType: "typeAlias",
              description: `${i.name.substring(
                0,
                i.name.length - 8
              )}_time<std::chrono::seconds>`,
            });
          } else if (i.name.match(/^std::chrono::[A-Z]/)) {
            combined.push({
              ...i,
              symbolType: "constant",
            });
          }
        } else if (i.name.startsWith("std::regex_constant")) {
          combined.push({
            ...i,
            symbolType: "constant",
          });
        } else if (i.name.startsWith("std::memory_order_")) {
          // https://en.cppreference.com/w/cpp/atomic/memory_order
          combined.push({
            ...i,
            symbolType: "constant",
          });
        } else if (i.name.startsWith("std::pmr")) {
          // std::pmr::* -> std::*
          const nonPmrVer = result.find(
            (x) => x.name === i.name.replace("pmr::", "")
          );
          if (nonPmrVer) {
            combined.push({
              ...i,
              symbolType:
                nonPmrVer.mark === "template"
                  ? "typeAliasTemplate"
                  : "typeAlias",
              description: `${nonPmrVer.name} using a polymorphic allocator`,
            });
          } else {
            console.error(`Unknown PMR ${i.name}`);
          }
        } else if (
          i.name.startsWith("std::ranges") &&
          i.name.endsWith("_result")
        ) {
          // STLv2 return result aliases
          combined.push({
            ...i,
            symbolType: "typeAliasTemplate",
            description: `Return type of ${i.name.substring(
              0,
              i.name.length - 7
            )}`,
          });
        } else if (
          i.name.endsWith("_t") &&
          generated.find(
            (s) => s.name === i.name.substring(0, i.name.length - 2)
          )
        ) {
          // Type traits with C++17 helpers
          combined.push({
            ...i,
            symbolType: "typeAliasTemplate",
            description: `Helper type of ${i.name.substring(
              0,
              i.name.length - 2
            )}`,
          });
        } else if (
          i.name.endsWith("_v") &&
          generated.find(
            (s) => s.name === i.name.substring(0, i.name.length - 2)
          )
        ) {
          // Type traits with C++17 helpers
          combined.push({
            ...i,
            symbolType: "variableTemplate",
            description: `Helper variable template of ${i.name.substring(
              0,
              i.name.length - 2
            )}`,
          });
        } else {
          // 枚举项、辅助类型等确实无法找到的名字
          const enumerator = MISSING_ENUMERATORS.find((e) => e.name === i.name);
          if (enumerator) {
            combined.push({
              ...i,
              symbolType: "enumerator",
              description: enumerator.description,
            });
            continue;
          }
          const helper = MISSING_HELPERS.find((e) => e.name === i.name);
          if (helper) {
            combined.push({
              ...i,
              symbolType: helper.type,
              description: helper.description,
            });
            continue;
          }
          const result = MISSING_RETURN_TYPES.find((r) => r.name === i.name);
          if (result) {
            combined.push({
              ...i,
              symbolType: "class",
              description: `Return type of ${i.name.substring(
                0,
                i.name.length - 7
              )}`,
            });
            continue;
          }
          // Nothing I can do now. Just leave it alone.
          if (i.symbolType === "template") {
            i.symbolType = "other";
          }
          combined.push({
            ...i,
            symbolType: i.symbolType,
            description: "",
          });
        }
      } else {
        // Original is OK
        combined.push({
          ...i,
          symbolType: i.symbolType,
          description: "",
        });
      }
    } else {
      // Match exactly
      combined.push({
        ...i,
        symbolType: markToType(t.mark, i.name),
        description: t.description,
      });
    }
  }

  // 第四步：修复已知错误
  for (const c of combined) {
    const err = NAMES_WITH_WRONG_TYPE.find((i) => i.name === c.name);
    if (err) {
      c.symbolType = err.type;
    }
    if (c.symbolType === "other") {
      console.log(c.name);
    }
  }

  return combined;
}
