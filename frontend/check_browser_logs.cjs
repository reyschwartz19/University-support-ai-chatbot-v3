const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('requestfailed', request => {
        console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
    
    console.log("Testing Admin...");
    await page.goto("http://localhost:3001/", { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("\nTesting Frontend Chat...");
    await page.goto("http://localhost:3000/", { waitUntil: 'networkidle0' });
    
    try {
        await page.type("input[type='text']", "hello");
        await page.keyboard.press("Enter");
        await new Promise(r => setTimeout(r, 2000));
    } catch(e) {}
    
    await browser.close();
})();
