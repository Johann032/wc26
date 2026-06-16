const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  page.on('console', msg => console.log(msg.text()));

  console.log("Navigating to http://localhost:5173...");
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  } catch (e) {
    console.error("Failed to load page.", e);
    process.exit(1);
  }

  await page.evaluate(() => {
    console.log("\n--- RUNTIME DOM AUDIT ---");

    function getScrollInfo(el, name) {
      if (!el) return;
      const style = window.getComputedStyle(el);
      console.log(`\n[${name}]`);
      console.log(`- scrollHeight: ${el.scrollHeight}, clientHeight: ${el.clientHeight}`);
      console.log(`- computed overflow: ${style.overflow} (x: ${style.overflowX}, y: ${style.overflowY})`);
      console.log(`- computed height: ${style.height}, max-height: ${style.maxHeight}`);
      console.log(`- computed position: ${style.position}`);
      
      const isScrollable = el.scrollHeight > el.clientHeight;
      const preventsScroll = style.overflowY === 'hidden' || style.overflowY === 'clip';
      if (isScrollable && preventsScroll) {
        console.log(`=> THIS ELEMENT HAS OVERFLOW BUT PREVENTS SCROLLING!`);
      } else if (isScrollable && style.overflowY !== 'visible') {
        console.log(`=> THIS ELEMENT ACTUALLY SCROLLS.`);
      }
    }

    getScrollInfo(document.documentElement, 'html');
    getScrollInfo(document.body, 'body');
    getScrollInfo(document.getElementById('root'), '#root');
    getScrollInfo(document.querySelector('.layout'), '.layout');
    getScrollInfo(document.querySelector('.layout__main'), '.layout__main');
    getScrollInfo(document.querySelector('.bg-page-wrapper'), '.bg-page-wrapper');
    getScrollInfo(document.querySelector('.login-page'), '.login-page');

    console.log("\nDOM Chain:");
    let current = document.querySelector('.bg-page-wrapper') || document.querySelector('.login-page') || document.body;
    let chain = [];
    while (current) {
      chain.push(current.tagName.toLowerCase() + (current.id ? '#'+current.id : '') + (current.className ? '.'+current.className.split(' ').join('.') : ''));
      current = current.parentElement;
    }
    console.log(chain.reverse().join(' -> '));
  });

  await browser.close();
})();
