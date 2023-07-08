import { fetchSrc } from "./fetch";
import cp from "node:child_process";
import { fileURLToPath } from "node:url";

async function launchPython(filepath: string, input: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const process = cp.spawn("python", [filepath]);
    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject({
          exitCode: code,
          stderr,
        });
      }
    });
    let stdout = "";
    let stderr = "";
    process.stdout.on("data", (c) => {
      stdout += c.toString();
    });
    process.stderr.on("data", (c) => {
      stderr += c.toString();
    });
    process.stdin.write(input);
    process.stdin.end();
  });
}

// Below typing translated from
// https://mwparserfromhell.readthedocs.io/en/latest/api/mwparserfromhell.nodes.html
export interface MwArgumentNode {
  type: "Argument";
  default: string | null;
  name: string;
}
export interface MwCommentNode {
  type: "Comment";
  contents: string;
}
export interface MwExternalLinkNode {
  type: "ExternalLink";
  brackets: boolean;
  title: MwNodes;
  url: MwNodes;
}
export interface MwHeadingNode {
  type: "Heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: MwNodes;
}
export interface MwHtmlEntityNode {
  type: "HTMLEntity";
  hex_char: "x" | "X";
  hexadecimal: boolean;
  named: boolean;
  value: string;
}
export interface MwTagNode {
  type: "Tag";
  attributes: MwAttribute[];
  closing_tag: MwNodes;
  closing_wiki_markup: string | null;
  contents: MwNodes;
  implicit: boolean;
  invalid: boolean;
  padding: string;
  self_closing: boolean;
  tag: MwNodes;
  wiki_markup: string | null;
  wiki_style_separator: string | null;
}
export interface MwTemplateNode {
  type: "Template";
  name: MwNodes;
  params: MwParameter[];
}
export interface MwTextNode {
  type: "Text";
  value: string;
}
export interface MwWikilinkNode {
  type: "Wikilink";
  text: MwNodes;
  title: MwNodes;
}
export type MwNode =
  | MwArgumentNode
  | MwCommentNode
  | MwExternalLinkNode
  | MwHeadingNode
  | MwHtmlEntityNode
  | MwTagNode
  | MwTemplateNode
  | MwTextNode
  | MwWikilinkNode;
export type MwNodes = MwNode[];
export interface MwAttribute {
  type: "Attribute";
  name: MwNodes;
  pad_after_eq: string;
  pad_before_eq: string;
  pad_first: string;
  quotes: string | null;
  value: MwNodes[];
}
export interface MwParameter {
  type: "Parameter";
  name: MwNodes;
  showkey: boolean;
  value: MwNodes;
}

export async function parseSrc(page: string) {
  const src = await fetchSrc(page);
  const parserFilepath = fileURLToPath(
    new URL("./parser.py", import.meta.url).href
  );
  const parsedJson = await launchPython(parserFilepath, src);
  return JSON.parse(parsedJson) as MwNodes;
}
