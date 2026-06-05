CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert Branch
INSERT INTO branches ("Id", "Name", "Address", "Status", "CreatedAt", "UpdatedAt")
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'Main Branch', 
    '123 Gaming Street', 
    'Active',
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;

-- 2. Insert Super Admin
INSERT INTO users ("Id", "Email", "PasswordHash", "FullName", "Role", "Status", "CreatedAt", "UpdatedAt")
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'admin@neonarena.com',
    crypt('Admin123!', gen_salt('bf', 12)),
    'System Admin',
    'super_admin',
    'Active',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 3. Insert Operator
INSERT INTO operators ("Id", "BranchId", "Username", "PasswordHash", "FullName", "Status", "DashboardPermissions", "CreatedAt", "UpdatedAt")
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'op1',
    crypt('1234', gen_salt('bf', 12)), 
    'John Operator',
    'Active',
    '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;
