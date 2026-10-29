#!/usr/bin/env node
/**
 * Visual and accessibility audit for a whole site, in one pass.
 *
 * The single-route overflow check answers one question. This answers the rest
 * of them, for every route the sitemap knows about:
 *
 *   1. does the route answer at all
 *   2. does it overflow sideways on a small phone
 *   3. does the browser log an error on it
 *   4. does an image fail to load
 *   5. does an image miss its alt text
 *   6. does a link go nowhere (`href="#"`) or to a page that does not exist
 *   7. does the page break the dark theme with a light background
 *
 *   node scripts/check_visual.mjs https://secretimperium.com 375
 *   node scripts/check_visual.mjs https://secretimperium.com 375 --routes /,/archive/
 *
 * The routes come from the site's own sitemap, so a new page is audited the
 * moment it is published rather than when somebody remembers it.
 *
 * Requires playwright: npm i -D playwright && npx playwright install chromium
 */

import { chromium } from 'playwright';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/+$/, '');
const width = Number(process.argv[3] || 375);
const routeIndex = process.argv.indexOf('--routes');
const onlyRoutes = routeIndex === -1 ? null : process.argv[routeIndex + 1].split(',').map((route) => route.trim());

const TIMEOUT = 30000;

async function fetchText(url) {
    const response = await fetch(url, { redirect: 'follow' });
    return response.ok ? response.text() : '';
}

/** The routes the site publishes, plus any extra ones the caller asked for. */
async function discoverRoutes() {
    const routes = new Set(['/']);

    const sitemap = await fetchText(`${base}/sitemap.xml`);
    for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const url = match[1];
        if (!url.startsWith(base)) continue;
        const path = url.slice(base.length) || '/';
        routes.add(path);
    }

    if (onlyRoutes) {
        return onlyRoutes.map((route) => (route.startsWith('/') ? route : `/${route}`));
    }

    return [...routes];
}

/** Luminance of a colour string, 0 (black) to 255 (white). */
function luminance(rgb) {
    const parts = rgb.match(/\d+(\.\d+)?/g);
    if (!parts || parts.length < 3) return null;
    const [r, g, b] = parts.map(Number);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height: 812 } });

const findings = [];
const routes = await discoverRoutes();

console.log(`\nAuditing ${routes.length} route(s) at ${width}px — ${base}\n`);

