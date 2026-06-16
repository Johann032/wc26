const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  console.log("Testing MatchDetailsPage with 10 questions...");
  await page.goto('http://localhost:5173/matches/1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const matchDetailsResult = await page.evaluate(() => {
    // 1. Force add 10 questions to the DOM to simulate the bug
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
        const data = {
          html: {
            scrollHeight: document.documentElement.scrollHeight,
            clientHeight: document.documentElement.clientHeight,
          },
          body: {
            scrollHeight: document.body.scrollHeight,
            clientHeight: document.body.clientHeight
          },
          lastQuestionReachable: false
        };

        const qNodes = document.querySelectorAll('.dummy-q');
        if (qNodes.length > 0) {
            const lastQ = qNodes[qNodes.length - 1];
            const rect = lastQ.getBoundingClientRect();
            // A question is reachable if its bottom is less than or equal to the scrollable height.
            const bottomPos = rect.bottom + window.scrollY;
            const scrollableHeight = document.documentElement.scrollHeight;
            
            // Check if bottomPos is reachable when scrolled fully down
            data.lastQuestionBottom = bottomPos;
            data.lastQuestionReachable = bottomPos <= scrollableHeight;
        }

        resolve(data);
      }, 100);
    });
  });

  console.log("MatchDetailsPage:", matchDetailsResult);

  console.log("Testing HomePage...");
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  const homeResult = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight
    };
  });
  console.log("HomePage:", homeResult);

  console.log("Testing Leaderboard...");
  await page.goto('http://localhost:5173/leaderboard', { waitUntil: 'networkidle0' });
  const leaderboardResult = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight
    };
  });
  console.log("Leaderboard:", leaderboardResult);

  console.log("Testing Admin...");
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
  const adminResult = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight
    };
  });
  console.log("Admin:", adminResult);

  await browser.close();
})();
