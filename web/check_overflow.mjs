import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 375, height: 812 });

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

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
