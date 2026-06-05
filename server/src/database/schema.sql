-- ═══════════════════════════════════════════════════════════════════════
-- GAMING CAFÉ ERP — COMPLETE DATABASE SCHEMA
-- Derived from MASTER SOP §23: Database Architecture
-- All 22 tables with full relational integrity
-- ═══════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════
-- 1. BRANCHES — SOP §16: Branch Configuration
-- ═══════════════════════════════════════════════
CREATE TABLE branches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL UNIQUE,
  address       TEXT,
  opening_time  TIME DEFAULT '10:00:00',
  closing_time  TIME DEFAULT '02:00:00',
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- 2. USERS — Super Admin accounts
-- SOP §5.1: Highest authority level
-- ═══════════════════════════════════════════════
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  role          VARCHAR(20) DEFAULT 'super_admin' CHECK (role IN ('super_admin')),
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled')),
  last_login    TIMESTAMPTZ,
  device_info   JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- 3. OPERATORS — SOP §5.2: Branch-level operational role
-- SOP §19: Dashboard permissions per operator
-- ═══════════════════════════════════════════════
CREATE TABLE operators (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name           VARCHAR(100) NOT NULL,
  username            VARCHAR(50) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  mobile_number       VARCHAR(20),
  branch_id           UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  status              VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled', 'logged_out')),
  -- SOP §19.2: Dashboard Permission Control (per operator)
  dashboard_permissions JSONB DEFAULT '{
    "billing_counter": true,
    "sessions": true,
    "reservations": true,
    "food_orders": true,
    "cash_register": true,
    "cash_desk": true,
    "members": true,
    "menu_editor": true,
    "main_dashboard": true,
    "pc_status": false,
    "eod": false,
    "settings": false
  }'::jsonb,
  last_login          TIMESTAMPTZ,
  device_info         JSONB,
  created_by          UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operators_branch ON operators(branch_id);
CREATE INDEX idx_operators_status ON operators(status);

-- ═══════════════════════════════════════════════
-- 4. PCS — PC stations per branch
-- SOP §7.1: PC States (Idle, Active, Reserved, Awaiting Billing, Offline)
-- ═══════════════════════════════════════════════
CREATE TABLE pcs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pc_number     VARCHAR(20) NOT NULL,
  branch_id     UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  state         VARCHAR(20) DEFAULT 'idle' CHECK (state IN ('idle', 'active', 'reserved', 'awaiting_billing', 'offline')),
  current_session_id UUID,
  current_reservation_id UUID,
  last_active_at TIMESTAMPTZ,
  last_operator_id UUID REFERENCES operators(id),
  ip_address    VARCHAR(45),
  specs         JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pc_number, branch_id)
);

CREATE INDEX idx_pcs_branch ON pcs(branch_id);
CREATE INDEX idx_pcs_state ON pcs(state);

-- ═══════════════════════════════════════════════
-- 5. SHIFTS — Operator shift records
-- SOP §10: Shift accountability
-- ═══════════════════════════════════════════════
CREATE TABLE shifts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id   UUID NOT NULL REFERENCES operators(id),
  branch_id     UUID NOT NULL REFERENCES branches(id),
  login_time    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_time   TIMESTAMPTZ,
  device_info   JSONB,
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'force_closed')),
  -- SOP §18: Shift Summary stored at closure
  summary       JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shifts_operator ON shifts(operator_id);
CREATE INDEX idx_shifts_branch ON shifts(branch_id);
CREATE INDEX idx_shifts_status ON shifts(status);

