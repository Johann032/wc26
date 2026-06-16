const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await page.goto('http://localhost:5173/match/1', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    // Inject tall content
    const tall = document.createElement('div');
    tall.style.height = '3000px';
    tall.style.width = '100%';
    document.querySelector('.layout__main').appendChild(tall);

    // Let's find out what's at x=180, y=300 (middle of screen)
    const el = document.elementFromPoint(180, 300);
    console.log("Element at 180, 300: ", el.tagName, el.className, el.id);

    const el2 = document.elementFromPoint(10, 300);
    console.log("Element at 10, 300 (margin area): ", el2.tagName, el2.className, el2.id);

    // Let's list all elements with position: fixed or absolute that might cover the screen
    const all = document.querySelectorAll('*');
    for (const node of all) {
      const style = window.getComputedStyle(node);
      if ((style.position === 'fixed' || style.position === 'absolute') && style.pointerEvents !== 'none') {
        const rect = node.getBoundingClientRect();
        if (rect.width > 300 && rect.height > 500) {
          console.log(`POTENTIAL BLOCKER: ${node.tagName} .${node.className} id=${node.id} (${style.position}, ${rect.width}x${rect.height}, z-index: ${style.zIndex})`);
        }
      }
    }
  });

  await browser.close();
})();
