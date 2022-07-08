import { MwNodes, MwParameter, MwTemplateNode, parseSrc } from "./parser";

function expectSingleText(nodes: MwNodes): string {
  const first = nodes[0];
  if (nodes.length !== 1 || first.type !== "Text") {
    throw new Error(
      `Expect single text node here. Got ${JSON.stringify(nodes)}.`
    );
  }
  return first.value;
}

function simplifyParameter(params: MwParameter[]) {
  const result: Record<string, string> = {};
  for (const param of params) {
    const key = expectSingleText(param.name);
    const value = expectSingleText(param.value);
    result[key] = value;
  }
  return result;
}

interface SimplifiedTemplate {
  name: string;
  params: Record<string, string>;
}

function simplifyTemplate(node: MwTemplateNode): SimplifiedTemplate {
  const name = expectSingleText(node.name);
  const params = simplifyParameter(node.params);
  return {
    name,
    params,
  };
}

function flatAndFilter(nodes: MwNodes): (string | SimplifiedTemplate)[] {
  return nodes.flatMap((node) => {
    switch (node.type) {
      case "Template":
        return [simplifyTemplate(node)];
      case "Text":
        return [node.value];
      case "Tag":
        return flatAndFilter(node.contents);
      default:
        return [];
    }
  });
}

interface IndexItem {}

function toIndexItems(original: (string | SimplifiedTemplate)[]) {
  const items: IndexItem[] = [];
  const firstItemTemplate = original.findIndex(
    (i) => typeof i === "object" && ["ltt", "ltf", "rlt"].includes(i.name)
  );
  for (let i = 0; i < original.length; i++) {}
}

export async function parseIndex() {
  const nodes = await parseSrc("cpp/symbol_index");
  const simplified = flatAndFilter(nodes);
  return JSON.stringify(simplified);
}
