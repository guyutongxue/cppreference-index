import { MwNodes, MwParameter, MwTemplateNode, parseSrc } from "./parser";
import { decodeHTML } from "entities";

function expectText(nodes: MwNodes): string {
  return nodes.map((node) => {
    if (node.type === "Comment") return "";
    if (node.type === "Text") return node.value;
    if (node.type === "HTMLEntity") {
      let text = node.value;
      if (!node.named && node.hexadecimal) text = node.hex_char + text;
      return decodeHTML(`&${text};`);
    }
    if (node.type === "Wikilink") {
      return expectText(node.text);
    }
    if (node.type === "Tag") {
      const tagName = expectText(node.tag).trim();
      if (tagName === "br") {
        return "\n";
      }
    }
    throw new Error(
      `Expect text node here. Got ${JSON.stringify(node)}.`
    );
  }).join("");
}

function simplifyParameter(params: MwParameter[]) {
  const result: Record<string, string> = {};
  for (const param of params) {
    const key = expectText(param.name).trim();
    const value = expectText(param.value).trim();
    result[key] = value;
  }
  return result;
}

interface SimplifiedTemplate {
  name: string;
  params: Record<string, string>;
}
export type SimplifiedNode = string | SimplifiedTemplate;

function simplifyTemplate(node: MwTemplateNode): SimplifiedTemplate {
  const name = expectText(node.name);
  const params = simplifyParameter(node.params);
  return {
    name,
    params,
  };
}

export type Marks = {
  since?: string;
  deprecated?: string;
  removed?: string;
};

export function generateMarks(t: SimplifiedTemplate) {
  const marks: Marks = {};
  if (t.name.startsWith("mark since ")) {
    marks.since = t.name.substring(11);
    return marks;
  } else if (t.name.startsWith("mark deprecated ")) {
    marks.deprecated = t.name.substring(16);
    return marks;
  } else if (t.name.startsWith("mark removed ")) {
    marks.removed = t.name.substring(13);
    return marks;
  } else if (t.name === "mark life") {
    if ("since" in t.params) {
      marks.since = t.params.since;
    }
    if ("deprecated" in t.params) {
      marks.deprecated = t.params.deprecated;
    }
    if ("removed" in t.params) {
      marks.removed = t.params.removed;
    }
    return marks;
  } else {
    return null;
  }
}

export function filterSymbols(
  nodes: MwNodes,
  isZombie = false
): SimplifiedNode[] {
  if (isZombie) {
    return filterZombies(nodes);
  } else {
    return nodes.flatMap((node) => {
      switch (node.type) {
        case "Template":
          return [simplifyTemplate(node)];
        case "Text":
          return [node.value];
        case "Tag":
          return filterSymbols(node.contents);
        default:
          return [];
      }
    });
  }
}

function filterZombies(nodes: MwNodes) {
  const filtered: SimplifiedNode[] = [];
  let zombieMemberNames = false;
  for (const node of nodes) {
    zombieMemberNames;
    switch (node.type) {
      case "Template": {
        if (!zombieMemberNames) {
          filtered.push(simplifyTemplate(node));
        }
        break;
      }
      case "Text": {
        if (!zombieMemberNames) {
          filtered.push(node.value);
        }
        break;
      }
      case "Heading": {
        if (node.level === 4) {
          zombieMemberNames = true;
        }
        if (node.level === 3) {
          zombieMemberNames = false;
        }
        break;
      }
      default:
        break;
    }
  }
  return filtered;
}
