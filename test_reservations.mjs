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

async function run() {
  console.log("Starting Reservation Verification Workflow...");
  const report = [];
  const log = (msg) => {
    console.log(msg);
    report.push(msg);
  };

  const branchId = 'b0000000-0000-0000-0000-000000000001';

  // 1. Operator Login
  const loginRes = await request('/auth/operator/login', 'POST', {
    branchId: branchId,
    username: 'jigar',
    password: '1234'
  });
  if (loginRes.status !== 200) {
    log(`[FAIL] Operator Login failed (Status: ${loginRes.status})`);
    console.log(loginRes.data);
    return;
  }
  const token = loginRes.data.data.accessToken;
  log(`[PASS] Operator Login successful.`);

  // 2. Fetch PCs
  const pcsRes = await request(`/pcs?branchId=${branchId}`, 'GET', null, token);
  if (pcsRes.status !== 200) {
    log(`[FAIL] Get PCs failed (Status: ${pcsRes.status})`);
    return;
  }
  const pcs = pcsRes.data.data;
  log(`[PASS] Fetched ${pcs.length} PCs.`);
  
  // Pick an idle PC
  const idlePc = pcs.find(p => p.state === 'Idle');
  if (!idlePc) {
    log(`[FAIL] No Idle PC found to perform test.`);
    return;
  }
  log(`[PASS] Selected PC: ${idlePc.name} (ID: ${idlePc.id})`);

  // 3. Create a valid reservation for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const resTime = tomorrow.toISOString();

  const createRes = await request('/reservations', 'POST', {
    pcId: idlePc.id,
    customerName: 'Reserved Player One',
    reservationTime: resTime,
    durationMin: 60,
    advanceDeposit: 50,
    gracePeriodMin: 15,
    notes: 'Test reservation'
  }, token);

  if (createRes.status !== 200) {
    log(`[FAIL] Create Reservation failed (Status: ${createRes.status})`);
    console.log(createRes.data);
    return;
  }
  const resId = createRes.data.data.id;
  log(`[PASS] Created reservation ${resId} for tomorrow.`);

  // 4. Try double booking (overlapping time slot)
  const doubleRes = await request('/reservations', 'POST', {
    pcId: idlePc.id,
    customerName: 'Double Booking Player',
    reservationTime: resTime, // same time
    durationMin: 60,
    advanceDeposit: 0
  }, token);

  if (doubleRes.status === 400 || doubleRes.status === 409 || doubleRes.status === 500) {
    log(`[PASS] Double booking blocked successfully (Status: ${doubleRes.status}).`);
  } else {
    log(`[FAIL] Double booking was NOT blocked! Status: ${doubleRes.status}`);
  }

  // 5. Create a reservation starting right now (within 5 minutes) to trigger immediate Reserved PC state
  const nowResTime = new Date(Date.now() + 2 * 60000).toISOString(); // starts in 2 minutes
  // Find another idle PC
  const secondIdlePc = pcs.find(p => p.state === 'Idle' && p.id !== idlePc.id);
  if (!secondIdlePc) {
    log(`[WARNING] No second Idle PC found; skipping immediate reservation check.`);
  } else {
    log(`[INFO] Creating immediate reservation on ${secondIdlePc.name} (ID: ${secondIdlePc.id})`);
    const immediateRes = await request('/reservations', 'POST', {
      pcId: secondIdlePc.id,
      customerName: 'Immediate Player',
      reservationTime: nowResTime,
      durationMin: 60,
      advanceDeposit: 100,
      gracePeriodMin: 15
    }, token);

    if (immediateRes.status !== 200) {
      log(`[FAIL] Immediate reservation creation failed (Status: ${immediateRes.status})`);
      console.log(immediateRes.data);
    } else {
      const immediateResId = immediateRes.data.data.id;
      log(`[PASS] Immediate reservation ${immediateResId} created.`);

      // Verify the PC status has transitioned to Reserved
      const checkPcRes = await request(`/pcs?branchId=${branchId}`, 'GET', null, token);
      const updatedPc = checkPcRes.data.data.find(p => p.id === secondIdlePc.id);
      log(`[INFO] PC ${secondIdlePc.name} status is now: ${updatedPc.state}`);
      if (updatedPc.state === 'Reserved') {
        log(`[PASS] PC transitioned to Reserved state immediately.`);
      } else {
        log(`[FAIL] PC did NOT transition to Reserved state immediately! Status: ${updatedPc.state}`);
      }

      // 6. Verify starting manual session on this PC is blocked
      const manualStart = await request(`/sessions/start?branchId=${branchId}`, 'POST', {
        pcId: secondIdlePc.id,
        customerName: 'Manual Intruder',
        durationMinutes: 60,
        packageName: 'Walk-in - 60m',
        expectedAmount: 100
      }, token);

      if (manualStart.status === 400 && manualStart.data?.code === 'PC_RESERVED') {
        log(`[PASS] Manual session start on reserved PC blocked successfully with PC_RESERVED code.`);
      } else {
        log(`[FAIL] Manual session start on reserved PC was NOT blocked correctly! Status: ${manualStart.status}, Code: ${manualStart.data?.code}`);
      }

      // 7. Test Override Reservation (with reason)
      const overrideRes = await request(`/reservations/${immediateResId}/override`, 'POST', {
        reason: 'VIP walk-in request'
      }, token);

      if (overrideRes.status === 200) {
        log(`[PASS] Reservation override succeeded.`);
        
        // Verify PC state resets back to Idle
        const checkPcResAfter = await request(`/pcs?branchId=${branchId}`, 'GET', null, token);
        const pcAfter = checkPcResAfter.data.data.find(p => p.id === secondIdlePc.id);
        if (pcAfter.state === 'Idle') {
          log(`[PASS] PC reset to Idle state after override.`);
        } else {
          log(`[FAIL] PC did NOT reset to Idle after override! State: ${pcAfter.state}`);
        }
      } else {
        log(`[FAIL] Reservation override failed (Status: ${overrideRes.status})`);
        console.log(overrideRes.data);
      }
    }
  }

  // 8. Test Starting a Reserved Session & Discount application
  // We will create an immediate reservation on the first PC, and start it
  const startPcRes = await request('/reservations', 'POST', {
    pcId: idlePc.id,
    customerName: 'Bill Test Player',
    reservationTime: new Date(Date.now() + 1 * 60000).toISOString(),
    durationMin: 60,
    advanceDeposit: 40,
    gracePeriodMin: 15
  }, token);

  if (startPcRes.status === 200) {
    const resToStartId = startPcRes.data.data.id;
    log(`[PASS] Created reservation ${resToStartId} to start.`);

    const startSessionRes = await request(`/reservations/${resToStartId}/start`, 'POST', {}, token);
    if (startSessionRes.status === 200) {
      log(`[PASS] Reserved session started.`);

      // Verify the bill is created with AdvanceDeposit applied as discount
      // Fetch unpaid bills
      const billsRes = await request(`/bills?branchId=${branchId}`, 'GET', null, token);
      const matchedBill = billsRes.data?.data?.items?.find(b => b.customerName === 'Bill Test Player');
      if (matchedBill) {
        log(`[INFO] Matched Bill Number: ${matchedBill.billNumber}, TotalAmount: ${matchedBill.totalAmount}, Subtotal: ${matchedBill.subtotal}`);
        if (matchedBill.totalAmount < matchedBill.subtotal) {
          log(`[PASS] Advance deposit applied as discount successfully! TotalAmount (₹${matchedBill.totalAmount}) < Subtotal (₹${matchedBill.subtotal}).`);
        } else {
          log(`[FAIL] Advance deposit was NOT applied as discount! TotalAmount (₹${matchedBill.totalAmount}) === Subtotal (₹${matchedBill.subtotal})`);
        }
      } else {
        log(`[FAIL] No bill found for started reserved session.`);
      }
    } else {
      log(`[FAIL] Starting reserved session failed (Status: ${startSessionRes.status})`);
      console.log(startSessionRes.data);
    }
  } else {
    log(`[FAIL] Creation of reservation for start check failed.`);
  }

  // 9. Cancel the first reservation we created
  const cancelRes = await request(`/reservations/${resId}/cancel`, 'POST', {
    reason: 'Player called to cancel'
  }, token);

  if (cancelRes.status === 200) {
    log(`[PASS] Cancel reservation succeeded.`);
  } else {
    log(`[FAIL] Cancel reservation failed (Status: ${cancelRes.status})`);
    console.log(cancelRes.data);
  }

  fs.writeFileSync('reservation_verification_log.txt', report.join('\n'));
  console.log("Verification finished. Results saved to reservation_verification_log.txt.");
}

run();
