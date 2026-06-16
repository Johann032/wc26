const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Wait for React to render
  await new Promise(r => setTimeout(r, 3000));

  const result = await page.evaluate(() => {
    function getInfo(selector) {
      const el = document.querySelector(selector) || (selector === 'html' ? document.documentElement : selector === 'body' ? document.body : null);
      if (!el) return { found: false };
      const s = window.getComputedStyle(el);
      return {
        found: true,
        tagName: el.tagName,
        className: el.className,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        overflow: s.overflow,
        overflowY: s.overflowY,
        height: s.height,
        minHeight: s.minHeight,
        maxHeight: s.maxHeight,
        position: s.position,
        touchAction: s.touchAction,
        overscrollBehavior: s.overscrollBehavior
      };
    }
    
    const data = {
      html: getInfo('html'),
      body: getInfo('body'),
      root: getInfo('#root'),
      layout: getInfo('.layout'),
      layoutMain: getInfo('.layout__main'),
      bgPageWrapper: getInfo('.bg-page-wrapper'),
      hiddenElements: [],
      fixedElements: []
    };

    for(const node of document.querySelectorAll('*')) {
      const s = window.getComputedStyle(node);
      if(s.overflow === 'hidden' || s.overflowY === 'hidden' || s.overflow === 'clip') {
        data.hiddenElements.push({ tag: node.tagName, class: node.className, overflow: s.overflow });
      }
      if(s.position === 'fixed') {
        data.fixedElements.push({ tag: node.tagName, class: node.className, pointerEvents: s.pointerEvents });
      }
    }
    return data;
  });

  fs.writeFileSync('audit_output.json', JSON.stringify(result, null, 2));
  await browser.close();
})();
