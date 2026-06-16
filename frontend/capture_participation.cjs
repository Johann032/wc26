const puppeteer = require('puppeteer');

const OUT_DIR = 'C:\\Users\\JOHANN\\.gemini\\antigravity\\brain\\e8042ab0-8265-4059-aa17-ebb283492f2e';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  console.log("Logging in...");
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="text"]', 'Dad');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  console.log("Going to Admin Dashboard...");
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });

  console.log("Clicking Participation tab...");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.admin-tab'));
    const partTab = tabs.find(el => el.textContent.includes('Participation'));
    if (partTab) partTab.click();
  });

  // Wait for the select dropdown to appear
  await page.waitForSelector('select.input');
  
  console.log("Selecting Tournament...");
  await page.evaluate(() => {
    const select = document.querySelector('select.input');
    if (select && select.options.length > 1) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
      nativeInputValueSetter.call(select, select.options[1].value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  console.log("Waiting for match rows...");
  await page.waitForSelector('.admin-list-item');

  console.log("Clicking Expand...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button.btn--secondary'));
    const partBtn = btns.find(el => el.textContent.includes('Expand'));
    if (partBtn) partBtn.click();
  });
  
  // Wait for data to load
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Active Users');
  });
  
  await new Promise(r => setTimeout(r, 1000)); // Pause for rendering

  console.log("Capturing Screenshot...");
  await page.screenshot({ path: `${OUT_DIR}\\participation_tab.png` });

  await browser.close();
  console.log("Done");
})();
