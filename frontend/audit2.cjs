const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Login
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await page.goto('http://localhost:5173/match/1', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    console.log("\n--- ELEMENTS WITH OVERFLOW HIDDEN OR CLIP ---");
    const all = document.querySelectorAll('*');
    for (const node of all) {
      const style = window.getComputedStyle(node);
      if (style.overflow === 'hidden' || style.overflowY === 'hidden' || style.overflow === 'clip' || style.overflowY === 'clip') {
        console.log(`[${node.tagName}] class="${node.className}" id="${node.id}" => ${style.overflow}`);
      }
    }

    console.log("\n--- ELEMENTS WITH FIXED POSITION ---");
    for (const node of all) {
      const style = window.getComputedStyle(node);
      if (style.position === 'fixed') {
        console.log(`[${node.tagName}] class="${node.className}" id="${node.id}" => fixed (pointer-events: ${style.pointerEvents}, z-index: ${style.zIndex}, height: ${style.height}, width: ${style.width}, bottom: ${style.bottom})`);
      }
    }

    console.log("\n--- ELEMENTS WITH HEIGHT 100VH ---");
    for (const node of all) {
      const style = window.getComputedStyle(node);
      if (style.height === '667px' || style.minHeight === '667px') {
        console.log(`[${node.tagName}] class="${node.className}" id="${node.id}" => height: ${style.height}, min-height: ${style.minHeight}, max-height: ${style.maxHeight}`);
      }
    }
  });

  await browser.close();
})();
