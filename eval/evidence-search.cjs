const { chromium } = require("playwright");
const fs = require("node:fs");
// These queries were written before the first run. This small authored diagnostic
// is not independent human validation and must not be described as a user trial.
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage();
    // Use a same-origin source document without Vite's HMR client so parallel UI
    // edits cannot reload this diagnostic midway through inference.
    const origin = process.env.GAME_URL || "http://127.0.0.1:8894/";
    await page.goto(new URL("src/ai/model.ts", origin).href);
    const cases = JSON.parse(
      fs.readFileSync("eval/evidence-queries.json", "utf8"),
    );
    const result = await page.evaluate(async (cases) => {
      const { SemanticClient } = await import("/src/ai/client.ts");
      const { buildEvidencePassages } = await import("/src/game/passages.ts");
      const { keywordEvidenceSearch } = await import("/src/ai/retrieval.ts");
      const client = new SemanticClient();
      const start = performance.now();
      await client.load(() => {});
      const loadMs = Math.round(performance.now() - start);
      try {
        const results = [];
        for (const item of cases) {
          const passages = buildEvidencePassages(item.discovered);
          const semantic = await client.search(item.query, passages);
          const keyword = keywordEvidenceSearch(item.query, passages);
          const success = (hits) =>
            hits.some((hit) => item.expected.includes(hit.clueId));
          results.push({
            ...item,
            semantic,
            keyword,
            semanticFound: success(semantic),
            keywordFound: success(keyword),
          });
        }
        return { loadMs, results };
      } finally {
        client.cancel();
      }
    }, cases);
    const summary = {
      date: new Date().toISOString(),
      queryCount: cases.length,
      source: "authored development diagnostic; not independent validation",
      semanticTop3: result.results.filter((item) => item.semanticFound).length,
      keywordTop3: result.results.filter((item) => item.keywordFound).length,
      semanticTop1: result.results.filter(
        (item) =>
          item.semantic[0] && item.expected.includes(item.semantic[0].clueId),
      ).length,
      keywordTop1: result.results.filter(
        (item) =>
          item.keyword[0] && item.expected.includes(item.keyword[0].clueId),
      ).length,
      ...result,
    };
    fs.writeFileSync(
      "eval/evidence-search-results.json",
      JSON.stringify(summary, null, 2),
    );
    console.log(
      JSON.stringify({
        queryCount: summary.queryCount,
        semanticTop3: summary.semanticTop3,
        keywordTop3: summary.keywordTop3,
        loadMs: summary.loadMs,
      }),
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
