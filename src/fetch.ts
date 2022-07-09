import fetch from "node-fetch";

type MediaWikiApiResult = {
  parse: {
    title: string;
    wikitext: {
      '*': string;
    }
  }
}

export async function fetchSrc(page: string): Promise<string> {
  const params = new URLSearchParams();
  console.log(`Fetching ${page}...`);
  params.set('action', 'parse');
  params.set('format', 'json');
  params.set('page', page);
  params.set('prop', 'wikitext');
  const result = await fetch(`https://en.cppreference.com/mwiki/api.php?${params}`).then(r => r.json()) as MediaWikiApiResult;
  console.log("Fetch done");
  return result.parse.wikitext['*'];
}