-- ═══════════════════════════════════════════════
-- 6. SESSIONS — Gaming session records
-- SOP §7: Session Engine (full lifecycle)
-- ═══════════════════════════════════════════════
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pc_id           UUID NOT NULL REFERENCES pcs(id),
  branch_id       UUID NOT NULL REFERENCES branches(id),
  operator_id     UUID NOT NULL REFERENCES operators(id),
  shift_id        UUID REFERENCES shifts(id),
  customer_name   VARCHAR(100),
  member_id       UUID,
  -- Session timing
  start_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time        TIMESTAMPTZ,
  planned_duration_min INTEGER,
  actual_duration_min  INTEGER,
  -- Billing
  gaming_amount   DECIMAL(10,2) DEFAULT 0,
  food_amount     DECIMAL(10,2) DEFAULT 0,
  total_amount    DECIMAL(10,2) DEFAULT 0,
  -- State
  state           VARCHAR(20) DEFAULT 'active' CHECK (state IN ('active', 'reserved', 'awaiting_billing', 'completed', 'expired')),
  gaming_type     VARCHAR(50) DEFAULT 'standard',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_pc ON sessions(pc_id);
CREATE INDEX idx_sessions_branch ON sessions(branch_id);
CREATE INDEX idx_sessions_state ON sessions(state);
CREATE INDEX idx_sessions_operator ON sessions(operator_id);
CREATE INDEX idx_sessions_date ON sessions(start_time);

-- ═══════════════════════════════════════════════
-- 7. RESERVATIONS — SOP §8: Reservation System
-- Centralized system state — reflected everywhere
-- ═══════════════════════════════════════════════
CREATE TABLE reservations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pc_id             UUID NOT NULL REFERENCES pcs(id),
  branch_id         UUID NOT NULL REFERENCES branches(id),
  operator_id       UUID NOT NULL REFERENCES operators(id),
  customer_name     VARCHAR(100) NOT NULL,
  member_id         UUID,
  reservation_time  TIMESTAMPTZ NOT NULL,
  duration_min      INTEGER,
  grace_period_min  INTEGER DEFAULT 15,
  -- State tracking
  state             VARCHAR(20) DEFAULT 'pending' CHECK (state IN ('pending', 'active', 'completed', 'expired', 'cancelled', 'overridden')),
  started_at        TIMESTAMPTZ,
  expired_at        TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  -- Override tracking (SOP: requires permission + reason)
  override_by       UUID REFERENCES users(id),
  override_reason   TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_pc ON reservations(pc_id);
CREATE INDEX idx_reservations_branch ON reservations(branch_id);
CREATE INDEX idx_reservations_state ON reservations(state);
CREATE INDEX idx_reservations_time ON reservations(reservation_time);

