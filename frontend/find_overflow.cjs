const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Use a typical iPhone viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.goto('http://localhost:5173/matches/1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const result = await page.evaluate(() => {
    // Add 10 questions to force scrolling
    const container = document.querySelector('.content-relative');
    if (container) {
      for(let i=0; i<10; i++) {
        const div = document.createElement('div');
        div.className = 'card dummy-q';
        div.style.height = '150px';
        div.style.marginBottom = '20px';
        div.innerHTML = `<h3>Dummy Question ${i+1}</h3>`;
        container.appendChild(div);
      }
    }

    return new Promise(resolve => {
      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const badElements = [];
        const allElements = document.querySelectorAll('*');

        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const absoluteBottom = rect.bottom + window.scrollY;
          const style = window.getComputedStyle(el);
          
          if (absoluteBottom > scrollHeight && style.position !== 'fixed' && rect.height > 0) {
            badElements.push({
              tag: el.tagName,
              className: el.className,
              id: el.id,
              bottom: absoluteBottom,
              diff: absoluteBottom - scrollHeight,
              position: style.position,
              display: style.display,
              height: style.height,
              overflow: style.overflow
            });
          }
        });

        resolve({
          scrollHeight,
          clientHeight: document.documentElement.clientHeight,
          innerHeight: window.innerHeight,
          badElements
        });
      }, 500);
    });
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
