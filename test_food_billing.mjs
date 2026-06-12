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

async function testFoodBillingFlow() {
  console.log("=== STARTING FOOD ORDER & BILLING INTEGRATION TEST ===");

  // 1. Login Admin
  console.log("\n1. Logging in as Admin...");
  const adminRes = await request('/auth/admin/login', 'POST', {
    email: 'admin@neonarena.com',
    password: 'Admin123!'
  });
  if (adminRes.status !== 200) {
    console.error("FAIL: Admin login failed", adminRes.data);
    return;
  }
  const adminToken = adminRes.data.data.accessToken;
  const branchId = 'b0000000-0000-0000-0000-000000000001';
  console.log("PASS: Admin logged in.");

  // 2. Login Operator
  console.log("\n2. Logging in as Operator...");
  const opRes = await request('/auth/operator/login', 'POST', {
    branchId: branchId,
    username: 'jigar',
    password: '123' // wait, jigar password might be 1234 or 123
  });
  let operatorToken = "";
  if (opRes.status === 200) {
    operatorToken = opRes.data.data.accessToken;
  } else {
    // try password '1234'
    const opRes2 = await request('/auth/operator/login', 'POST', {
      branchId: branchId,
      username: 'jigar',
      password: '1234'
    });
    if (opRes2.status !== 200) {
      console.error("FAIL: Operator login failed", opRes2.data);
      return;
    }
    operatorToken = opRes2.data.data.accessToken;
  }
  console.log("PASS: Operator logged in.");

  // 3. Get first available PC
  console.log("\n3. Fetching PCs...");
  const pcsRes = await request(`/pcs?branchId=${branchId}`, 'GET', null, operatorToken);
  if (pcsRes.status !== 200) {
    console.error("FAIL: Could not fetch PCs", pcsRes.data);
    return;
  }
  const pcs = pcsRes.data.data || pcsRes.data.data.items;
  const pc = pcs.find(p => p.state === 'Idle');
  if (!pc) {
    console.error("FAIL: No Idle PCs available for testing.");
    return;
  }
  console.log(`PASS: Found Idle PC: ${pc.pcNumber} (ID: ${pc.id})`);

  // 4. Create Session
  console.log("\n4. Starting Session...");
  const sessionRes = await request(`/sessions/start?branchId=${branchId}`, 'POST', {
    pcId: pc.id,
    sessionType: 'guest',
    guestName: 'QA Food Tester',
    amount: 100,
    packageName: 'Guest 1 Hour', // Added PackageName
    startTime: new Date().toISOString()
  }, operatorToken);
  if (sessionRes.status !== 200) {
    console.error("FAIL: Could not start session", sessionRes.data);
    return;
  }
  const session = sessionRes.data.data;
  console.log(`PASS: Session started. Session ID: ${session.id}`);

  // 5. Get Inventory Item & Initial Stock
  console.log("\n5. Fetching Inventory...");
  const invRes = await request(`/inventory?branchId=${branchId}`, 'GET', null, operatorToken);
  if (invRes.status !== 200) {
    console.error("FAIL: Could not fetch inventory", invRes.data);
    return;
  }
  const items = invRes.data.data;
  const item = items[0];
  if (!item) {
    console.error("FAIL: No inventory items found.");
    return;
  }
  const initialStock = item.currentStock;
  const initialSold = item.soldQty || 0;
  console.log(`PASS: Found item: ${item.itemName}. Initial Stock: ${initialStock}, Initial Sold: ${initialSold}`);

  // 6. Place Order linked to Session
  console.log("\n6. Placing Food Order...");
  const orderRes = await request(`/food-orders?branchId=${branchId}`, 'POST', {
    sessionId: session.id,
    pcId: pc.id,
    customerName: 'QA Food Tester',
    items: [{ inventoryId: item.id, quantity: 2 }]
  }, operatorToken);
  if (orderRes.status !== 200) {
    console.error("FAIL: Could not place order", orderRes.data);
    return;
  }
  const order = orderRes.data.data;
  console.log(`PASS: Order placed. Order Number: ${order.orderNumber}. Status: ${order.status}`);

  // Check that stock hasn't changed yet (stock only updates on Delivered!)
  const checkInv1 = await request(`/inventory?branchId=${branchId}`, 'GET', null, operatorToken);
  const item1 = checkInv1.data.data.find(i => i.id === item.id);
  console.log(`Stock check after pending: Expected ${initialStock}, Actual: ${item1.currentStock}`);
  if (item1.currentStock !== initialStock) {
    console.error("FAIL: Stock was deducted prematurely!");
    return;
  }

  // 7. Transition order: Pending -> Preparing -> Delivered
  console.log("\n7. Preparing order...");
  const prepRes = await request(`/food-orders/${order.id}/status?branchId=${branchId}`, 'PUT', {
    status: 'Preparing'
  }, operatorToken);
  if (prepRes.status !== 200) {
    console.error("FAIL: Could not set preparing status", prepRes.data);
    return;
  }
  console.log("PASS: Order state moved to Preparing.");

  console.log("\n8. Delivering order (Stock deduction & Billing integration trigger)...");
  const deliverRes = await request(`/food-orders/${order.id}/status?branchId=${branchId}`, 'PUT', {
    status: 'Delivered'
  }, operatorToken);
  if (deliverRes.status !== 200) {
    console.error("FAIL: Could not set delivered status", deliverRes.data);
    return;
  }
  console.log("PASS: Order state moved to Delivered.");

  // 9. Verify Stock updated
  console.log("\n9. Verifying inventory stock update...");
  const checkInv2 = await request(`/inventory?branchId=${branchId}`, 'GET', null, operatorToken);
  const item2 = checkInv2.data.data.find(i => i.id === item.id);
  console.log(`Stock check after Delivered: Expected ${initialStock - 2}, Actual: ${item2.currentStock}`);
  console.log(`Sold Qty check after Delivered: Expected ${initialSold + 2}, Actual: ${item2.soldQty}`);
  if (item2.currentStock !== initialStock - 2 || item2.soldQty !== initialSold + 2) {
    console.error("FAIL: Stock/Sold counts did not update correctly on Delivery.");
    return;
  }
  console.log("PASS: Inventory count successfully updated.");

  // 10. Verify Billing Subtotal updated
  console.log("\n10. Verifying active session bill integration...");
  const billRes = await request(`/bills?branchId=${branchId}`, 'GET', null, operatorToken);
  if (billRes.status !== 200) {
    console.error("FAIL: Could not fetch active bills", billRes.data);
    return;
  }
  const bills = billRes.data.data?.items || [];
  const bill = bills.find(b => b.sessionId === session.id);
  if (!bill) {
    console.error("FAIL: Active bill not found for session!");
    return;
  }
  console.log(`Active Bill: Gaming Amount: ₹${bill.gamingAmount}, Food Amount: ₹${bill.foodAmount}, Subtotal: ₹${bill.subtotal}, Total: ₹${bill.totalAmount}`);
  const expectedFoodAmount = item.price * 2;
  if (bill.foodAmount !== expectedFoodAmount) {
    console.error(`FAIL: Food subtotal mismatch! Expected: ₹${expectedFoodAmount}, Actual: ₹${bill.foodAmount}`);
    return;
  }
  console.log("PASS: Bill items and food subtotal successfully updated!");

  console.log("\n=== ALL FLOWS COMPLETED & VERIFIED SUCCESSFULLY! ===");
}

testFoodBillingFlow();
