const fs = require('fs');
async function run() {
    try {
        const loginRes = await fetch('http://localhost:5015/api/auth/operator/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branchId: '11111111-1111-1111-1111-111111111111', username: 'op1', password: '1234' })
        });
        const loginData = await loginRes.json();
        console.log(loginData);
    } catch(e) { console.error(e); }
}
run();
