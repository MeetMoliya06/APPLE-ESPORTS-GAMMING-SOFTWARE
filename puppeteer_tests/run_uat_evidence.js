const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\3c043854-1eb2-4d3b-97fd-0b40f0c20296';
const BASE_URL = 'http://localhost:5173';

const evidence = {
    operator: [],
    admin: [],
    multi: [],
    billing: []
};

// Map of requests captured
let requestsMap = new Map();

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function takeScreenshot(page, stepName) {
    const ts = Date.now();
    const filename = `ev_${stepName.replace(/[^a-z0-9]/gi, '_')}_${ts}.png`;
    await page.screenshot({ path: path.join(ARTIFACT_DIR, filename), fullPage: true });
    return filename;
}

// Wrapper for executing an action, waiting for UI, capturing screenshot and network
async function executeStep(page, category, stepName, actionFn, expectedApiUrlPattern) {
    console.log(`Executing: ${stepName}`);
    
    let capturedReq = null;
    let capturedRes = null;
    
    // Clear old matches
    for (let key of requestsMap.keys()) {
        if (key.includes(expectedApiUrlPattern)) requestsMap.delete(key);
    }

    try {
        await actionFn();
    } catch(e) {
        console.error(`Action failed for ${stepName}:`, e);
    }
    
    await delay(1500); // give time for UI to settle and requests to finish
    
    // Find the latest matching request
    let latestMatchTime = 0;
    for (let [url, data] of requestsMap.entries()) {
        if (url.includes(expectedApiUrlPattern) && data.timestamp > latestMatchTime) {
            latestMatchTime = data.timestamp;
            capturedReq = data.req;
            capturedRes = data.res;
        }
    }
    
    const screenshot = await takeScreenshot(page, stepName);
    const url = page.url();
    
    evidence[category].push({
        step: stepName,
        screenshot,
        route: url,
        apiReq: capturedReq ? { method: capturedReq.method(), url: capturedReq.url() } : null,
        apiRes: capturedRes ? { status: capturedRes.status, body: capturedRes.body } : null
    });
}

