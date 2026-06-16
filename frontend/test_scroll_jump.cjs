const puppeteer = require('puppeteer');
const fs = require('fs');

async function testPage(page, url, name, isVersionB) {
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  if (isVersionB) {
    await page.addStyleTag({ content: `
      .bg-image, .bg-overlay { height: 100% !important; }
      .login-page { overflow: visible !important; }
    `});
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test scrolling
  const initialScroll = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
  
  // To simulate mobile touch swipe, we dispatch touch events
  await page.evaluate(() => {
    const touchStart = new TouchEvent('touchstart', { touches: [new Touch({ identifier: 1, target: document.body, pageX: 180, pageY: 500 })] });
    const touchMove = new TouchEvent('touchmove', { touches: [new Touch({ identifier: 1, target: document.body, pageX: 180, pageY: 100 })] });
    const touchEnd = new TouchEvent('touchend', { changedTouches: [new Touch({ identifier: 1, target: document.body, pageX: 180, pageY: 100 })] });
    document.body.dispatchEvent(touchStart);
    document.body.dispatchEvent(touchMove);
    document.body.dispatchEvent(touchEnd);
    window.scrollBy(0, 400); // Fallback scroll
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const finalScroll = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
  const scrolled = finalScroll > initialScroll;
  
  // Check background visual jump
  const bgBounds = await page.evaluate(() => {
    const bg = document.querySelector('.bg-image');
    if (!bg) return null;
    return bg.getBoundingClientRect();
  });
  
  console.log(`[${name}] Scroll offset: ${initialScroll} -> ${finalScroll}. Scrolled: ${scrolled}`);
  if (bgBounds) {
    console.log(`[${name}] Background bounds: y=${bgBounds.y}, height=${bgBounds.height}`);
  }
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  console.log("--- VERSION A: CURRENT IMPLEMENTATION ---");
  await testPage(page, 'http://localhost:5173/login', 'Login Page', false);
  
  // Login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await testPage(page, 'http://localhost:5173/', 'Home Page', false);
  await testPage(page, 'http://localhost:5173/match/1', 'Match Details', false);
  
  console.log("\\n--- VERSION B: WITH CSS FIXES ---");
  await testPage(page, 'http://localhost:5173/login', 'Login Page', true);
  await testPage(page, 'http://localhost:5173/', 'Home Page', true);
  await testPage(page, 'http://localhost:5173/match/1', 'Match Details', true);

  await browser.close();
})();
