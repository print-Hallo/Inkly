const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  try {
    console.log("Navigating to handwrite page...");
    await page.goto("http://localhost:3000/handwrite");
    
    // Wait for the canvas to render
    await page.waitForSelector("canvas");

    // Draw something
    console.log("Drawing on canvas...");
    const canvas = await page.locator("canvas").first();
    const box = await canvas.boundingBox();
    if (box) {
        await page.mouse.move(box.x + 100, box.y + 100);
        await page.mouse.down();
        await page.mouse.move(box.x + 200, box.y + 200);
        await page.mouse.up();
    }

    // Click Save as PDF button
    console.log("Clicking 'Save as PDF' and waiting for download...");
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      page.getByText('Save as PDF').click()
    ]);

    const path = await download.path();
    console.log("Downloaded temp file to:", path);

    // Check file signature
    const buffer = fs.readFileSync(path);
    const signature = buffer.slice(0, 4).toString();
    console.log("File signature (Bytes 0-3):", signature);
    
    if (signature !== "%PDF") {
      console.error("FAILED: File does not start with '%PDF'. It is NOT a valid PDF.");
      process.exit(1);
    } else {
      console.log("SUCCESS: File is a valid PDF");
      console.log("File size:", buffer.length, "bytes");
    }
  } catch(e) {
    console.error("Test failed:", e);
  } finally {
    await browser.close();
  }
})();