-- ═══════════════════════════════════════════════
-- 8. BILLS — SOP §9: Billing Counter
-- Gaming + Food MUST remain separated
-- ═══════════════════════════════════════════════
CREATE TABLE bills (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number     VARCHAR(30) NOT NULL UNIQUE,
  session_id      UUID REFERENCES sessions(id),
  pc_id           UUID REFERENCES pcs(id),
  branch_id       UUID NOT NULL REFERENCES branches(id),
  operator_id     UUID NOT NULL REFERENCES operators(id),
  shift_id        UUID REFERENCES shifts(id),
  customer_name   VARCHAR(100),
  member_id       UUID,
  -- SOP: Gaming and food MUST remain separated
  gaming_amount   DECIMAL(10,2) DEFAULT 0,
  food_amount     DECIMAL(10,2) DEFAULT 0,
  subtotal        DECIMAL(10,2) DEFAULT 0,
  -- Discount (SOP §9.6: Super Admin only)
  discount_type   VARCHAR(20) CHECK (discount_type IN ('flat', 'percentage', 'coupon', NULL)),
  discount_value  DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_by     UUID REFERENCES users(id),
  discount_reason TEXT,
  -- Final
  total_amount    DECIMAL(10,2) DEFAULT 0,
  -- Payment details
  payment_type    VARCHAR(20) CHECK (payment_type IN ('cash', 'online', 'split', 'wallet')),
  cash_amount     DECIMAL(10,2) DEFAULT 0,
  online_amount   DECIMAL(10,2) DEFAULT 0,
  wallet_amount   DECIMAL(10,2) DEFAULT 0,
  -- SOP §9.5: Change return tracking
  cash_received   DECIMAL(10,2) DEFAULT 0,
  change_returned DECIMAL(10,2) DEFAULT 0,
  actual_cash_collected DECIMAL(10,2) DEFAULT 0,
  -- State
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'voided')),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bills_branch ON bills(branch_id);
CREATE INDEX idx_bills_session ON bills(session_id);
CREATE INDEX idx_bills_operator ON bills(operator_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_date ON bills(created_at);

-- ═══════════════════════════════════════════════
-- 9. BILL_ITEMS — Individual line items
-- ═══════════════════════════════════════════════
CREATE TABLE bill_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id       UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  item_type     VARCHAR(20) NOT NULL CHECK (item_type IN ('gaming', 'food')),
  item_name     VARCHAR(200) NOT NULL,
  quantity      INTEGER DEFAULT 1,
  unit_price    DECIMAL(10,2) NOT NULL,
  total_price   DECIMAL(10,2) NOT NULL,
  inventory_id  UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bill_items_bill ON bill_items(bill_id);

-- ═══════════════════════════════════════════════
-- 10. PAYMENTS — SOP §9.3: Payment records
-- Tracks cash/online/split/wallet with full traceability
-- ═══════════════════════════════════════════════
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id               UUID NOT NULL REFERENCES bills(id),
  branch_id             UUID NOT NULL REFERENCES branches(id),
  operator_id           UUID NOT NULL REFERENCES operators(id),
  payment_type          VARCHAR(20) NOT NULL CHECK (payment_type IN ('cash', 'online', 'split', 'wallet')),
  total_amount          DECIMAL(10,2) NOT NULL,
  cash_amount           DECIMAL(10,2) DEFAULT 0,
  online_amount         DECIMAL(10,2) DEFAULT 0,
  wallet_amount         DECIMAL(10,2) DEFAULT 0,
  -- SOP §15A: Cash tracking
  cash_received         DECIMAL(10,2) DEFAULT 0,
  change_returned       DECIMAL(10,2) DEFAULT 0,
  actual_cash_collected DECIMAL(10,2) DEFAULT 0,
  -- Gaming/Food split
  gaming_portion        DECIMAL(10,2) DEFAULT 0,
  food_portion          DECIMAL(10,2) DEFAULT 0,
  status                VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_bill ON payments(bill_id);
CREATE INDEX idx_payments_branch ON payments(branch_id);
CREATE INDEX idx_payments_date ON payments(created_at);
CREATE INDEX idx_payments_type ON payments(payment_type);

-- ═══════════════════════════════════════════════
-- 11. CASH_REGISTER — SOP §10: Physical Cash Drawer Management
-- Tracks opening balance + shift verification
-- ═══════════════════════════════════════════════
CREATE TABLE cash_register (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id              UUID NOT NULL REFERENCES shifts(id),
  branch_id             UUID NOT NULL REFERENCES branches(id),
  operator_id           UUID NOT NULL REFERENCES operators(id),
  -- SOP §6: Opening Balance
  opening_balance       DECIMAL(10,2) NOT NULL DEFAULT 0,
  -- Running totals (updated live)
  total_cash_sales      DECIMAL(10,2) DEFAULT 0,
  total_split_cash      DECIMAL(10,2) DEFAULT 0,
  expected_drawer_cash  DECIMAL(10,2) DEFAULT 0,
  -- SOP §18: Shift Closing Verification
  physical_cash_counted DECIMAL(10,2),
  cash_difference       DECIMAL(10,2),
  mismatch_reason       TEXT,
  -- State
  status                VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'verified', 'closed', 'mismatch')),
  opened_at             TIMESTAMPTZ DEFAULT NOW(),
  verified_at           TIMESTAMPTZ,
  closed_at             TIMESTAMPTZ
);

