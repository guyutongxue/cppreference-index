import { parseSrc } from "./parser";
import { generateMarks, filterSymbols, SimplifiedNode, Marks } from "./simplify";

interface IndexItem {
  namespace: string;
  symbolName: string;
  link: string;
  description?: string;
  modifiers: {
    namespace: boolean;
    function: boolean;
    template: boolean;
  };
  marks: Marks;
}

type Options = {
  basePage: string;
  namespace: string;
  zombie?: boolean;
};

/**
 * 从命名空间链接生成索引项
 * @param parent 是否为 {{rlpt}}，即相对于父亲路径的链接
 * @param target 命名空间名
 * @param param2
 * @returns
 */
async function namespaceToIndexItems(
  parent: boolean,
  target: string,
  { basePage, namespace }: Options
) {
  const pageSegs = basePage.split("/");
  if (parent) pageSegs.pop();
  pageSegs.push(target);
  const page = pageSegs.join("/");
  const result: IndexItem[] = [];
  result.push({
    namespace,
    symbolName: target,
    link: page,
    modifiers: {
      namespace: true,
      function: false,
      template: false,
    },
    marks: {},
  });
  if (!parent) {
    result.push(
      ...(await getItemsInPage({
        basePage: page,
        namespace: `${namespace}::${target}`,
      }))
    );
  }
  return result;
}

async function toIndexItems(original: SimplifiedNode[], options: Options) {
  function isItemTemplate(i: SimplifiedNode) {
    return (
      typeof i === "object" && ["ltt", "ltf", "rlt", "rlpt"].includes(i.name)
    );
  }

  const firstItemTemplate = original.findIndex(isItemTemplate);
  if (firstItemTemplate === -1) {
    return [];
  }
  const items: IndexItem[] = [];
  let pending: IndexItem | null = null;
  for (let i = firstItemTemplate; i < original.length; i++) {
    const now = original[i];
    if (typeof now === "object") {
      if (isItemTemplate(now)) {
        pending && items.push(pending);
        if (["rlt", "rlpt"].includes(now.name)) {
          // Namespace declarations
          items.push(
            ...(await namespaceToIndexItems(
              now.name === "rlpt",
              now.params["1"],
              options
            ))
          );
          pending = null;
        } else {
          // other names
          const link = now.params["1"];
          let symbolName = now.params["2"] ?? link.split("/").pop();
          let template = false;
          if (symbolName.endsWith("<>")) {
            symbolName = symbolName.substring(0, symbolName.length - 2);
            template = true;
          }
          pending = {
            namespace: options.namespace,
            symbolName,
            link,
            modifiers: {
              namespace: false,
              function: now.name === "ltf",
              template,
            },
            marks: {},
          };
        }
      } else {
        if (!pending) continue;
        const marks = generateMarks(now);
        pending.marks = { ...pending.marks, ...marks };
      }
    } else {
      // description
      const trimmed = now.trim();
      if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
        pending &&
          (pending.description = trimmed.substring(1, trimmed.length - 1));
      }
    }
  }
  pending && items.push(pending);
  return items;
}

async function getItemsInPage(options: Options) {
  const nodes = await parseSrc(options.basePage);
  const simplified = filterSymbols(nodes, options.zombie);
  return toIndexItems(simplified, options);
}

export type SymbolIndex = {
  type: "symbol";
} & IndexItem;

export async function getSymbols() {
  const items: SymbolIndex[] = (
    await Promise.all(
      [
        {
          basePage: "cpp/symbol_index/macro",
          namespace: "",
        },
        {
          basePage: "cpp/symbol_index",
          namespace: "std",
        },
        {
          basePage: "cpp/symbol_index/zombie_names",
          namespace: "std",
          zombie: true,
        },
      ].map(getItemsInPage)
    )
  )
    .flat()
    .map((i) => ({
      type: "symbol",
      ...i,
    }));
  return items;
}
