/**
 * NeonArena ERP — Load Test Simulator
 * Simulates 100 concurrent PC connections and 10 Operator actions (Billing, Cash) over a 60-second window.
 * Run with: node load-test.js
 * Prerequisites: npm install @microsoft/signalr node-fetch
 */

const signalR = require('@microsoft/signalr');
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5173/api';
const HUB_BASE = 'http://localhost:5173/hubs';

// In a real load test, we would first login and get JWT tokens.
// For this simulation, we assume a hardcoded admin token or test without auth if disabled for testing.
const TEST_TOKEN = "your-test-jwt-token"; 

const PC_COUNT = 100;
const OPERATOR_COUNT = 10;
const DURATION_MS = 60000; // 1 minute

let pcConnections = [];
let operatorConnections = [];

async function simulatePcStatus(pcId) {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${HUB_BASE}/pc-status?access_token=${TEST_TOKEN}`)
        .withAutomaticReconnect()
        .build();

    try {
        await connection.start();
        pcConnections.push(connection);
        console.log(`[PC-${pcId}] Connected to SignalR`);

        // Simulate random status updates
        const interval = setInterval(() => {
            // In a real app, PCs don't push directly via Hub, they call API.
            // Here we just listen to simulate connection load.
        }, 5000);

        setTimeout(async () => {
            clearInterval(interval);
            await connection.stop();
        }, DURATION_MS);

    } catch (err) {
        console.error(`[PC-${pcId}] Connection failed:`, err.message);
    }
}

async function simulateOperator(operatorId) {
    // Operator will constantly poll billing and cash APIs to simulate load
    const interval = setInterval(async () => {
        try {
            // Simulate fetching active bills
            const res = await fetch(`${API_BASE}/bills?page=1&pageSize=50`, {
                headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
            });
            if (res.ok) {
                console.log(`[OP-${operatorId}] Fetched active bills successfully.`);
            }
        } catch (err) {
            console.error(`[OP-${operatorId}] API error:`, err.message);
        }
    }, 2000); // Poll every 2 seconds

    setTimeout(() => {
        clearInterval(interval);
    }, DURATION_MS);
}

async function runLoadTest() {
    console.log("==========================================");
    console.log(" starting NeonArena ERP Load Test");
    console.log(` Target: ${PC_COUNT} PCs, ${OPERATOR_COUNT} Operators`);
    console.log(` Duration: ${DURATION_MS / 1000} seconds`);
    console.log("==========================================\n");

    // Spawn PC Connections (staggered slightly to avoid thundering herd)
    for (let i = 1; i <= PC_COUNT; i++) {
        setTimeout(() => simulatePcStatus(i), i * 50); // 50ms stagger
    }

    // Spawn Operators
    for (let i = 1; i <= OPERATOR_COUNT; i++) {
        setTimeout(() => simulateOperator(i), i * 200);
    }

    // Finish
    setTimeout(() => {
        console.log("\n==========================================");
        console.log(" Load Test Complete.");
        console.log(` Active PC Connections Maintained: ${pcConnections.filter(c => c.state === signalR.HubConnectionState.Connected).length}`);
        console.log("==========================================");
        process.exit(0);
    }, DURATION_MS + 5000);
}

runLoadTest();
