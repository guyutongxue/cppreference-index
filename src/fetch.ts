import fetch from "node-fetch";

type MwApiResult = {
  parse: Record<"text" | "wikitext", { "*": string }>;
};

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
    `https://en.cppreference.com/mwiki/api.php?${params}`
  ).then((r) => r.json())) as MwApiResult;
  console.log("Fetch done");
  return result.parse[prop]["*"];
}
