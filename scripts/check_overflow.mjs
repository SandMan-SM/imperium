// Mobile overflow audit. Usage:
//   node scripts/check_overflow.mjs [url] [viewportWidth]
// Defaults to http://localhost:3000 at 375px (small-phone class).
// Requires playwright: npm i -D playwright && npx playwright install chromium
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3000';
const width = Number(process.argv[3] || 375);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width, height: 812 });

await page.goto(url, { waitUntil: 'networkidle' });

const result = await page.evaluate(() => {
    const html = document.documentElement;
    const overflowX = html.scrollWidth > html.clientWidth;
    
    const overflowEls = [];
    document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.right > window.innerWidth) {
            const overflowPx = Math.round(rect.right - window.innerWidth);
            if (overflowPx > 1) {
                const cls = typeof el.className === 'string' ? el.className.substring(0, 120) : '';
                overflowEls.push({
                    tag: el.tagName,
                    id: el.id || '',
                    class: cls,
                    right: Math.round(rect.right),
                    width: Math.round(rect.width),
                    innerWidth: window.innerWidth,
                    overflowPx
                });
            }
        }
    });
    
    return { 
        overflowX, 
        scrollWidth: html.scrollWidth, 
        clientWidth: html.clientWidth,
        overflowEls: overflowEls.slice(0, 20)
    };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
