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

  await page.goto('http://localhost:5173/matches/1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(() => {
    // 1. Force add 10 questions to the DOM to simulate the bug
    const container = document.querySelector('.content-relative');
    if (container) {
      for(let i=0; i<10; i++) {
        const div = document.createElement('div');
        div.className = 'card animate-in dummy-q';
        div.style.height = '150px';
        div.style.marginBottom = '20px';
        div.innerHTML = `<h3>Dummy Question ${i}</h3>`;
        container.appendChild(div);
      }
    }

    // Give browser a tick to reflow
    return new Promise(resolve => {
      setTimeout(() => {
        const data = {
          html: {
            scrollHeight: document.documentElement.scrollHeight,
            clientHeight: document.documentElement.clientHeight,
            scrollTopMax: document.documentElement.scrollHeight - document.documentElement.clientHeight
          },
          body: {
            scrollHeight: document.body.scrollHeight,
            clientHeight: document.body.clientHeight
          },
          questionsContainer: {},
          questions: [],
          parents: []
        };

        const wrapper = document.querySelector('.content-relative');
        if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            data.questionsContainer = {
                scrollHeight: wrapper.scrollHeight,
                clientHeight: wrapper.clientHeight,
                height: rect.height,
                bottom: rect.bottom + window.scrollY
            };
        }

        const qNodes = document.querySelectorAll('.dummy-q');
        qNodes.forEach((node, idx) => {
          const rect = node.getBoundingClientRect();
          data.questions.push({
            index: idx + 1,
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            height: rect.height
          });
        });

        // Traverse parents from the last question
        let current = qNodes.length > 0 ? qNodes[qNodes.length - 1].parentElement : null;
        
        while (current && current !== document.documentElement) {
          const s = window.getComputedStyle(current);
          const rect = current.getBoundingClientRect();
          data.parents.push({
            tag: current.tagName,
            className: current.className,
            scrollHeight: current.scrollHeight,
            clientHeight: current.clientHeight,
            offsetHeight: current.offsetHeight,
            height: s.height,
            minHeight: s.minHeight,
            maxHeight: s.maxHeight,
            overflow: s.overflow,
            overflowY: s.overflowY,
            flex: s.flex,
            flexDirection: s.flexDirection,
            position: s.position,
            bottomAbs: rect.bottom + window.scrollY
          });
          current = current.parentElement;
        }

        resolve(data);
      }, 100);
    });
  });

  fs.writeFileSync('audit_cut_off.json', JSON.stringify(result, null, 2));
  await browser.close();
})();
