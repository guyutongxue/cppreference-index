import fs from "node:fs";
import path from "node:path";
import { fetchSubpages, fetchDisplayTitles } from "./fetch";
import { DetailedSymbolIndex } from "./typing";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SubpageEntry {
  link: string;
  title: string;
}

interface SubpageResult {
  parent: string;
  subpages: SubpageEntry[];
}

interface Progress {
  linkToSubpages: Record<string, { pageid: number; title: string }[]>;
  allSubpagePageids: number[];
  processedLinks: string[];
}

async function readGeneratedJson(
  distDir: string
): Promise<DetailedSymbolIndex[]> {
  const jsonPath = path.join(distDir, "generated.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(
      `generated.json not found at ${jsonPath}. Run 'pnpm generate' first.`
    );
  }
  const raw = fs.readFileSync(jsonPath, "utf-8");
  return JSON.parse(raw) as DetailedSymbolIndex[];
}

function loadProgress(progressPath: string): Progress | null {
  if (fs.existsSync(progressPath)) {
    try {
      const raw = fs.readFileSync(progressPath, "utf-8");
      return JSON.parse(raw) as Progress;
    } catch {
      console.log("Failed to load progress file, starting fresh.");
      return null;
    }
  }
  return null;
}

function saveProgress(progressPath: string, progress: Progress): void {
  const outDir = path.dirname(progressPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(progressPath, JSON.stringify(progress, undefined, 2));
}

export async function getSubpages(
  distDirOrFile: string
): Promise<SubpageResult[]> {
  let allEntries: DetailedSymbolIndex[];
  let outputPath: string;

  const stat = fs.statSync(distDirOrFile);
  if (stat.isDirectory()) {
    allEntries = await readGeneratedJson(distDirOrFile);
    outputPath = path.join(distDirOrFile, "subpages.json");
  } else {
    const raw = fs.readFileSync(distDirOrFile, "utf-8");
    allEntries = JSON.parse(raw) as DetailedSymbolIndex[];
    outputPath = path.join(path.dirname(distDirOrFile), "subpages.json");
  }

  const progressPath = outputPath.replace(/\.json$/, "_progress.json");
  let progress = loadProgress(progressPath);
  const processedSet = new Set(progress?.processedLinks ?? []);
  const linkToSubpages = new Map(
    progress ? Object.entries(progress.linkToSubpages) : []
  );
  const allSubpagePageids: number[] = progress?.allSubpagePageids ?? [];

  if (progress) {
    console.log(
      `Resuming from progress: ${processedSet.size} links already processed, ${allSubpagePageids.length} subpages found.`
    );
  }

  const seen = new Set<string>();
  const uniqueLinks: string[] = [];

  for (const entry of allEntries) {
    if (
      entry.type === "symbol" &&
      (entry.symbolType === "class" || entry.symbolType === "classTemplate")
    ) {
      if (!seen.has(entry.link)) {
        seen.add(entry.link);
        if (!processedSet.has(entry.link)) {
          uniqueLinks.push(entry.link);
        }
      }
    }
  }

  if (progress) {
    console.log(
      `${uniqueLinks.length} remaining links out of ${processedSet.size + uniqueLinks.length} total unique links.`
    );
  } else {
    console.log(
      `Found ${uniqueLinks.length} unique class/classTemplate links.`
    );
  }

  const totalToProcess = uniqueLinks.length;
  let processedCount = 0;

  for (const link of uniqueLinks) {
    processedCount++;
    console.log(
      `Fetching subpages for "${link}" (${processedCount}/${totalToProcess})...`
    );
    const subpages = await fetchSubpages(link);
    if (subpages.length > 0) {
      linkToSubpages.set(link, subpages);
      allSubpagePageids.push(...subpages.map((s) => s.pageid));
    }
    processedSet.add(link);

    const currentProgress: Progress = {
      linkToSubpages: Object.fromEntries(linkToSubpages),
      allSubpagePageids,
      processedLinks: Array.from(processedSet),
    };
    saveProgress(progressPath, currentProgress);

    if (processedCount < totalToProcess) {
      await delay(300);
    }
  }

  const subpageCount = allSubpagePageids.length;
  console.log(
    `Fetched ${subpageCount} subpages across ${linkToSubpages.size} parent pages.`
  );

  console.log(
    `Fetching display titles for ${subpageCount} subpages in batches...`
  );
  const displayTitles = await fetchDisplayTitles(allSubpagePageids);

  const results: SubpageResult[] = [];
  for (const [parent, subpages] of linkToSubpages) {
    results.push({
      parent,
      subpages: subpages.map((s) => ({
        link: s.title,
        title: displayTitles.get(s.pageid) || s.title,
      })),
    });
  }

  const json = JSON.stringify(results, undefined, 2);
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, json);
  console.log(`Written ${results.length} parent entries to ${outputPath}`);

  if (fs.existsSync(progressPath)) {
    fs.unlinkSync(progressPath);
  }

  return results;
}
