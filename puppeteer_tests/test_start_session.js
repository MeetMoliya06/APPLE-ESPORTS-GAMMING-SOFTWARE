const fs = require('fs');
async function run() {
    try {
        const loginRes = await fetch('http://localhost:5015/api/auth/operator/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branchId: '11111111-1111-1111-1111-111111111111', username: 'op1', password: '1234' })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.accessToken;
        
        const pcRes = await fetch('http://localhost:5015/api/pcs?branchId=11111111-1111-1111-1111-111111111111', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pcData = await pcRes.json();
        const pcId = pcData.data[0].id;
        
        const startRes = await fetch('http://localhost:5015/api/sessions/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ pcId: pcId, customerName: 'Walk-in', durationMinutes: 60, packageName: 'Guest', expectedAmount: 50 })
        });
        console.log("Start Session Status:", startRes.status);
        console.log("Response:", await startRes.text());
    } catch(e) { console.error(e); }
}
run();
