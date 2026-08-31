const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://127.0.0.1:8001/', { waitUntil: 'networkidle2' });
  
  // Wait a sec for any React render to crash
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
