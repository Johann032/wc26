const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    function getRules(selector) {
      const el = document.querySelector(selector) || (selector === 'html' ? document.documentElement : selector === 'body' ? document.body : null);
      if (!el) return;
      console.log(`\n--- RULES FOR ${selector} ---`);
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && el.matches(rule.selectorText)) {
              console.log(`${rule.selectorText} { ${rule.style.cssText} }`);
            }
          }
        } catch(e) {}
      }
    }
    getRules('html');
    getRules('body');
    getRules('#root');
    getRules('.layout');
    getRules('.layout__main');
    getRules('.bg-page-wrapper');
  });

  await browser.close();
})();
