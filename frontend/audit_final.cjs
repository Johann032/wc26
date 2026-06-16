const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Login
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    function checkNode(selector, name) {
      const node = document.querySelector(selector) || (selector === 'html' ? document.documentElement : selector === 'body' ? document.body : null);
      if (!node) {
        console.log(`[${name}] NOT FOUND`);
        return;
      }
      const s = window.getComputedStyle(node);
      console.log(`\n[${name}]`);
      console.log(`- scrollHeight: ${node.scrollHeight}, clientHeight: ${node.clientHeight}`);
      console.log(`- overflow: ${s.overflow} (overflow-x: ${s.overflowX}, overflow-y: ${s.overflowY})`);
      console.log(`- height: ${s.height}, min-height: ${s.minHeight}, max-height: ${s.maxHeight}`);
      console.log(`- position: ${s.position}`);
      if (node.scrollHeight > node.clientHeight) {
         console.log(`  => scrollHeight > clientHeight`);
      }
    }

    console.log("\n--- DOM ANALYSIS (HOME PAGE) ---");
    checkNode('html', 'html');
    checkNode('body', 'body');
    checkNode('#root', '#root');
    checkNode('.layout', 'Layout');
    checkNode('.layout__main', 'Layout__main');
    checkNode('.bg-page-wrapper', 'bg-page-wrapper');
    
    // Check if there's any element on the page that has overflow hidden
    const all = document.querySelectorAll('*');
    for(const node of all) {
        const s = window.getComputedStyle(node);
        if (s.overflow === 'hidden' || s.overflowY === 'hidden' || s.overflow === 'clip') {
            console.log(`OVERFLOW HIDDEN FOUND: ${node.tagName} .${node.className}`);
        }
    }

  });

  await browser.close();
})();
