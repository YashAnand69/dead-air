const { chromium } = require("playwright");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1360, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:8896/");
  await page.getByRole("button", { name: /Enter the archive/ }).click();
  await page.getByRole("button", { name: "02 Transmitter room" }).click();
  await page
    .getByRole("button", { name: /Four minutes missing/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: /The manual carrier/ })
    .first()
    .click();
  await page.getByLabel("First record", { exact: true }).selectOption("C2");
  await page.getByLabel("Second record", { exact: true }).selectOption("C3");
  const board = page.getByRole("region", {
    name: "Lay the records side by side.",
  });
  await board
    .getByRole("article", { name: /First source/ })
    .getByText(/exactly four minutes slow/)
    .waitFor();
  if (await board.getByRole("option", { name: /C5/ }).count())
    throw Error("Locked record in comparison");
  await page
    .getByRole("button", { name: "Enable on-device AI", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".model-state")
        ?.textContent?.includes("model ready"),
    null,
    { timeout: 90000 },
  );
  await page
    .getByLabel("Ask about the discovered records")
    .fill("Which clock stamps the transmitter log?");
  await page.getByRole("button", { name: /Find relevant evidence/ }).click();
  const results = page.getByRole("region", {
    name: "Related passages",
    exact: true,
  });
  await results
    .getByText(/Studio clock S-2 is exactly four minutes slow/)
    .waitFor({ timeout: 15000 });
  if (await results.getByText(/West Reach acknowledges/).count())
    throw Error("Locked evidence search leak");
  await board.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "docs/upgrade-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw Error("Mobile overflow");
  await page.screenshot({
    path: "docs/upgrade-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByText("Prepare for offline play", { exact: true }).click();
  await page
    .getByRole("button", { name: "Save game for offline play", exact: true })
    .click();
  await page.getByText(/Offline package saved/).waitFor({ timeout: 180000 });
  await context.setOffline(true);
  await page.reload({ waitUntil: "load" });
  await page.getByRole("button", { name: /Enter the archive/ }).click();
  if (
    (await page
      .getByRole("option", { name: /C3 · The manual carrier/ })
      .count()) < 1
  )
    throw Error("Save not restored offline");
  await page
    .getByRole("button", { name: "Enable on-device AI", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".model-state")
        ?.textContent?.includes("model ready"),
    null,
    { timeout: 90000 },
  );
  await page
    .getByLabel("Ask about the discovered records")
    .fill("Which clock stamps the transmitter log?");
  await page.getByRole("button", { name: /Find relevant evidence/ }).click();
  await page
    .getByRole("region", { name: "Related passages", exact: true })
    .getByText(/Studio clock S-2 is exactly four minutes slow/)
    .waitFor({ timeout: 15000 });
  if (errors.length) throw Error(errors.join("\n"));
  const report = {
    url: process.env.GAME_URL || "http://127.0.0.1:8896/",
    checkedAt: new Date().toISOString(),
    checks: [
      "two-record comparison",
      "locked records excluded",
      "real passage inference",
      "mobile width",
      "explicit offline package",
      "offline reload and saved progress",
      "offline model inference",
    ],
    errors,
  };
  fs.writeFileSync(
    "docs/upgrade-browser-result.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
