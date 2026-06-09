CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert Branch
INSERT INTO branches ("Id", "Name", "Address", "Status", "CreatedAt", "UpdatedAt")
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'Main Branch', 
    '123 Gaming Street', 
    'active',
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
    'active',
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
    'active',
    '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 4. Insert Pricing Profile
INSERT INTO "PricingProfiles" ("Id", "BranchId", "Name", "BaseHourlyRate", "IsActive", "CreatedAt", "UpdatedAt")
VALUES ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Standard', 100, true, NOW(), NOW()) ON CONFLICT DO NOTHING;

-- 5. Insert PC
INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
VALUES ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'PC-01', 'PC 01', 'VIP', '{}', 'idle', true, false, NOW(), NOW()) ON CONFLICT DO NOTHING;

-- 6. Insert Inventory
INSERT INTO inventory ("Id", "BranchId", "ItemName", "Category", "Price", "CurrentStock", "MinStockLimit", "Status", "CreatedAt", "UpdatedAt")
VALUES ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Coke', 'Beverage', 50, 100, 10, 'available', NOW(), NOW()) ON CONFLICT DO NOTHING;