for (const route of routes) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 200));
    });
    page.on('pageerror', (error) => pageErrors.push(String(error).slice(0, 200)));

    let status = 0;
    try {
        // `networkidle` waits for the page to go quiet, so a slow moment on
        // the network reads as a broken route. One retry separates a slow
        // page from a broken one — an audit that fires on noise teaches the
        // reader to ignore it.
        let lastError;
        for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
                const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: TIMEOUT });
                status = response?.status() ?? 0;
                lastError = null;
                break;
            } catch (error) {
                lastError = error;
            }
        }
        if (lastError) throw lastError;

        // Scroll the page so lazy images are requested before they are judged.
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let y = 0;
                const step = () => {
                    y += window.innerHeight;
                    window.scrollTo(0, y);
                    if (y < document.body.scrollHeight) setTimeout(step, 120);
                    else resolve();
                };
                step();
            });
        });
        await page.waitForTimeout(600);
    } catch (error) {
        findings.push({ route, kind: 'load', detail: error.message.slice(0, 160) });
        await page.close();
        continue;
    }

    const report = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

        const overflowing = [];
        document.querySelectorAll('*').forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.right > window.innerWidth + 1) {
                overflowing.push(`${element.tagName.toLowerCase()}${element.className && typeof element.className === 'string' ? `.${element.className.split(' ').filter(Boolean).slice(0, 2).join('.')}` : ''} (+${Math.round(rect.right - window.innerWidth)}px)`);
            }
        });

        const brokenImages = [];
        const missingAlt = [];
        document.querySelectorAll('img').forEach((image) => {
            const source = image.getAttribute('src') || image.getAttribute('data-src') || '';
            if (image.complete && image.naturalWidth === 0) brokenImages.push(source.slice(0, 120));
            if (!image.hasAttribute('alt')) missingAlt.push(source.slice(0, 120));
        });

        const placeholderLinks = [];
        document.querySelectorAll('a[href]').forEach((link) => {
            const href = link.getAttribute('href') || '';
            if (href === '#' || href === '' || href.startsWith('javascript:')) {
                placeholderLinks.push(`${href || '(empty)'} — ${(link.textContent || '').trim().slice(0, 40)}`);
            }
        });

        const internalLinks = [...new Set(
            [...document.querySelectorAll('a[href]')]
                .map((link) => link.getAttribute('href') || '')
                .filter((href) => href.startsWith('/') && !href.startsWith('//')),
        )];

        const bodyStyle = getComputedStyle(document.body);
        const bodyBackground = bodyStyle.backgroundColor;

        // A page that is dark and holds a light block is a broken theme. A
        // page that is light all the way through is a design, not a bug, so
        // the rule is only applied to a dark page.
        const lightBlocks = [];
        const viewportArea = window.innerWidth * window.innerHeight;
        document.querySelectorAll('body *').forEach((element) => {
            const style = getComputedStyle(element);
            const background = style.backgroundColor;
            if (!background || background === 'rgba(0, 0, 0, 0)' || background === 'transparent') return;
            const rect = element.getBoundingClientRect();
            const area = rect.width * rect.height;
            if (area < viewportArea * 0.4) return;
            lightBlocks.push({
                background,
                area,
                tag: element.tagName.toLowerCase(),
            });
        });
        lightBlocks.sort((a, b) => b.area - a.area);

        return {
            overflow,
            overflowing: overflowing.slice(0, 6),
            brokenImages: brokenImages.slice(0, 6),
            missingAlt: missingAlt.slice(0, 6),
            placeholderLinks: placeholderLinks.slice(0, 6),
            internalLinks,
            bodyBackground,
            bodyColor: bodyStyle.color,
            lightBlocks: lightBlocks.slice(0, 3),
        };
    });

    if (status >= 400) findings.push({ route, kind: 'status', detail: `HTTP ${status}` });
    if (report.overflow) findings.push({ route, kind: 'overflow', detail: report.overflowing.join(', ') });
    if (consoleErrors.length) findings.push({ route, kind: 'console', detail: consoleErrors.slice(0, 3).join(' | ') });
    if (pageErrors.length) findings.push({ route, kind: 'pageerror', detail: pageErrors.slice(0, 2).join(' | ') });
    if (report.brokenImages.length) findings.push({ route, kind: 'image', detail: report.brokenImages.join(', ') });
    if (report.missingAlt.length) findings.push({ route, kind: 'alt', detail: report.missingAlt.join(', ') });
    if (report.placeholderLinks.length) findings.push({ route, kind: 'deadlink', detail: report.placeholderLinks.join(', ') });

    const background = luminance(report.bodyBackground);
    const text = luminance(report.bodyColor);
    if (background !== null && background < 80) {
        // The page is dark. A light block inside it is the skeleton/page
        // mismatch that a reader sees as a flash of the wrong theme.
        const light = report.lightBlocks.find((block) => {
            const blockLuminance = luminance(block.background);
            return blockLuminance !== null && blockLuminance > 200;
        });
        if (light) {
            findings.push({
                route,
                kind: 'theme',
                detail: `a dark page holds a light ${light.tag} (${light.background})`,
            });
        }
    }

    // A link that goes nowhere on the site is a dead end the reader finds.
    for (const link of report.internalLinks) {
        if (link.startsWith('/api/')) continue;
        try {
            const response = await fetch(`${base}${link}`, { redirect: 'manual' });
            if (response.status >= 400) {
                findings.push({ route, kind: 'deadlink', detail: `${link} answers HTTP ${response.status}` });
            }
        } catch {
            // A link the site cannot even reach is reported by the load check.
        }
    }

    const problems = findings.filter((finding) => finding.route === route).length;
    console.log(`${problems === 0 ? 'PASS' : 'FAIL'}  ${route}${problems ? ` — ${problems} problem(s)` : ''}`);

    await page.close();
}

await browser.close();

console.log('');
if (findings.length === 0) {
    console.log(`Nothing to fix across ${routes.length} route(s).`);
} else {
    console.log(`${findings.length} finding(s):`);
    for (const finding of findings) {
        console.log(`  - [${finding.kind}] ${finding.route} — ${finding.detail}`);
    }
}

process.exit(findings.length > 0 ? 1 : 0);
