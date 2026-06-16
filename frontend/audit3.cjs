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
  
  // Go to match details page
  await page.goto('http://localhost:5173/match/1', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    // We add tall content so we can see scroll values
    const tall = document.createElement('div');
    tall.style.height = '3000px';
    tall.style.width = '100%';
    document.querySelector('.layout__main').appendChild(tall);

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

    console.log("\n--- DOM ANALYSIS ---");
    checkNode('html', 'html');
    checkNode('body', 'body');
    checkNode('#root', '#root');
    checkNode('.layout', 'Layout');
    checkNode('.layout__main', 'Layout__main');
    checkNode('.bg-page-wrapper', 'bg-page-wrapper');

    console.log("\n--- DOM CHAIN ---");
    let current = document.querySelector('.layout__main');
    let chain = [];
    while (current) {
      chain.push(current.tagName.toLowerCase() + (current.id ? '#'+current.id : '') + (current.className ? '.'+current.className.split(' ').join('.') : ''));
      current = current.parentElement;
    }
    console.log(chain.reverse().join(' -> '));
  });

  await browser.close();
})();
