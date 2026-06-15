CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Insert Branches
INSERT INTO branches ("Id", "Name", "Address", "Status", "CreatedAt", "UpdatedAt") VALUES
('b0000000-0000-0000-0000-000000000001', 'Adajan', 'Adajan, Surat', 'active', NOW(), NOW()),
('b0000000-0000-0000-0000-000000000002', 'City Light', 'City Light, Surat', 'active', NOW(), NOW()),
('b0000000-0000-0000-0000-000000000003', 'Katargam', 'Katargam, Surat', 'active', NOW(), NOW()),
('b0000000-0000-0000-0000-000000000004', 'Varachha', 'Varachha, Surat', 'active', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. Insert Super Admin
INSERT INTO users ("Id", "Email", "PasswordHash", "FullName", "Role", "Status", "CreatedAt", "UpdatedAt")
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'admin@appleesports.com',
    crypt('Admin123!', gen_salt('bf', 12)),
    'System Admin',
    'super_admin',
    'active',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 3. Insert Pricing Profiles
INSERT INTO "PricingProfiles" ("Id", "BranchId", "Name", "BaseHourlyRate", "IsActive", "CreatedAt", "UpdatedAt") VALUES
-- Adajan
('20000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'PRO COMBAT DESK', 160.00, true, NOW(), NOW()),
-- City Light
('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'CHAMPION ZONE', 150.00, true, NOW(), NOW()),
('20000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'ELITE WAR ZONE', 160.00, true, NOW(), NOW()),
-- Katargam
('20000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'RECRUIT DECK', 160.00, true, NOW(), NOW()),
('20000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'VETERAN STAND', 170.00, true, NOW(), NOW()),
('20000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'VIP ELITE HUB', 180.00, true, NOW(), NOW()),
-- Varachha
('20000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'TITAN DESK', 180.00, true, NOW(), NOW()),
('20000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'GOD-TIER arena', 190.00, true, NOW(), NOW()),
('20000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'SOFA CLUB COUCH', 100.00, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Insert Operators
INSERT INTO operators ("Id", "BranchId", "Username", "PasswordHash", "FullName", "Status", "DashboardPermissions", "CreatedAt", "UpdatedAt") VALUES
-- Adajan
('30000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'jigar', crypt('1234', gen_salt('bf', 12)), 'Jigar Operator', 'active', '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}', NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'ankur', crypt('1234', gen_salt('bf', 12)), 'Ankur Operator', 'active', '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}', NOW(), NOW()),
-- City Light
('30000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'harshal', crypt('1234', gen_salt('bf', 12)), 'Harshal Operator', 'active', '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}', NOW(), NOW()),
('30000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'nazmin', crypt('1234', gen_salt('bf', 12)), 'Nazmin Operator', 'active', '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}', NOW(), NOW()),
-- Katargam
('30000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'karan', crypt('1234', gen_salt('bf', 12)), 'Karan Operator', 'active', '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}', NOW(), NOW()),
('30000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'mayur', crypt('1234', gen_salt('bf', 12)), 'Mayur Operator', 'active', '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}', NOW(), NOW()),
-- Varachha
('30000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'bhavdip', crypt('1234', gen_salt('bf', 12)), 'Bhavdip Operator', 'active', '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}', NOW(), NOW()),
('30000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'darshan', crypt('1234', gen_salt('bf', 12)), 'Darshan Operator', 'active', '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 5. Insert PCs and Consoles
DO $$
BEGIN
    -- Adajan PCs: 16 PCs
    FOR i IN 1..16 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'pc-adajan-' || i),
            'b0000000-0000-0000-0000-000000000001',
            '20000000-0000-0000-0000-000000000001',
            'PC-' || lpad(i::text, 2, '0'),
            'Gaming Rig ' || i,
            'PRO COMBAT DESK',
            '{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- City Light PCs: 35 PCs (1-20: CHAMPION ZONE, 21-35: ELITE WAR ZONE)
    FOR i IN 1..20 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'pc-citylight-' || i),
            'b0000000-0000-0000-0000-000000000002',
            '20000000-0000-0000-0000-000000000002',
            'PC-' || lpad(i::text, 2, '0'),
            'Gaming Rig ' || i,
            'CHAMPION ZONE',
            '{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    FOR i IN 21..35 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'pc-citylight-' || i),
            'b0000000-0000-0000-0000-000000000002',
            '20000000-0000-0000-0000-000000000003',
            'PC-' || lpad(i::text, 2, '0'),
            'Gaming Rig ' || i,
            'ELITE WAR ZONE',
            '{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Katargam PCs: 32 PCs (1-12: RECRUIT DECK, 13-22: VETERAN STAND, 23-32: VIP ELITE HUB)
    FOR i IN 1..12 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'pc-katargam-' || i),
            'b0000000-0000-0000-0000-000000000003',
            '20000000-0000-0000-0000-000000000004',
            'PC-' || lpad(i::text, 2, '0'),
            'Gaming Rig ' || i,
            'RECRUIT DECK',
            '{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    FOR i IN 13..22 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'pc-katargam-' || i),
            'b0000000-0000-0000-0000-000000000003',
            '20000000-0000-0000-0000-000000000005',
            'PC-' || lpad(i::text, 2, '0'),
            'Gaming Rig ' || i,
            'VETERAN STAND',
            '{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    FOR i IN 23..32 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'pc-katargam-' || i),
            'b0000000-0000-0000-0000-000000000003',
            '20000000-0000-0000-0000-000000000006',
            'PC-' || lpad(i::text, 2, '0'),
            'Gaming Rig ' || i,
            'VIP ELITE HUB',
            '{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Varachha PCs: 20 PCs (1-10: TITAN DESK, 11-20: GOD-TIER arena) and 3 PS5
    FOR i IN 1..10 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'pc-varachha-' || i),
            'b0000000-0000-0000-0000-000000000004',
            '20000000-0000-0000-0000-000000000007',
            'PC-' || lpad(i::text, 2, '0'),
            'Gaming Rig ' || i,
            'TITAN DESK',
            '{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    FOR i IN 11..20 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'pc-varachha-' || i),
            'b0000000-0000-0000-0000-000000000004',
            '20000000-0000-0000-0000-000000000008',
            'PC-' || lpad(i::text, 2, '0'),
            'Gaming Rig ' || i,
            'GOD-TIER arena',
            '{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    FOR i IN 1..3 LOOP
        INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'console-varachha-' || i),
            'b0000000-0000-0000-0000-000000000004',
            '20000000-0000-0000-0000-000000000009',
            'Console-' || lpad(i::text, 2, '0'),
            'PS5 Console ' || i,
            'SOFA CLUB COUCH',
            '{"cpu": "PlayStation 5", "gpu": "4K OLED (3x PS5)"}',
            'idle',
            true,
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 6. Insert Inventory
INSERT INTO inventory ("Id", "BranchId", "ItemName", "Category", "Price", "CurrentStock", "MinStockLimit", "Status", "CreatedAt", "UpdatedAt") VALUES
-- Adajan
(uuid_generate_v5(uuid_ns_dns(), 'inv1-adajan'), 'b0000000-0000-0000-0000-000000000001', 'Cola', 'Beverage', 50, 100, 10, 'available', NOW(), NOW()),
(uuid_generate_v5(uuid_ns_dns(), 'inv2-adajan'), 'b0000000-0000-0000-0000-000000000001', 'Chips', 'Snack', 30, 50, 5, 'available', NOW(), NOW()),
-- City Light
(uuid_generate_v5(uuid_ns_dns(), 'inv1-citylight'), 'b0000000-0000-0000-0000-000000000002', 'Cola', 'Beverage', 50, 100, 10, 'available', NOW(), NOW()),
(uuid_generate_v5(uuid_ns_dns(), 'inv2-citylight'), 'b0000000-0000-0000-0000-000000000002', 'Chips', 'Snack', 30, 50, 5, 'available', NOW(), NOW()),
-- Katargam
(uuid_generate_v5(uuid_ns_dns(), 'inv1-katargam'), 'b0000000-0000-0000-0000-000000000003', 'Cola', 'Beverage', 50, 100, 10, 'available', NOW(), NOW()),
(uuid_generate_v5(uuid_ns_dns(), 'inv2-katargam'), 'b0000000-0000-0000-0000-000000000003', 'Chips', 'Snack', 30, 50, 5, 'available', NOW(), NOW()),
-- Varachha
(uuid_generate_v5(uuid_ns_dns(), 'inv1-varachha'), 'b0000000-0000-0000-0000-000000000004', 'Cola', 'Beverage', 50, 100, 10, 'available', NOW(), NOW()),
(uuid_generate_v5(uuid_ns_dns(), 'inv2-varachha'), 'b0000000-0000-0000-0000-000000000004', 'Chips', 'Snack', 30, 50, 5, 'available', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. Insert Active Shifts (one active operator per branch)
INSERT INTO shifts ("Id", "BranchId", "OperatorId", "LoginTime", "Status", "CreatedAt") VALUES
(uuid_generate_v5(uuid_ns_dns(), 'shift-adajan'), 'b0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', NOW(), 'active', NOW()),
(uuid_generate_v5(uuid_ns_dns(), 'shift-citylight'), 'b0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', NOW(), 'active', NOW()),
(uuid_generate_v5(uuid_ns_dns(), 'shift-katargam'), 'b0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', NOW(), 'active', NOW()),
(uuid_generate_v5(uuid_ns_dns(), 'shift-varachha'), 'b0000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000007', NOW(), 'active', NOW())
ON CONFLICT DO NOTHING;