CREATE INDEX idx_cash_register_shift ON cash_register(shift_id);
CREATE INDEX idx_cash_register_branch ON cash_register(branch_id);

-- ═══════════════════════════════════════════════
-- 12. CASH_TRANSACTIONS — SOP §9: Individual cash transaction log
-- ═══════════════════════════════════════════════
CREATE TABLE cash_transactions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id      UUID NOT NULL REFERENCES cash_register(id),
  bill_id               UUID REFERENCES bills(id),
  branch_id             UUID NOT NULL REFERENCES branches(id),
  operator_id           UUID NOT NULL REFERENCES operators(id),
  pc_number             VARCHAR(20),
  -- SOP §15A: Only actual retained cash
  cash_amount           DECIMAL(10,2) NOT NULL,
  gaming_amount         DECIMAL(10,2) DEFAULT 0,
  food_amount           DECIMAL(10,2) DEFAULT 0,
  transaction_type      VARCHAR(30) DEFAULT 'billing' CHECK (transaction_type IN ('billing', 'wallet_recharge', 'refund')),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cash_txn_register ON cash_transactions(cash_register_id);
CREATE INDEX idx_cash_txn_date ON cash_transactions(created_at);

-- ═══════════════════════════════════════════════
-- 13. DENOMINATION_COUNTS — SOP §11.1: Denomination Counter
-- Operator enters at SHIFT END only
-- ═══════════════════════════════════════════════
CREATE TABLE denomination_counts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id      UUID NOT NULL REFERENCES cash_register(id),
  shift_id              UUID NOT NULL REFERENCES shifts(id),
  branch_id             UUID NOT NULL REFERENCES branches(id),
  operator_id           UUID NOT NULL REFERENCES operators(id),
  -- Denomination breakdown
  notes_2000            INTEGER DEFAULT 0,
  notes_500             INTEGER DEFAULT 0,
  notes_200             INTEGER DEFAULT 0,
  notes_100             INTEGER DEFAULT 0,
  notes_50              INTEGER DEFAULT 0,
  notes_20              INTEGER DEFAULT 0,
  notes_10              INTEGER DEFAULT 0,
  coins_5               INTEGER DEFAULT 0,
  coins_2               INTEGER DEFAULT 0,
  coins_1               INTEGER DEFAULT 0,
  -- Calculated
  counted_total         DECIMAL(10,2) NOT NULL,
  expected_total        DECIMAL(10,2) NOT NULL,
  difference            DECIMAL(10,2) DEFAULT 0,
  is_verified           BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- 14. INVENTORY — SOP §13: Menu Editor / Food Inventory
