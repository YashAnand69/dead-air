const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    slowMo: 700,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: "docs/demo", size: { width: 1280, height: 800 } },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:8896/");
  await page.waitForTimeout(4000);
  await page.getByRole("button", { name: /Enter the archive/ }).click();
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: "02 Transmitter room" }).click();
  await page
    .getByRole("button", { name: /Four minutes missing/ })
    .first()
    .click();
  await page.waitForTimeout(3500);
  await page
    .getByRole("button", { name: /The manual carrier/ })
    .first()
    .click();
  await page.waitForTimeout(3500);
  await page.getByLabel("First record", { exact: true }).selectOption("C2");
  await page.getByLabel("Second record", { exact: true }).selectOption("C3");
  await page.locator("#comparison").scrollIntoViewIfNeeded();
  await page.waitForTimeout(5000);
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
    .waitFor();
  await page.waitForTimeout(5000);
  await page.getByRole("button", { name: /Read full record C2/ }).click();
  await page.waitForTimeout(3000);
  const video = page.video();
  await context.close();
  await video.saveAs("docs/dead-air-preview.webm");
  await browser.close();
  console.log(
    "Spoiler-light scripted preview recorded; this is not a human playtest.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
