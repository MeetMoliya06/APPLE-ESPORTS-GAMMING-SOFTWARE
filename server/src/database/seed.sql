-- ═══════════════════════════════════════════════════════════
-- GAMING CAFÉ ERP — SEED DATA
-- Default Super Admin + Sample Branch + Sample PCs
-- ═══════════════════════════════════════════════════════════

-- Default Super Admin
-- Password: Admin@2026 (bcrypt hash)
INSERT INTO users (id, email, password_hash, full_name, role, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@gamecafe.local',
  '$2a$12$LJ3m4ys3GZvNgFqMsPHJnOBYBDGVxVPxqKzmAqLhRzGrRPxYRkWXK',
  'Harshal (Super Admin)',
  'super_admin',
  'active'
);

-- Sample Branches (SOP examples)
INSERT INTO branches (id, name, address, opening_time, closing_time, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Adajan', 'Adajan, Surat', '10:00:00', '02:00:00', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'Citylight', 'Citylight, Surat', '10:00:00', '02:00:00', 'active'),
  ('b0000000-0000-0000-0000-000000000003', 'Katargam', 'Katargam, Surat', '10:00:00', '02:00:00', 'active');

-- Sample PCs for Adajan Branch (20 PCs)
INSERT INTO pcs (pc_number, branch_id, state) VALUES
  ('PC-01', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-02', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-03', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-04', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-05', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-06', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-07', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-08', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-09', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-10', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-11', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-12', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-13', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-14', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-15', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-16', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-17', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-18', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-19', 'b0000000-0000-0000-0000-000000000001', 'idle'),
  ('PC-20', 'b0000000-0000-0000-0000-000000000001', 'idle');

-- Sample PCs for Citylight Branch (15 PCs)
INSERT INTO pcs (pc_number, branch_id, state) VALUES
  ('PC-01', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-02', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-03', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-04', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-05', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-06', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-07', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-08', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-09', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-10', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-11', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-12', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-13', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-14', 'b0000000-0000-0000-0000-000000000002', 'idle'),
  ('PC-15', 'b0000000-0000-0000-0000-000000000002', 'idle');

-- Sample Operators
-- Password for all: Op@2026 (bcrypt hash)
INSERT INTO operators (id, full_name, username, password_hash, mobile_number, branch_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Rahul', 'rahul01', '$2a$12$LJ3m4ys3GZvNgFqMsPHJnOBYBDGVxVPxqKzmAqLhRzGrRPxYRkWXK', '9876543210', 'b0000000-0000-0000-0000-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000002', 'Meet', 'meet01', '$2a$12$LJ3m4ys3GZvNgFqMsPHJnOBYBDGVxVPxqKzmAqLhRzGrRPxYRkWXK', '9876543211', 'b0000000-0000-0000-0000-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000003', 'Priya', 'priya01', '$2a$12$LJ3m4ys3GZvNgFqMsPHJnOBYBDGVxVPxqKzmAqLhRzGrRPxYRkWXK', '9876543212', 'b0000000-0000-0000-0000-000000000002', 'active');

-- Sample Inventory for Adajan
INSERT INTO inventory (branch_id, item_name, category, price, current_stock, min_stock_limit) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Cold Coffee', 'Beverages', 120, 30, 5),
  ('b0000000-0000-0000-0000-000000000001', 'Hot Coffee', 'Beverages', 80, 40, 5),
  ('b0000000-0000-0000-0000-000000000001', 'Red Bull', 'Beverages', 150, 20, 5),
  ('b0000000-0000-0000-0000-000000000001', 'Coca Cola', 'Beverages', 40, 50, 10),
  ('b0000000-0000-0000-0000-000000000001', 'French Fries', 'Snacks', 100, 25, 5),
  ('b0000000-0000-0000-0000-000000000001', 'Chips', 'Snacks', 30, 40, 10),
  ('b0000000-0000-0000-0000-000000000001', 'Veg Burger', 'Meals', 120, 15, 3),
  ('b0000000-0000-0000-0000-000000000001', 'Cheese Pizza', 'Meals', 180, 10, 3),
  ('b0000000-0000-0000-0000-000000000001', 'Maggi', 'Meals', 60, 30, 5),
  ('b0000000-0000-0000-0000-000000000001', 'Brownie', 'Desserts', 80, 12, 3);

-- System Config
INSERT INTO system_config (config_key, config_value, description) VALUES
  ('session_pricing', '{"standard_per_hour": 60, "premium_per_hour": 100, "vip_per_hour": 150}', 'Gaming session pricing per hour'),
  ('reservation_rules', '{"grace_period_min": 15, "max_advance_hours": 24, "auto_expire": true}', 'Reservation configuration'),
  ('loyalty_rules', '{"gaming_points_per_100": 10, "food_points_per_100": 5, "points_to_inr": 0.2}', 'Loyalty point earning rules'),
  ('wallet_rules', '{"min_recharge": 100, "max_recharge": 10000, "max_balance": 50000}', 'Wallet configuration'),
  ('tax_settings', '{"gst_enabled": false, "gst_rate": 18}', 'Tax configuration');
