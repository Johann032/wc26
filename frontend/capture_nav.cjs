const puppeteer = require('puppeteer');
const fs = require('fs');

const OUT_DIR = 'C:\\Users\\JOHANN\\.gemini\\antigravity\\brain\\16277a54-b988-496d-b1d7-c8cd2c315a27';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  console.log("Capturing Home...");
  await page.screenshot({ path: `${OUT_DIR}\\nav_home.png` });

  console.log("Capturing Match Details (scrolled down)...");
  await page.goto('http://localhost:5173/matches/1', { waitUntil: 'networkidle0' });
  // Add some questions to scroll down
  await page.evaluate(() => {
    const container = document.querySelector('.content-relative');
    if (container) {
      for(let i=0; i<12; i++) {
        const div = document.createElement('div');
        div.className = 'card dummy-q';
        div.style.height = '150px';
        div.style.marginBottom = '20px';
        div.innerHTML = `<h3>Dummy Question ${i+1}</h3>`;
        container.appendChild(div);
      }
    }
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT_DIR}\\nav_match.png` });

  console.log("Capturing Leaderboard...");
  await page.goto('http://localhost:5173/leaderboard', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: `${OUT_DIR}\\nav_leaderboard.png` });

  console.log("Capturing Admin...");
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: `${OUT_DIR}\\nav_admin.png` });

  await browser.close();
  console.log("Done");
})();
