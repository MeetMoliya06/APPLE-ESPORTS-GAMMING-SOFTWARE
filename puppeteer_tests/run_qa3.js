const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\3c043854-1eb2-4d3b-97fd-0b40f0c20296';
const BASE_URL = 'http://localhost:5173';

const report = {
    pages: [],
    placeholders: [],
    errors: [],
    signalr: []
};

async function runTests() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', request => {
        request.continue();
    });

    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/api/')) {
            const status = response.status();
            if (status >= 400) {
                let body = "";
                try {
                    body = await response.text();
                } catch(e) {}
                report.errors.push({ url, status, body });
            }
        }
    });

    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            report.errors.push({ type: 'console', text });
        }
        if (text.includes('SignalR')) {
            report.signalr.push(text);
        }
    });

    async function takeScreenshot(name) {
        const timestamp = Date.now();
        const filename = `media_${name}_${timestamp}.png`;
        const filepath = path.join(ARTIFACT_DIR, filename);
        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`Took screenshot: ${filename}`);
        return filename;
    }

    async function navigateAndAudit(name, urlPath, role) {
        console.log(`[${role}] Navigating to ${name}...`);
        try {
            await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch(e) {
            console.log(`Navigation timeout on ${name}, proceeding anyway...`);
        }
        
        // Wait an extra second for renders
        await new Promise(r => setTimeout(r, 1500));
        
        const screenshot = await takeScreenshot(name.replace(/ /g, '_'));

        const bodyText = await page.evaluate(() => document.body.innerText);
        const placeholders = ['Coming Soon', 'Under Construction', 'Placeholder', 'Not Implemented'];
        let hasPlaceholder = false;
        let foundPlaceholders = [];
        for (const p of placeholders) {
            if (bodyText.includes(p)) {
                hasPlaceholder = true;
                foundPlaceholders.push(p);
            }
        }

        report.pages.push({
            name,
            role,
            urlPath,
            screenshot,
            hasPlaceholder,
            foundPlaceholders,
            urlAfterNav: page.url()
        });
    }

    try {
        // --- OPERATOR WORKFLOW ---
        console.log("Logging in as Operator...");
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1500));
        
        // Wait for select branch to populate
        await page.waitForSelector('select', { timeout: 5000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 1000));

        await page.evaluate(() => {
            const select = document.querySelector('select');
            if (select && select.options.length > 1) {
                select.value = select.options[1].value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        await page.type('input[type="text"]', 'op1');
        await page.type('input[type="password"]', '1234');
        await page.click('button[type="submit"]');
        
        await new Promise(r => setTimeout(r, 3000)); // wait for login redirect
        
        await navigateAndAudit('Operator Dashboard', '/app/dashboard', 'Operator');
        await navigateAndAudit('Sessions', '/app/sessions', 'Operator');
        await navigateAndAudit('Billing', '/app/billing', 'Operator');
        await navigateAndAudit('Food Orders', '/app/food', 'Operator');
        await navigateAndAudit('Cash Register', '/app/cash/register', 'Operator');
        await navigateAndAudit('Cash Desk', '/app/cash/desk', 'Operator');
        await navigateAndAudit('Shift Management', '/app/shifts', 'Operator');

        // Logout
        console.log("Logging out...");
        await page.evaluate(() => {
            localStorage.clear();
        });
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1000));

        // --- SUPER ADMIN WORKFLOW ---
        console.log("Logging in as Super Admin...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const adminTab = buttons.find(b => b.innerText.toLowerCase().includes('admin'));
            if (adminTab) adminTab.click();
        });
        await new Promise(r => setTimeout(r, 500));

        await page.type('input[type="email"]', 'admin@appleesports.com');
        await page.type('input[type="password"]', 'Admin123!');
        
        await page.evaluate(() => {
            const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.type === 'submit');
            if (submitBtn) submitBtn.click();
        });
        
        await new Promise(r => setTimeout(r, 3000));

        await navigateAndAudit('Admin Dashboard', '/admin/dashboard', 'Admin');
        await navigateAndAudit('Branch Management', '/admin/branches', 'Admin');
        await navigateAndAudit('Operators', '/admin/operators', 'Admin');
        await navigateAndAudit('Inventory', '/admin/inventory', 'Admin');
        await navigateAndAudit('Pricing', '/admin/pricing', 'Admin');
        await navigateAndAudit('Reservations', '/app/reservations', 'Admin');
        await navigateAndAudit('EOD Dashboard', '/app/eod', 'Admin');
        await navigateAndAudit('Historical Reports', '/admin/reports', 'Admin');

    } catch (err) {
        console.error("Test execution error:", err);
    } finally {
        await browser.close();
        fs.writeFileSync('report_data.json', JSON.stringify(report, null, 2));
        console.log("Saved report_data.json");
    }
}

runTests();
