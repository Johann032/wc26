const puppeteer = require('puppeteer');

async function testPage(page, url, name) {
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  // Inject the "Version B" fixes
  await page.addStyleTag({ content: `
    .bg-image, .bg-overlay { height: 100% !important; }
    .login-page { overflow: visible !important; }
  `});
  
  await new Promise(r => setTimeout(r, 1000));
  
  const beforeScroll = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
  
  // Simulate touch drag from bottom to top
  await page.mouse.move(180, 500);
  await page.mouse.down();
  await page.mouse.move(180, 100, { steps: 10 });
  await page.mouse.up();
  
  await new Promise(r => setTimeout(r, 1000));
  
  const afterScroll = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
  
  console.log(`[${name}] Scroll offset changed from ${beforeScroll} to ${afterScroll}. Scrolled: ${afterScroll > beforeScroll}`);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  console.log("--- VERSION B: WITH CSS FIXES ---");
  await testPage(page, 'http://localhost:5173/login', 'Login Page');
  
  // Login to access other pages
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await testPage(page, 'http://localhost:5173/', 'Home Page');
  await testPage(page, 'http://localhost:5173/match/1', 'Match Details (1)');
  await testPage(page, 'http://localhost:5173/tournaments/1', 'Tournament Page');
  await testPage(page, 'http://localhost:5173/leaderboard', 'Leaderboard');
  await testPage(page, 'http://localhost:5173/admin', 'Admin Dashboard');

  await browser.close();
})();