-- ═══════════════════════════════════════════════
CREATE TABLE inventory (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id         UUID NOT NULL REFERENCES branches(id),
  item_name         VARCHAR(200) NOT NULL,
  category          VARCHAR(100),
  price             DECIMAL(10,2) NOT NULL,
  current_stock     INTEGER DEFAULT 0,
  min_stock_limit   INTEGER DEFAULT 5,
  status            VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'out_of_stock', 'disabled')),
  image_url         TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_branch ON inventory(branch_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_category ON inventory(category);

-- ═══════════════════════════════════════════════
-- 15. INVENTORY_LOGS — SOP §12: Stock refill/reduction history
-- ═══════════════════════════════════════════════
CREATE TABLE inventory_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id  UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  branch_id     UUID NOT NULL REFERENCES branches(id),
  operator_id   UUID REFERENCES operators(id),
  action        VARCHAR(30) NOT NULL CHECK (action IN ('refill', 'sale', 'wastage', 'price_change', 'status_change')),
  quantity      INTEGER,
  old_value     TEXT,
  new_value     TEXT,
  reason        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inv_logs_item ON inventory_logs(inventory_id);
CREATE INDEX idx_inv_logs_date ON inventory_logs(created_at);

-- ═══════════════════════════════════════════════
-- 16. FOOD_ORDERS — SOP §12: Food Orders Dashboard
-- ═══════════════════════════════════════════════
CREATE TABLE food_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    VARCHAR(30) NOT NULL UNIQUE,
  session_id      UUID REFERENCES sessions(id),
  pc_id           UUID REFERENCES pcs(id),
  branch_id       UUID NOT NULL REFERENCES branches(id),
  operator_id     UUID REFERENCES operators(id),
  customer_name   VARCHAR(100),
  member_id       UUID,
  total_amount    DECIMAL(10,2) DEFAULT 0,
  payment_type    VARCHAR(20) CHECK (payment_type IN ('cash', 'online', 'split', 'wallet', 'session_bill')),
  -- SOP §8: Order Status System
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')),
  cancelled_reason TEXT,
  order_time      TIMESTAMPTZ DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,
  ready_at        TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_orders_branch ON food_orders(branch_id);
CREATE INDEX idx_food_orders_session ON food_orders(session_id);
CREATE INDEX idx_food_orders_status ON food_orders(status);
CREATE INDEX idx_food_orders_date ON food_orders(order_time);

-- ═══════════════════════════════════════════════
-- 17. FOOD_ORDER_ITEMS — Individual food items
-- ═══════════════════════════════════════════════
CREATE TABLE food_order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  inventory_id  UUID NOT NULL REFERENCES inventory(id),
  item_name     VARCHAR(200) NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit_price    DECIMAL(10,2) NOT NULL,
  total_price   DECIMAL(10,2) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_items_order ON food_order_items(order_id);

-- ═══════════════════════════════════════════════
-- 18. MEMBERS — SOP §14: Members Dashboard
-- ═══════════════════════════════════════════════
CREATE TABLE members (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_number     VARCHAR(30) NOT NULL UNIQUE,
  full_name         VARCHAR(100) NOT NULL,
  mobile_number     VARCHAR(20) NOT NULL UNIQUE,
  email             VARCHAR(255),
  status            VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'vip', 'suspended', 'inactive')),
  -- SOP §14.1: Wallet System
  wallet_balance    DECIMAL(10,2) DEFAULT 0,
  -- SOP §15: Loyalty Point System (gaming/food separated)
  gaming_points     INTEGER DEFAULT 0,
  food_points       INTEGER DEFAULT 0,
  total_points      INTEGER DEFAULT 0,
  -- Spending tracking (separated per SOP)
  total_gaming_spend DECIMAL(10,2) DEFAULT 0,
  total_food_spend   DECIMAL(10,2) DEFAULT 0,
  -- Branch
  home_branch_id    UUID REFERENCES branches(id),
  join_date         TIMESTAMPTZ DEFAULT NOW(),
  last_visit        TIMESTAMPTZ,
  created_by        UUID,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_mobile ON members(mobile_number);
CREATE INDEX idx_members_status ON members(status);

-- ═══════════════════════════════════════════════
-- 19. WALLET_TRANSACTIONS — SOP §14.1: Wallet System
-- Every wallet action MUST store payment type, operator, date/time, amount
-- ═══════════════════════════════════════════════
CREATE TABLE wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id),
  branch_id       UUID NOT NULL REFERENCES branches(id),
  operator_id     UUID REFERENCES operators(id),
  admin_id        UUID REFERENCES users(id),
  action          VARCHAR(30) NOT NULL CHECK (action IN ('recharge', 'deduction_gaming', 'deduction_food', 'correction', 'reward_redemption')),
  amount          DECIMAL(10,2) NOT NULL,
  balance_before  DECIMAL(10,2) NOT NULL,
  balance_after   DECIMAL(10,2) NOT NULL,
  -- SOP §11: Payment tracking for recharges
  payment_type    VARCHAR(20) CHECK (payment_type IN ('cash', 'online', 'split')),
  cash_amount     DECIMAL(10,2) DEFAULT 0,
  online_amount   DECIMAL(10,2) DEFAULT 0,
  -- Reference
  bill_id         UUID REFERENCES bills(id),
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_txn_member ON wallet_transactions(member_id);
CREATE INDEX idx_wallet_txn_date ON wallet_transactions(created_at);

