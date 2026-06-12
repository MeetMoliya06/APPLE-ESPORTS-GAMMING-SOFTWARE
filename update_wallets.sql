-- 1. Add new wallet columns to members table
ALTER TABLE members
ADD COLUMN "GamingBalance" numeric(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN "FoodBalance" numeric(10,2) NOT NULL DEFAULT 0.00;

-- 2. Migrate existing WalletBalance to GamingBalance (Assuming all existing wallet balance is meant for gaming)
UPDATE members
SET "GamingBalance" = "WalletBalance";

-- 3. Drop old WalletBalance column
ALTER TABLE members
DROP COLUMN "WalletBalance";

-- 4. Add TargetWallet column to wallet_transactions
ALTER TABLE wallet_transactions
ADD COLUMN "TargetWallet" varchar(20) NOT NULL DEFAULT 'Gaming';
