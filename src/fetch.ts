import fetch from "node-fetch";
import { ProxyAgent } from "proxy-agent";
import { decodeXML } from "entities";

type MwApiResult = {
  parse: Record<"text" | "wikitext", { "*": string }>;
};

type AllPagesResult = {
  batchcomplete?: string;
  continue?: { apcontinue: string; continue: string };
  query: {
    allpages: { pageid: number; ns: number; title: string }[];
  };
};

type PagePropsResult = {
  query: {
    pages: Record<
      string,
      {
        pageid: number;
        ns: number;
        title: string;
        pageprops?: { displaytitle: string };
      }
    >;
  };
};

const agent = new ProxyAgent();

async function retryFetchJson<T>(
  url: string,
  retries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { agent });
      const text = await response.text();
      return JSON.parse(text) as T;
    } catch (e) {
      if (attempt === retries) throw e;
      console.log(`Retry ${attempt}/${retries} for ${url}...`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
  throw new Error("unreachable");
}

export async function fetchSrc(page: string, parsed = false): Promise<string> {
  console.log(`Fetching${parsed ? " parsed" : ""} ${page}...`);
  const prop = parsed ? "text" : "wikitext";
  const params = new URLSearchParams({
    action: "parse",
    format: "json",
    page,
    prop
  });
  const url = `https://en.cppreference.com/api.php?${params}`;
  const result = await retryFetchJson<MwApiResult>(url);
  console.log("Fetch done");
  return result.parse[prop]["*"];
}

export async function fetchSubpages(
  parentPage: string
): Promise<{ pageid: number; title: string }[]> {
  const results: { pageid: number; title: string }[] = [];
  let apcontinue: string | undefined;

  do {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      list: "allpages",
      apprefix: parentPage + "/",
      aplimit: "500",
    });
    if (apcontinue) {
      params.set("apcontinue", apcontinue);
      params.set("continue", "-||");
    }
    const url = `https://en.cppreference.com/api.php?${params}`;
    const data = await retryFetchJson<AllPagesResult>(url);
    results.push(...data.query.allpages);
    apcontinue = data.continue?.apcontinue;
  } while (apcontinue);

  return results;
}

export async function fetchDisplayTitles(
  pageids: number[]
): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  const BATCH_SIZE = 50;

  for (let i = 0; i < pageids.length; i += BATCH_SIZE) {
    const batch = pageids.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      pageids: batch.join("|"),
      prop: "pageprops",
    });
    const url = `https://en.cppreference.com/api.php?${params}`;
    const data = await retryFetchJson<PagePropsResult>(url);

    for (const page of Object.values(data.query.pages)) {
      if (page.pageprops?.displaytitle) {
        const plainText = decodeXML(
          page.pageprops.displaytitle.replace(/<[^>]*>/g, "")
        );
        result.set(page.pageid, plainText);
      }
    }
  }

  return result;
}
