import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const url = process.env.APP_URL ?? "http://127.0.0.1:5173/";
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

await fs.mkdir("test-artifacts", { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator(".body-scene canvas").waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(900);

  const canvasStats = await page.evaluate(() => {
    const canvas = document.querySelector(".body-scene canvas");
    if (!(canvas instanceof HTMLCanvasElement)) {
      return { width: 0, height: 0, nonBlankRatio: 0, error: "Canvas not found" };
    }

    const sample = document.createElement("canvas");
    sample.width = 96;
    sample.height = 96;
    const context = sample.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return { width: canvas.width, height: canvas.height, nonBlankRatio: 0, error: "2D context unavailable" };
    }

    context.drawImage(canvas, 0, 0, sample.width, sample.height);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    let nonBlank = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const alpha = pixels[index + 3];
      if (alpha > 8 && red + green + blue > 40) nonBlank += 1;
    }

    return {
      width: canvas.width,
      height: canvas.height,
      nonBlankRatio: nonBlank / (sample.width * sample.height),
    };
  });

  const screenshotPath = `test-artifacts/${viewport.name}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  results.push({ viewport: viewport.name, screenshotPath, canvasStats });
  await page.close();
}

await browser.close();

const failed = results.filter((result) => {
  return (
    result.canvasStats.width < 250 ||
    result.canvasStats.height < 350 ||
    result.canvasStats.nonBlankRatio < 0.02
  );
});

console.log(JSON.stringify(results, null, 2));

if (failed.length) {
  throw new Error(`Visual check failed for: ${failed.map((item) => item.viewport).join(", ")}`);
}