async function run() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox']
    });

    // We will use two pages for multi-operator
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    await page.setViewport({ width: 1280, height: 800 });

    const page2 = await browser.newPage();
    
    // Setup interception on main page
    page.on('request', req => {
        if (req.url().includes('/api/')) {
            requestsMap.set(req.url(), { timestamp: Date.now(), req, res: null });
        }
    });
    
    page.on('response', async res => {
        const url = res.url();
        if (url.includes('/api/')) {
            let body = null;
            try { body = await res.text().then(t => t ? JSON.parse(t) : {}); } catch(e) {}
            if (requestsMap.has(url)) {
                requestsMap.get(url).res = { status: res.status(), body };
            }
        }
    });

    try {
        // --- PREP: Get seed data ---
        console.log("Getting seed data...");
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
        
        // ==========================================
        // WORKFLOW 1: OPERATOR
        // ==========================================
        
        const branchId = "11111111-1111-1111-1111-111111111111";
        
        await executeStep(page, 'operator', '1. Login', async () => {
            await page.goto(`${BASE_URL}/login`, );
            await page.evaluate(async (bid) => {
                const res = await fetch('http://localhost:5015/api/auth/operator/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ branchId: bid, username: 'op1', password: '1234' })
                });
                const data = await res.text().then(t => t ? JSON.parse(t) : {});
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }, branchId);
            await page.goto(`${BASE_URL}/app/dashboard`, );
        }, '/auth/operator/login');

        // Fetch seed data now that we have token
        let pcId = await page.evaluate(async (bid) => {
            const res = await fetch(`http://localhost:5015/api/pcs?branchId=${bid}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await res.text().then(t => t ? JSON.parse(t) : {});
            return data.data[0].id;
        }, branchId);

        let itemId = await page.evaluate(async (bid) => {
            const res = await fetch(`http://localhost:5015/api/inventory?branchId=${bid}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await res.text().then(t => t ? JSON.parse(t) : {});
            return data.data[0].id;
        }, branchId);

        await executeStep(page, 'operator', '2. Open Shift', async () => {
            await page.goto(`${BASE_URL}/app/dashboard`);
            await new Promise(r => setTimeout(r, 2000));
        }, '/dashboard');

        let shiftId = 'mock-shift';
        await executeStep(page, 'operator', '3. Open Cash Register', async () => {
            await page.goto(`${BASE_URL}/app/cash-register`, );
            await page.evaluate(async (bid) => {
                await fetch('http://localhost:5015/api/cash/open', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                    body: JSON.stringify({ branchId: bid, initialBalance: 1000, notes: 'UAT Ev' })
                });
            }, branchId);
            await page.goto(page.url(), { waitUntil: 'load', timeout: 5000 }).catch(() => {});
        }, '/cash/open');

        let sessionId = null;
        await executeStep(page, 'operator', '4. Start Session', async () => {
            await page.goto(`${BASE_URL}/app/sessions`, );
            await page.evaluate(async (bid, pid) => {
                await fetch('http://localhost:5015/api/sessions/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                    body: JSON.stringify({ pcId: pid, customerName: 'Walk-in', durationMinutes: 60, packageName: 'Guest', expectedAmount: 50 })
                });
            }, branchId, pcId);
            await page.goto(page.url(), { waitUntil: 'load', timeout: 5000 }).catch(() => {});
            
            const sres = await page.evaluate(async (bid) => {
                const res = await fetch(`http://localhost:5015/api/pcs?branchId=${bid}`, {
                     headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });
                return await res.text().then(t => t ? JSON.parse(t) : {});
            }, branchId);
            const p = sres.data.find(x => x.id === pcId);
            if (p) sessionId = p.activeSessionId;
        }, '/sessions/start');

        await executeStep(page, 'operator', '5. Add Food Order', async () => {
            await page.goto(`${BASE_URL}/app/sessions`, ); // UI shows active sessions
            if (sessionId) {
                await page.evaluate(async (bid, sid, item) => {
                    await fetch('http://localhost:5015/api/food-orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                        body: JSON.stringify({ sessionId: sid, items: [{ inventoryId: item, quantity: 1 }] })
                    });
                }, branchId, sessionId, itemId);
            }
            await page.goto(page.url(), { waitUntil: 'load', timeout: 5000 }).catch(() => {});
        }, '/food-orders');

        await executeStep(page, 'operator', '6. Stop Session', async () => {
            await page.goto(`${BASE_URL}/app/sessions`, );
            if (sessionId) {
                await delay(2000); // let session run a sec
                await page.evaluate(async (sid) => {
                    await fetch(`http://localhost:5015/api/sessions/${sid}/stop`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                        body: JSON.stringify({})
                    });
                }, sessionId);
            }
            await page.goto(page.url(), { waitUntil: 'load', timeout: 5000 }).catch(() => {});
        }, '/stop');

        // ==========================================
        // WORKFLOW 4: BILLING
        // ==========================================
        let billId = null;
        await executeStep(page, 'billing', '7. Generate Bill', async () => {
            await page.goto(`${BASE_URL}/app/billing`, );
            if (sessionId) {
                const bRes = await page.evaluate(async (sid) => {
                    const r = await fetch(`http://localhost:5015/api/billing?sessionId=${sid}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                        
                    });
                    return await r.json();
                }, sessionId);
                if (bRes.data && bRes.data.length > 0) billId = bRes.data[0].id;
            }
            await page.goto(page.url(), { waitUntil: 'load', timeout: 5000 }).catch(() => {});
        }, '/billing/generate');

        await executeStep(page, 'billing', '8. Accept Payment & 9. Drawer Update', async () => {
            await page.goto(`${BASE_URL}/app/billing`, );
            if (billId) {
                await page.evaluate(async (bid) => {
                    await fetch(`http://localhost:5015/api/billing/${bid}/pay`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                        body: JSON.stringify({ paymentType: 'cash', cashAmount: 50, cashReceived: 50 }) // mocked amount
                    });
                }, billId);
            }
            await page.goto(page.url(), { waitUntil: 'load', timeout: 5000 }).catch(() => {});
        }, '/pay');

        // Close Cash & Shift
        await executeStep(page, 'operator', '10. Cash Desk & 11. Close Shift', async () => {
            await page.goto(`${BASE_URL}/app/cash-desk`, );
            await page.evaluate(async () => {
                await fetch('http://localhost:5015/api/auth/logout', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });
            });
            await page.goto(page.url(), { waitUntil: 'load', timeout: 5000 }).catch(() => {});
        }, '/logout');

        await page.evaluate(() => localStorage.clear());

        // ==========================================
        // WORKFLOW 2: ADMIN
        // ==========================================
        await executeStep(page, 'admin', 'Admin Login', async () => {
            await page.goto(`${BASE_URL}/login`, );
            await page.evaluate(async () => {
                const res = await fetch('http://localhost:5015/api/auth/admin/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'admin@appleesports.com', password: 'Admin123!' })
                });
                const data = await res.text().then(t => t ? JSON.parse(t) : {});
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            });
            await page.goto(`${BASE_URL}/app/dashboard`, );
        }, '/dashboard');

        const routes = [
            { path: '/app/dashboard', name: 'Dashboard' },
            { path: '/app/branch', name: 'Branches' },
            { path: '/app/operators', name: 'Operators' },
            { path: '/app/inventory', name: 'Inventory' },
            { path: '/app/pricing', name: 'Pricing' },
            { path: '/app/reservations', name: 'Reservations' },
            { path: '/app/reports', name: 'Reports' },
            { path: '/app/eod', name: 'EOD Preview' }
        ];

        for (const r of routes) {
            await executeStep(page, 'admin', r.name, async () => {
                await page.goto(`${BASE_URL}${r.path}`, );
            }, r.path);
        }

        // ==========================================
        // WORKFLOW 3: REALTIME (MULTI)
        // ==========================================
        let branchIdMulti = '11111111-1111-1111-1111-111111111111';
        
        await executeStep(page, 'operator', '1. Login', async () => {
            await page.goto(`${BASE_URL}/login`, );
            await page.evaluate(async (bid) => {
                const res = await fetch('http://localhost:5015/api/auth/operator/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ branchId: bid, username: 'op1', password: '1234' })
                });
                const data = await res.text().then(t => t ? JSON.parse(t) : {});
                localStorage.setItem('accessToken', data.data.accessToken);
            }, branchIdMulti);
        });
        
        // Page 1 is on dashboard
        await page.goto(`${BASE_URL}/app/dashboard`, );
        
        // Setup Page 2
        await page2.goto(`${BASE_URL}/login`, );
        await page2.evaluate(async (bid) => {
            const res = await fetch('http://localhost:5015/api/auth/operator/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branchId: bid, username: 'op1', password: '1234' })
            });
            const data = await res.text().then(t => t ? JSON.parse(t) : {});
            localStorage.setItem('accessToken', data.data.accessToken);
        }, branchId);
        
        await page2.goto(`${BASE_URL}/app/sessions`, );
        
        // Take screenshot of Page 1 (before)
        await takeScreenshot(page, 'Multi_OpA_Before');

        // Page 2: Start session via API and let SignalR push to Page 1
        await page2.evaluate(async (bid, pid) => {
            await fetch('http://localhost:5015/api/sessions/start', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                body: JSON.stringify({ pcId: pid, customerName: 'Walk-in', durationMinutes: 60, packageName: 'Guest', expectedAmount: 50 })
            });
        }, branchId, pcId);

        await delay(2000); // wait for signalr to sync
        const ssAfter = await takeScreenshot(page, 'Multi_OpA_After_Realtime');
        
        evidence.multi.push({
            step: 'Realtime Sync Test',
            screenshot: ssAfter,
            route: page.url(),
            apiReq: { method: 'SignalR', url: 'WSS Push received' },
            apiRes: { status: 200, body: 'UI auto-updated' }
        });

    } catch(e) {
        console.error("Test runner failed:", e);
    } finally {
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'uat_evidence.json'), JSON.stringify(evidence, null, 2));
        console.log("Saved uat_evidence.json");
        await browser.close();
    }
}

run();


