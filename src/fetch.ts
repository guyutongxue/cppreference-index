import fetch from "node-fetch";
import { ProxyAgent } from "proxy-agent";

type MwApiResult = {
  parse: Record<"text" | "wikitext", { "*": string }>;
};

const agent = new ProxyAgent();

export async function fetchSrc(page: string, parsed = false): Promise<string> {
  console.log(`Fetching${parsed ? " parsed" : ""} ${page}...`);
  const prop = parsed ? "text" : "wikitext";
  const params = new URLSearchParams({
    action: "parse",
    format: "json",
    page,
    prop
  });
  const result = (await fetch(
    `https://en.cppreference.com/mwiki/api.php?${params}`,
    { agent }
  ).then((r) => r.json())) as MwApiResult;
  console.log("Fetch done");
  return result.parse[prop]["*"];
}
