const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1360, height: 1000 } });
  await p.goto(process.env.GAME_URL || "http://127.0.0.1:8894");
  await p.getByRole("button", { name: /Enter the archive/ }).click();
  await p.screenshot({ path: "docs/first-playable.png", fullPage: true });
  await p.getByRole("button", { name: "02 Transmitter room" }).click();
  await p
    .getByRole("button", { name: /Four minutes missing/ })
    .first()
    .click();
  await p
    .getByRole("button", { name: /The manual carrier/ })
    .first()
    .click();
  await p
    .getByLabel("The last transmission, in reference time")
    .selectOption("23:18:00");
  await p
    .getByRole("checkbox", { name: "C2 · Four minutes missing", exact: true })
    .check();
  await p
    .getByRole("checkbox", { name: "C3 · The manual carrier", exact: true })
    .check();
  await p.getByRole("button", { name: /Check the evidence/ }).click();
  await p
    .getByRole("button", { name: /Still at the microphone/ })
    .first()
    .click();
  await p.getByRole("button", { name: "03 West Reach" }).click();
  await p
    .getByRole("button", { name: /Someone was listening/ })
    .first()
    .click();
  await p
    .getByLabel("What do the records establish?")
    .selectOption("confirmed");
  await p
    .getByRole("checkbox", {
      name: "C4 · Still at the microphone",
      exact: true,
    })
    .check();
  await p
    .getByRole("checkbox", { name: "C5 · Someone was listening", exact: true })
    .check();
  await p.getByRole("button", { name: /Check the evidence/ }).click();
  await p.getByRole("heading", { name: "Someone heard." }).waitFor();
  await p.reload();
  await p.getByRole("button", { name: /Enter the archive/ }).click();
  await p.getByRole("heading", { name: "Someone heard." }).waitFor();
  console.log("Full manual journey and saved-ending reload passed");
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
