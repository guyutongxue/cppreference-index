import { load } from "cheerio";
import { fetchSrc } from "./fetch";
import { HeaderIndex, Marks } from "./typing";

function order(headerName: string): number {
  if (headerName === "<type_traits>") return -1;
  else return 0;
}

export async function getHeaders(): Promise<HeaderIndex[]> {
  const html = await fetchSrc("cpp/header", true);
  const $ = load(html);
  $(".editsection").remove();
  const headers = $(".t-dsc:has(.t-dsc-member-div)")
    .map(function () {
      const tds = $(this).children();
      const td1 = tds.eq(0);
      const a = td1.find("a");
      const link = a.attr("href")?.substring(3); // remove /w/
      const name = a.text().trim();
      const marks: Marks = {};
      td1.find(".t-mark-rev")?.each(function () {
        const text = $(this).text().toLowerCase();
        if (/^\(deprecated in .*\)$/.test(text)) {
          marks.deprecated = text.substring(15, text.length - 1);
        } else if (/^\(removed in .*\)$/.test(text)) {
          marks.removed = text.substring(12, text.length - 1);
        } else {
          marks.since = text.substring(1, text.length - 1);
        }
      });
      const description = tds.eq(1).text().replace(/\s{2,}/g, " ").trim();
      if (!link) {
        throw new Error(`Link not found for header ${name}`);
      }
      return { type: "header", link, name, marks, description } as HeaderIndex;
    })
    .toArray();
  return headers.sort((a, b) => order(a.name) - order(b.name));
}
