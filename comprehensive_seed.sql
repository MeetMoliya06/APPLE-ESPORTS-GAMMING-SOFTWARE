CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Branches
DO $$ 
BEGIN
    FOR i IN 1..4 LOOP
        INSERT INTO branches ("Id", "Name", "Address", "Status", "CreatedAt", "UpdatedAt")
        VALUES (
            uuid_generate_v5(uuid_ns_dns(), 'branch' || i), 
            'Branch ' || i, 
            i || '00 Gaming Ave', 
            'Active',
            NOW(), 
            NOW()
        ) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 2. Super Admin
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

-- 3. Operators, Pricing Profiles, PCs, Inventory, Shifts
DO $$
DECLARE
    branch_rec RECORD;
    op_id UUID;
    pp_id UUID;
    shift_id UUID;
    reg_id UUID;
BEGIN
    FOR branch_rec IN SELECT "Id" FROM branches LOOP
        
        -- Operators
        op_id := uuid_generate_v5(uuid_ns_dns(), 'op' || branch_rec."Id");
        INSERT INTO operators ("Id", "BranchId", "Username", "PasswordHash", "FullName", "Status", "DashboardPermissions", "CreatedAt", "UpdatedAt")
        VALUES (
            op_id,
            branch_rec."Id",
            'op_' || substr(branch_rec."Id"::text, 1, 4),
            crypt('1234', gen_salt('bf', 12)), 
            'Operator ' || substr(branch_rec."Id"::text, 1, 4),
            'Active',
            '{"main_dashboard": true, "billing_counter": true, "cash_register": true, "food_orders": true, "pc_status": true}',
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;

        -- Pricing Profile
        pp_id := uuid_generate_v5(uuid_ns_dns(), 'pp' || branch_rec."Id");
        INSERT INTO "PricingProfiles" ("Id", "BranchId", "Name", "BaseHourlyRate", "IsActive", "CreatedAt", "UpdatedAt")
        VALUES (
            pp_id,
            branch_rec."Id",
            'Standard Rate',
            100.00,
            true,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;

        -- 10 PCs per branch
        FOR i IN 1..10 LOOP
            INSERT INTO pcs ("Id", "BranchId", "PricingProfileId", "PcNumber", "PcName", "Zone", "Specs", "State", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt")
            VALUES (
                uuid_generate_v5(uuid_ns_dns(), 'pc' || branch_rec."Id" || i),
                branch_rec."Id",
                pp_id,
                'PC-' || lpad(i::text, 2, '0'),
                'Gaming Rig ' || i,
                'VIP Zone',
                '{"gpu": "RTX 4090", "cpu": "i9"}',
                0, -- Idle
                true,
                false,
                NOW(),
                NOW()
            ) ON CONFLICT DO NOTHING;
        END LOOP;

        -- Inventory
        INSERT INTO inventory ("Id", "BranchId", "ItemName", "Category", "Price", "CurrentStock", "MinStockLimit", "Status", "CreatedAt", "UpdatedAt")
        VALUES 
            (uuid_generate_v5(uuid_ns_dns(), 'inv1' || branch_rec."Id"), branch_rec."Id", 'Cola', 'Beverage', 50, 100, 10, 'Active', NOW(), NOW()),
            (uuid_generate_v5(uuid_ns_dns(), 'inv2' || branch_rec."Id"), branch_rec."Id", 'Chips', 'Snack', 30, 50, 5, 'Active', NOW(), NOW()),
            (uuid_generate_v5(uuid_ns_dns(), 'inv3' || branch_rec."Id"), branch_rec."Id", 'Burger', 'Food', 150, 20, 2, 'Active', NOW(), NOW())
        ON CONFLICT DO NOTHING;

        -- Active Shift
        shift_id := uuid_generate_v5(uuid_ns_dns(), 'shift' || branch_rec."Id");
        INSERT INTO shifts ("Id", "BranchId", "OperatorId", "LoginTime", "Status", "CreatedAt")
        VALUES (
            shift_id,
            branch_rec."Id",
            op_id,
            NOW(),
            'active',
            NOW()
        ) ON CONFLICT DO NOTHING;

    END LOOP;
END $$;
