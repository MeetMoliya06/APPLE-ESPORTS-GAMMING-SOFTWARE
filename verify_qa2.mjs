import fs from 'fs';

const API_URL = 'http://localhost:5015/api';

async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    return { status: res.status, data };
  } catch (error) {
    return { status: 500, data: error.message };
  }
}

async function runVerification() {
  console.log("Starting QA.2 Runtime Verification...");
  const report = [];

  const logResult = (flow, status, data) => {
    const success = status >= 200 && status < 300;
    const msg = `[${success ? 'PASS' : 'FAIL'}] ${flow} (Status: ${status})`;
    console.log(msg);
    if (!success) console.log(JSON.stringify(data, null, 2));
    report.push(msg);
    if (!success) report.push(JSON.stringify(data, null, 2));
    return success;
  };

  // 1. Login Admin
  const loginRes = await request('/auth/admin/login', 'POST', {
    email: 'admin@neonarena.com',
    password: 'Admin123!'
  });
  if (!logResult("Super Admin Login", loginRes.status, loginRes.data)) return;
  
  const branchId = 'b0000000-0000-0000-0000-000000000001';

  // Let's get an operator to login
  const opRes = await request(`/auth/operator/login`, 'POST', {
    branchId: branchId,
    username: `jigar`,
    password: '1234'
  });
  
  if (!logResult("Operator Login", opRes.status, opRes.data)) return;
  const token = opRes.data.data.accessToken;

  // 2. Open Cash Register
  const openRegRes = await request(`/cash/register/open?branchId=${branchId}`, 'POST', {
    openingBalance: 1500
  }, token);
  
  if (openRegRes.status === 400 && typeof openRegRes.data?.message === 'string' && openRegRes.data.message.includes('already has an open')) {
    logResult("Open Cash Register (Already Open - OK)", 200, openRegRes.data);
  } else {
    logResult("Open Cash Register", openRegRes.status, openRegRes.data);
  }

  // 3. Create Session
  const pcsRes = await request(`/pcs?branchId=${branchId}`, 'GET', null, token);
  if (!logResult("Get PCs", pcsRes.status, pcsRes.data)) return;
  const pcId = pcsRes.data.data[0]?.id || pcsRes.data.data.items[0]?.id;
  
  const createSessionRes = await request(`/sessions/start?branchId=${branchId}`, 'POST', {
    pcId: pcId,
    sessionType: 'guest',
    guestName: 'QA Tester',
    amount: 100,
    startTime: new Date().toISOString()
  }, token);
  logResult("Create Session", createSessionRes.status, createSessionRes.data);

  // 4. Food Order
  const invRes = await request(`/inventory?branchId=${branchId}`, 'GET', null, token);
  if (!logResult("Get Inventory", invRes.status, invRes.data)) return;
  const invId = invRes.data.data[0]?.id || invRes.data.data.items[0]?.id;
  
  const createOrderRes = await request(`/food-orders?branchId=${branchId}`, 'POST', {
    pcId: pcId,
    customerName: 'QA Tester',
    items: [{ inventoryId: invId, quantity: 2 }]
  }, token);
  logResult("Create Food Order", createOrderRes.status, createOrderRes.data);
  
  // 5. Billing Dashboard 
  const dashboardSummary = await request(`/dashboard/summary?branchId=${branchId}`, 'GET', null, token);
  logResult("Dashboard Summary (UTC Date Test)", dashboardSummary.status, dashboardSummary.data);

  // 6. EOD Preview
  const eodPreviewRes = await request(`/eod/preview?branchId=${branchId}&targetDate=${new Date().toISOString()}`, 'GET', null, token);
  logResult("EOD Preview (UTC Date Test)", eodPreviewRes.status, eodPreviewRes.data);
  
  fs.writeFileSync('qa2_verification_log.txt', report.join('\n'));
  console.log("Verification complete. Log saved to qa2_verification_log.txt.");
}

runVerification();