-- ═══════════════════════════════════════════════
-- 20. LOYALTY_POINTS — SOP §15: Point tracking (gaming/food separated)
-- ═══════════════════════════════════════════════
CREATE TABLE loyalty_points (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id),
  branch_id       UUID NOT NULL REFERENCES branches(id),
  operator_id     UUID REFERENCES operators(id),
  admin_id        UUID REFERENCES users(id),
  action          VARCHAR(30) NOT NULL CHECK (action IN ('earn_gaming', 'earn_food', 'redeem', 'add_manual', 'remove_manual', 'correction')),
  category        VARCHAR(20) NOT NULL CHECK (category IN ('gaming', 'food', 'both')),
  points          INTEGER NOT NULL,
  points_before   INTEGER NOT NULL,
  points_after    INTEGER NOT NULL,
  bill_id         UUID REFERENCES bills(id),
  reward_type     VARCHAR(50),
  reward_value    DECIMAL(10,2),
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_member ON loyalty_points(member_id);

-- ═══════════════════════════════════════════════
-- 21. DISCOUNTS — SOP §9.6: Super Admin Only
-- ═══════════════════════════════════════════════
CREATE TABLE discounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id         UUID NOT NULL REFERENCES bills(id),
  branch_id       UUID NOT NULL REFERENCES branches(id),
  admin_id        UUID NOT NULL REFERENCES users(id),
  discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('flat', 'percentage', 'coupon')),
  discount_value  DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  reason          TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- 22. AUDIT_LOGS — SOP §22: Immutable Audit Trail
-- Every critical action MUST be logged
-- ═══════════════════════════════════════════════
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Who
  user_id       UUID,
  operator_id   UUID,
  user_role     VARCHAR(20) NOT NULL,
  user_name     VARCHAR(100) NOT NULL,
  -- What
  action        VARCHAR(50) NOT NULL,
  target_type   VARCHAR(50),
  target_id     UUID,
  -- Where
  branch_id     UUID REFERENCES branches(id),
  branch_name   VARCHAR(100),
  -- Details
  details       JSONB,
  ip_address    VARCHAR(45),
  device_info   JSONB,
  -- When (SOP: exact date + timestamp)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SOP: Audit logs are READ ONLY — no UPDATE/DELETE operations should be performed
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_operator ON audit_logs(operator_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_branch ON audit_logs(branch_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);

-- ═══════════════════════════════════════════════
-- SYSTEM CONFIGURATION TABLE
-- SOP §17: System Configuration Settings
-- ═══════════════════════════════════════════════
CREATE TABLE system_config (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key    VARCHAR(100) NOT NULL UNIQUE,
  config_value  JSONB NOT NULL,
  description   TEXT,
  updated_by    UUID REFERENCES users(id),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- Add foreign key references that had circular dependencies
-- ═══════════════════════════════════════════════
ALTER TABLE pcs ADD CONSTRAINT fk_pcs_session FOREIGN KEY (current_session_id) REFERENCES sessions(id) ON DELETE SET NULL;
ALTER TABLE pcs ADD CONSTRAINT fk_pcs_reservation FOREIGN KEY (current_reservation_id) REFERENCES reservations(id) ON DELETE SET NULL;
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE reservations ADD CONSTRAINT fk_reservations_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE food_orders ADD CONSTRAINT fk_food_orders_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE bills ADD CONSTRAINT fk_bills_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════
-- Updated At Trigger Function
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_branches_timestamp BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operators_timestamp BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pcs_timestamp BEFORE UPDATE ON pcs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_timestamp BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_timestamp BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_timestamp BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_timestamp BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_orders_timestamp BEFORE UPDATE ON food_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_timestamp BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
