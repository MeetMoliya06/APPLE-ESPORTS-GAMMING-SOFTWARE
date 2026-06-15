--
-- PostgreSQL database dump
--

\restrict w14UCc2ebO4EDa5ZTHnPkQSZ6pY9TSDATUItEdIQ2bQFZP4iW7bfIobAdaLHFTZ

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS "FK_wallet_transactions_users_AdminId";
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS "FK_wallet_transactions_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS "FK_wallet_transactions_members_MemberId";
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS "FK_wallet_transactions_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS "FK_wallet_transactions_bills_BillId";
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS "FK_system_config_users_UpdatedBy";
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS "FK_shifts_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS "FK_shifts_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS "FK_sessions_shifts_ShiftId";
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS "FK_sessions_pcs_PcId";
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS "FK_sessions_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS "FK_sessions_members_MemberId";
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS "FK_sessions_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "FK_reservations_users_OverrideBy";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "FK_reservations_pcs_PcId";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "FK_reservations_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "FK_reservations_members_MemberId";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "FK_reservations_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.pcs DROP CONSTRAINT IF EXISTS "FK_pcs_sessions_CurrentSessionId";
ALTER TABLE IF EXISTS ONLY public.pcs DROP CONSTRAINT IF EXISTS "FK_pcs_reservations_CurrentReservationId";
ALTER TABLE IF EXISTS ONLY public.pcs DROP CONSTRAINT IF EXISTS "FK_pcs_operators_LastOperatorId";
ALTER TABLE IF EXISTS ONLY public.pcs DROP CONSTRAINT IF EXISTS "FK_pcs_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.pcs DROP CONSTRAINT IF EXISTS "FK_pcs_PricingProfiles_PricingProfileId";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "FK_payments_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "FK_payments_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "FK_payments_bills_BillId";
ALTER TABLE IF EXISTS ONLY public.operators DROP CONSTRAINT IF EXISTS "FK_operators_users_CreatedBy";
ALTER TABLE IF EXISTS ONLY public.operators DROP CONSTRAINT IF EXISTS "FK_operators_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "FK_members_branches_HomeBranchId";
ALTER TABLE IF EXISTS ONLY public.loyalty_points DROP CONSTRAINT IF EXISTS "FK_loyalty_points_users_AdminId";
ALTER TABLE IF EXISTS ONLY public.loyalty_points DROP CONSTRAINT IF EXISTS "FK_loyalty_points_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.loyalty_points DROP CONSTRAINT IF EXISTS "FK_loyalty_points_members_MemberId";
ALTER TABLE IF EXISTS ONLY public.loyalty_points DROP CONSTRAINT IF EXISTS "FK_loyalty_points_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.loyalty_points DROP CONSTRAINT IF EXISTS "FK_loyalty_points_bills_BillId";
ALTER TABLE IF EXISTS ONLY public.inventory_logs DROP CONSTRAINT IF EXISTS "FK_inventory_logs_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.inventory_logs DROP CONSTRAINT IF EXISTS "FK_inventory_logs_inventory_InventoryId";
ALTER TABLE IF EXISTS ONLY public.inventory_logs DROP CONSTRAINT IF EXISTS "FK_inventory_logs_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS "FK_inventory_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.food_orders DROP CONSTRAINT IF EXISTS "FK_food_orders_sessions_SessionId";
ALTER TABLE IF EXISTS ONLY public.food_orders DROP CONSTRAINT IF EXISTS "FK_food_orders_pcs_PcId";
ALTER TABLE IF EXISTS ONLY public.food_orders DROP CONSTRAINT IF EXISTS "FK_food_orders_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.food_orders DROP CONSTRAINT IF EXISTS "FK_food_orders_members_MemberId";
ALTER TABLE IF EXISTS ONLY public.food_orders DROP CONSTRAINT IF EXISTS "FK_food_orders_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.food_order_items DROP CONSTRAINT IF EXISTS "FK_food_order_items_inventory_InventoryId";
ALTER TABLE IF EXISTS ONLY public.food_order_items DROP CONSTRAINT IF EXISTS "FK_food_order_items_food_orders_OrderId";
ALTER TABLE IF EXISTS ONLY public.discounts DROP CONSTRAINT IF EXISTS "FK_discounts_users_AdminId";
ALTER TABLE IF EXISTS ONLY public.discounts DROP CONSTRAINT IF EXISTS "FK_discounts_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.discounts DROP CONSTRAINT IF EXISTS "FK_discounts_bills_BillId";
ALTER TABLE IF EXISTS ONLY public.denomination_counts DROP CONSTRAINT IF EXISTS "FK_denomination_counts_shifts_ShiftId";
ALTER TABLE IF EXISTS ONLY public.denomination_counts DROP CONSTRAINT IF EXISTS "FK_denomination_counts_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.denomination_counts DROP CONSTRAINT IF EXISTS "FK_denomination_counts_cash_register_CashRegisterId";
ALTER TABLE IF EXISTS ONLY public.denomination_counts DROP CONSTRAINT IF EXISTS "FK_denomination_counts_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.cash_transactions DROP CONSTRAINT IF EXISTS "FK_cash_transactions_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.cash_transactions DROP CONSTRAINT IF EXISTS "FK_cash_transactions_cash_register_CashRegisterId";
ALTER TABLE IF EXISTS ONLY public.cash_transactions DROP CONSTRAINT IF EXISTS "FK_cash_transactions_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.cash_transactions DROP CONSTRAINT IF EXISTS "FK_cash_transactions_bills_BillId";
ALTER TABLE IF EXISTS ONLY public.cash_register DROP CONSTRAINT IF EXISTS "FK_cash_register_shifts_ShiftId";
ALTER TABLE IF EXISTS ONLY public.cash_register DROP CONSTRAINT IF EXISTS "FK_cash_register_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.cash_register DROP CONSTRAINT IF EXISTS "FK_cash_register_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS "FK_bills_users_DiscountBy";
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS "FK_bills_shifts_ShiftId";
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS "FK_bills_sessions_SessionId";
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS "FK_bills_pcs_PcId";
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS "FK_bills_operators_OperatorId";
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS "FK_bills_members_MemberId";
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS "FK_bills_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.bill_items DROP CONSTRAINT IF EXISTS "FK_bill_items_bills_BillId";
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS "FK_audit_logs_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public."PricingProfiles" DROP CONSTRAINT IF EXISTS "FK_PricingProfiles_branches_BranchId";
ALTER TABLE IF EXISTS ONLY public.pcs DROP CONSTRAINT IF EXISTS "FK_Pcs_PricingProfiles_PricingProfileId";
ALTER TABLE IF EXISTS ONLY public."EodSnapshots" DROP CONSTRAINT IF EXISTS "FK_EodSnapshots_operators_GeneratedByOperatorId";
ALTER TABLE IF EXISTS ONLY public."EodSnapshots" DROP CONSTRAINT IF EXISTS "FK_EodSnapshots_branches_BranchId";
DROP INDEX IF EXISTS public.idx_wallet_txn_member;
DROP INDEX IF EXISTS public.idx_wallet_txn_date;
DROP INDEX IF EXISTS public.idx_shifts_status;
DROP INDEX IF EXISTS public.idx_shifts_operator;
DROP INDEX IF EXISTS public.idx_shifts_branch;
DROP INDEX IF EXISTS public.idx_sessions_state;
DROP INDEX IF EXISTS public.idx_sessions_pc;
DROP INDEX IF EXISTS public.idx_sessions_operator;
DROP INDEX IF EXISTS public.idx_sessions_date;
DROP INDEX IF EXISTS public.idx_sessions_branch;
DROP INDEX IF EXISTS public.idx_reservations_time;
DROP INDEX IF EXISTS public.idx_reservations_state;
DROP INDEX IF EXISTS public.idx_reservations_pc;
DROP INDEX IF EXISTS public.idx_reservations_branch;
DROP INDEX IF EXISTS public.idx_pcs_state;
DROP INDEX IF EXISTS public.idx_pcs_branch;
DROP INDEX IF EXISTS public.idx_payments_type;
DROP INDEX IF EXISTS public.idx_payments_date;
DROP INDEX IF EXISTS public.idx_payments_branch;
DROP INDEX IF EXISTS public.idx_payments_bill;
DROP INDEX IF EXISTS public.idx_operators_status;
DROP INDEX IF EXISTS public.idx_operators_branch;
DROP INDEX IF EXISTS public.idx_members_status;
DROP INDEX IF EXISTS public.idx_members_mobile;
DROP INDEX IF EXISTS public.idx_loyalty_member;
DROP INDEX IF EXISTS public.idx_inventory_status;
DROP INDEX IF EXISTS public.idx_inventory_category;
DROP INDEX IF EXISTS public.idx_inventory_branch;
DROP INDEX IF EXISTS public.idx_inv_logs_item;
DROP INDEX IF EXISTS public.idx_inv_logs_date;
DROP INDEX IF EXISTS public.idx_food_orders_status;
DROP INDEX IF EXISTS public.idx_food_orders_session;
DROP INDEX IF EXISTS public.idx_food_orders_date;
DROP INDEX IF EXISTS public.idx_food_orders_branch;
DROP INDEX IF EXISTS public.idx_food_items_order;
DROP INDEX IF EXISTS public.idx_cash_txn_register;
DROP INDEX IF EXISTS public.idx_cash_txn_date;
DROP INDEX IF EXISTS public.idx_cash_register_shift;
DROP INDEX IF EXISTS public.idx_cash_register_branch;
DROP INDEX IF EXISTS public.idx_bills_status;
DROP INDEX IF EXISTS public.idx_bills_session;
DROP INDEX IF EXISTS public.idx_bills_operator;
DROP INDEX IF EXISTS public.idx_bills_date;
DROP INDEX IF EXISTS public.idx_bills_branch;
DROP INDEX IF EXISTS public.idx_bill_items_bill;
DROP INDEX IF EXISTS public.idx_audit_user;
DROP INDEX IF EXISTS public.idx_audit_target;
DROP INDEX IF EXISTS public.idx_audit_operator;
DROP INDEX IF EXISTS public.idx_audit_date;
DROP INDEX IF EXISTS public.idx_audit_branch;
DROP INDEX IF EXISTS public.idx_audit_action;
DROP INDEX IF EXISTS public."IX_wallet_transactions_OperatorId";
DROP INDEX IF EXISTS public."IX_wallet_transactions_BranchId";
DROP INDEX IF EXISTS public."IX_wallet_transactions_BillId";
DROP INDEX IF EXISTS public."IX_wallet_transactions_AdminId";
DROP INDEX IF EXISTS public."IX_users_Email";
DROP INDEX IF EXISTS public."IX_system_config_UpdatedBy";
DROP INDEX IF EXISTS public."IX_system_config_ConfigKey";
DROP INDEX IF EXISTS public."IX_sessions_ShiftId";
DROP INDEX IF EXISTS public."IX_sessions_MemberId";
DROP INDEX IF EXISTS public."IX_reservations_OverrideBy";
DROP INDEX IF EXISTS public."IX_reservations_OperatorId";
DROP INDEX IF EXISTS public."IX_reservations_MemberId";
DROP INDEX IF EXISTS public."IX_pcs_PricingProfileId";
DROP INDEX IF EXISTS public."IX_pcs_PcNumber_BranchId";
DROP INDEX IF EXISTS public."IX_pcs_LastOperatorId";
DROP INDEX IF EXISTS public."IX_pcs_CurrentSessionId";
DROP INDEX IF EXISTS public."IX_pcs_CurrentReservationId";
DROP INDEX IF EXISTS public."IX_payments_OperatorId";
DROP INDEX IF EXISTS public."IX_operators_Username";
DROP INDEX IF EXISTS public."IX_operators_CreatedBy";
DROP INDEX IF EXISTS public."IX_members_Username";
DROP INDEX IF EXISTS public."IX_members_MemberNumber";
DROP INDEX IF EXISTS public."IX_members_HomeBranchId";
DROP INDEX IF EXISTS public."IX_loyalty_points_OperatorId";
DROP INDEX IF EXISTS public."IX_loyalty_points_BranchId";
DROP INDEX IF EXISTS public."IX_loyalty_points_BillId";
DROP INDEX IF EXISTS public."IX_loyalty_points_AdminId";
DROP INDEX IF EXISTS public."IX_inventory_logs_OperatorId";
DROP INDEX IF EXISTS public."IX_inventory_logs_BranchId";
DROP INDEX IF EXISTS public."IX_food_orders_PcId";
DROP INDEX IF EXISTS public."IX_food_orders_OrderNumber";
DROP INDEX IF EXISTS public."IX_food_orders_OperatorId";
DROP INDEX IF EXISTS public."IX_food_orders_MemberId";
DROP INDEX IF EXISTS public."IX_food_order_items_InventoryId";
DROP INDEX IF EXISTS public."IX_discounts_BranchId";
DROP INDEX IF EXISTS public."IX_discounts_BillId";
DROP INDEX IF EXISTS public."IX_discounts_AdminId";
DROP INDEX IF EXISTS public."IX_denomination_counts_ShiftId";
DROP INDEX IF EXISTS public."IX_denomination_counts_OperatorId";
DROP INDEX IF EXISTS public."IX_denomination_counts_CashRegisterId";
DROP INDEX IF EXISTS public."IX_denomination_counts_BranchId";
DROP INDEX IF EXISTS public."IX_cash_transactions_OperatorId";
DROP INDEX IF EXISTS public."IX_cash_transactions_BranchId";
DROP INDEX IF EXISTS public."IX_cash_transactions_BillId";
DROP INDEX IF EXISTS public."IX_cash_register_OperatorId";
DROP INDEX IF EXISTS public."IX_branches_Name";
DROP INDEX IF EXISTS public."IX_bills_ShiftId";
DROP INDEX IF EXISTS public."IX_bills_PcId";
DROP INDEX IF EXISTS public."IX_bills_MemberId";
DROP INDEX IF EXISTS public."IX_bills_DiscountBy";
DROP INDEX IF EXISTS public."IX_bills_BillNumber";
DROP INDEX IF EXISTS public."IX_PricingProfiles_BranchId";
DROP INDEX IF EXISTS public."IX_Members_Username";
DROP INDEX IF EXISTS public."IX_EodSnapshots_GeneratedByOperatorId";
DROP INDEX IF EXISTS public."IX_EodSnapshots_BranchId";
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS "PK_wallet_transactions";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "PK_users";
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS "PK_system_config";
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS "PK_shifts";
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS "PK_sessions";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "PK_reservations";
ALTER TABLE IF EXISTS ONLY public.pcs DROP CONSTRAINT IF EXISTS "PK_pcs";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "PK_payments";
ALTER TABLE IF EXISTS ONLY public.operators DROP CONSTRAINT IF EXISTS "PK_operators";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "PK_members";
ALTER TABLE IF EXISTS ONLY public.loyalty_points DROP CONSTRAINT IF EXISTS "PK_loyalty_points";
ALTER TABLE IF EXISTS ONLY public.inventory_logs DROP CONSTRAINT IF EXISTS "PK_inventory_logs";
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS "PK_inventory";
ALTER TABLE IF EXISTS ONLY public.food_orders DROP CONSTRAINT IF EXISTS "PK_food_orders";
ALTER TABLE IF EXISTS ONLY public.food_order_items DROP CONSTRAINT IF EXISTS "PK_food_order_items";
ALTER TABLE IF EXISTS ONLY public.discounts DROP CONSTRAINT IF EXISTS "PK_discounts";
ALTER TABLE IF EXISTS ONLY public.denomination_counts DROP CONSTRAINT IF EXISTS "PK_denomination_counts";
ALTER TABLE IF EXISTS ONLY public.cash_transactions DROP CONSTRAINT IF EXISTS "PK_cash_transactions";
ALTER TABLE IF EXISTS ONLY public.cash_register DROP CONSTRAINT IF EXISTS "PK_cash_register";
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS "PK_branches";
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS "PK_bills";
ALTER TABLE IF EXISTS ONLY public.bill_items DROP CONSTRAINT IF EXISTS "PK_bill_items";
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS "PK_audit_logs";
ALTER TABLE IF EXISTS ONLY public."__EFMigrationsHistory" DROP CONSTRAINT IF EXISTS "PK___EFMigrationsHistory";
ALTER TABLE IF EXISTS ONLY public."PricingProfiles" DROP CONSTRAINT IF EXISTS "PK_PricingProfiles";
ALTER TABLE IF EXISTS ONLY public."EodSnapshots" DROP CONSTRAINT IF EXISTS "PK_EodSnapshots";
DROP TABLE IF EXISTS public.wallet_transactions;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.system_config;
DROP TABLE IF EXISTS public.shifts;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.reservations;
DROP TABLE IF EXISTS public.pcs;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.operators;
DROP TABLE IF EXISTS public.members;
DROP TABLE IF EXISTS public.loyalty_points;
DROP TABLE IF EXISTS public.inventory_logs;
DROP TABLE IF EXISTS public.inventory;
DROP TABLE IF EXISTS public.food_orders;
DROP TABLE IF EXISTS public.food_order_items;
DROP TABLE IF EXISTS public.discounts;
DROP TABLE IF EXISTS public.denomination_counts;
DROP TABLE IF EXISTS public.cash_transactions;
DROP TABLE IF EXISTS public.cash_register;
DROP TABLE IF EXISTS public.branches;
DROP TABLE IF EXISTS public.bills;
DROP TABLE IF EXISTS public.bill_items;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public."__EFMigrationsHistory";
DROP TABLE IF EXISTS public."PricingProfiles";
DROP TABLE IF EXISTS public."EodSnapshots";
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: EodSnapshots; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public."EodSnapshots" (
    "Id" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "ReportDate" timestamp with time zone NOT NULL,
    "GeneratedByOperatorId" uuid NOT NULL,
    "SnapshotVersion" integer NOT NULL,
    "SchemaVersion" text NOT NULL,
    "SnapshotData" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."EodSnapshots" OWNER TO appleesports_admin;

--
-- Name: PricingProfiles; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public."PricingProfiles" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "BaseHourlyRate" numeric NOT NULL,
    "BranchId" uuid NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PricingProfiles" OWNER TO appleesports_admin;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO appleesports_admin;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.audit_logs (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "UserId" uuid,
    "OperatorId" uuid,
    "UserRole" character varying(20) NOT NULL,
    "UserName" character varying(100) NOT NULL,
    "Action" character varying(50) NOT NULL,
    "TargetType" character varying(50),
    "TargetId" uuid,
    "BranchId" uuid,
    "BranchName" character varying(100),
    "Details" jsonb,
    "IpAddress" character varying(45),
    "DeviceInfo" jsonb,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO appleesports_admin;

--
-- Name: bill_items; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.bill_items (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "BillId" uuid NOT NULL,
    "ItemType" character varying(20) NOT NULL,
    "ItemName" character varying(200) NOT NULL,
    "Quantity" integer DEFAULT 1 NOT NULL,
    "UnitPrice" numeric(10,2) NOT NULL,
    "TotalPrice" numeric(10,2) NOT NULL,
    "InventoryId" uuid,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bill_items OWNER TO appleesports_admin;

--
-- Name: bills; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.bills (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "BillNumber" character varying(30) NOT NULL,
    "SessionId" uuid,
    "PcId" uuid,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid NOT NULL,
    "ShiftId" uuid,
    "CustomerName" character varying(100),
    "MemberId" uuid,
    "GamingAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "FoodAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "Subtotal" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "DiscountType" character varying(20),
    "DiscountValue" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "DiscountAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "DiscountBy" uuid,
    "DiscountReason" text,
    "TotalAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "PaymentType" character varying(20),
    "CashAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "OnlineAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "WalletAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "CashReceived" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "ChangeReturned" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "ActualCashCollected" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "Status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "CompletedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bills OWNER TO appleesports_admin;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.branches (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Address" text,
    "OpeningTime" time without time zone DEFAULT '10:00:00'::time without time zone NOT NULL,
    "ClosingTime" time without time zone DEFAULT '02:00:00'::time without time zone NOT NULL,
    "Status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.branches OWNER TO appleesports_admin;

--
-- Name: cash_register; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.cash_register (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "ShiftId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid NOT NULL,
    "OpeningBalance" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "TotalCashSales" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "TotalSplitCash" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "ExpectedDrawerCash" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "PhysicalCashCounted" numeric(10,2),
    "CashDifference" numeric(10,2),
    "MismatchReason" text,
    "Status" character varying(20) DEFAULT 'open'::character varying NOT NULL,
    "OpenedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "VerifiedAt" timestamp with time zone,
    "ClosedAt" timestamp with time zone
);


ALTER TABLE public.cash_register OWNER TO appleesports_admin;

--
-- Name: cash_transactions; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.cash_transactions (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "CashRegisterId" uuid NOT NULL,
    "BillId" uuid,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid NOT NULL,
    "PcNumber" character varying(20),
    "CashAmount" numeric(10,2) NOT NULL,
    "GamingAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "FoodAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "TransactionType" character varying(30) DEFAULT 'billing'::character varying NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cash_transactions OWNER TO appleesports_admin;

--
-- Name: denomination_counts; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.denomination_counts (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "CashRegisterId" uuid NOT NULL,
    "ShiftId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid NOT NULL,
    "Notes2000" integer NOT NULL,
    "Notes500" integer NOT NULL,
    "Notes200" integer NOT NULL,
    "Notes100" integer NOT NULL,
    "Notes50" integer NOT NULL,
    "Notes20" integer NOT NULL,
    "Notes10" integer NOT NULL,
    "Coins5" integer NOT NULL,
    "Coins2" integer NOT NULL,
    "Coins1" integer NOT NULL,
    "CountedTotal" numeric(10,2) NOT NULL,
    "ExpectedTotal" numeric(10,2) NOT NULL,
    "Difference" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "IsVerified" boolean DEFAULT false NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.denomination_counts OWNER TO appleesports_admin;

--
-- Name: discounts; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.discounts (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "BillId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "AdminId" uuid NOT NULL,
    "DiscountType" character varying(20) NOT NULL,
    "DiscountValue" numeric(10,2) NOT NULL,
    "DiscountAmount" numeric(10,2) NOT NULL,
    "Reason" text NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.discounts OWNER TO appleesports_admin;

--
-- Name: food_order_items; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.food_order_items (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "OrderId" uuid NOT NULL,
    "InventoryId" uuid NOT NULL,
    "ItemName" character varying(200) NOT NULL,
    "Quantity" integer DEFAULT 1 NOT NULL,
    "UnitPrice" numeric(10,2) NOT NULL,
    "TotalPrice" numeric(10,2) NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.food_order_items OWNER TO appleesports_admin;

--
-- Name: food_orders; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.food_orders (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "OrderNumber" character varying(30) NOT NULL,
    "SessionId" uuid,
    "PcId" uuid,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid,
    "CustomerName" character varying(100),
    "MemberId" uuid,
    "TotalAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "PaymentType" character varying(20),
    "Status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "CancelledReason" text,
    "OrderTime" timestamp with time zone DEFAULT now() NOT NULL,
    "AcceptedAt" timestamp with time zone,
    "ReadyAt" timestamp with time zone,
    "DeliveredAt" timestamp with time zone,
    "CompletedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.food_orders OWNER TO appleesports_admin;

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.inventory (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "BranchId" uuid NOT NULL,
    "ItemName" character varying(200) NOT NULL,
    "Category" character varying(100),
    "Price" numeric(10,2) NOT NULL,
    "CurrentStock" integer DEFAULT 0 NOT NULL,
    "MinStockLimit" integer DEFAULT 5 NOT NULL,
    "Status" character varying(20) DEFAULT 'available'::character varying NOT NULL,
    "ImageUrl" text,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory OWNER TO appleesports_admin;

--
-- Name: inventory_logs; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.inventory_logs (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "InventoryId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid,
    "Action" character varying(30) NOT NULL,
    "Quantity" integer,
    "OldValue" text,
    "NewValue" text,
    "Reason" text,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory_logs OWNER TO appleesports_admin;

--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.loyalty_points (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "MemberId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid,
    "AdminId" uuid,
    "Action" character varying(30) NOT NULL,
    "Category" character varying(20) NOT NULL,
    "Points" integer NOT NULL,
    "PointsBefore" integer NOT NULL,
    "PointsAfter" integer NOT NULL,
    "BillId" uuid,
    "RewardType" character varying(50),
    "RewardValue" numeric(10,2),
    "Reason" text,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.loyalty_points OWNER TO appleesports_admin;

--
-- Name: members; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.members (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "MemberNumber" character varying(30) NOT NULL,
    "FullName" character varying(100) NOT NULL,
    "MobileNumber" character varying(20) NOT NULL,
    "Email" character varying(255),
    "Status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "GamingPoints" integer NOT NULL,
    "FoodPoints" integer NOT NULL,
    "TotalPoints" integer NOT NULL,
    "TotalGamingSpend" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "TotalFoodSpend" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "HomeBranchId" uuid,
    "JoinDate" timestamp with time zone DEFAULT now() NOT NULL,
    "LastVisit" timestamp with time zone,
    "CreatedBy" uuid,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "GamingBalance" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "FoodBalance" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "Username" character varying(50),
    "PasswordHash" character varying(100)
);


ALTER TABLE public.members OWNER TO appleesports_admin;

--
-- Name: operators; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.operators (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "FullName" character varying(100) NOT NULL,
    "Username" character varying(50) NOT NULL,
    "PasswordHash" character varying(255) NOT NULL,
    "MobileNumber" character varying(20),
    "BranchId" uuid NOT NULL,
    "Status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "DashboardPermissions" jsonb NOT NULL,
    "LastLogin" timestamp with time zone,
    "DeviceInfo" jsonb,
    "CreatedBy" uuid,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.operators OWNER TO appleesports_admin;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.payments (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "BillId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid NOT NULL,
    "PaymentType" character varying(20) NOT NULL,
    "TotalAmount" numeric(10,2) NOT NULL,
    "CashAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "OnlineAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "WalletAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "CashReceived" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "ChangeReturned" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "ActualCashCollected" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "GamingPortion" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "FoodPortion" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "Status" character varying(20) DEFAULT 'completed'::character varying NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO appleesports_admin;

--
-- Name: pcs; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.pcs (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "PcNumber" character varying(20) NOT NULL,
    "BranchId" uuid NOT NULL,
    "State" character varying(20) DEFAULT 'idle'::character varying NOT NULL,
    "CurrentSessionId" uuid,
    "CurrentReservationId" uuid,
    "LastActiveAt" timestamp with time zone,
    "LastOperatorId" uuid,
    "IpAddress" character varying(45),
    "Specs" jsonb,
    "PcName" text,
    "Zone" text,
    "PricingProfileId" uuid,
    "HardwareNotes" text,
    "IsActive" boolean NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pcs OWNER TO appleesports_admin;

--
-- Name: reservations; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.reservations (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "PcId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid NOT NULL,
    "CustomerName" character varying(100) NOT NULL,
    "MemberId" uuid,
    "ReservationTime" timestamp with time zone NOT NULL,
    "DurationMin" integer,
    "GracePeriodMin" integer DEFAULT 15 NOT NULL,
    "State" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "StartedAt" timestamp with time zone,
    "ExpiredAt" timestamp with time zone,
    "CancelledAt" timestamp with time zone,
    "OverrideBy" uuid,
    "OverrideReason" text,
    "Notes" text,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reservations OWNER TO appleesports_admin;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.sessions (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "PcId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid NOT NULL,
    "ShiftId" uuid,
    "CustomerName" character varying(100),
    "MemberId" uuid,
    "StartTime" timestamp with time zone DEFAULT now() NOT NULL,
    "EndTime" timestamp with time zone,
    "PlannedDurationMin" integer,
    "ActualDurationMin" integer,
    "GamingAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "FoodAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "TotalAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "State" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "GamingType" character varying(50) DEFAULT 'standard'::character varying NOT NULL,
    "Notes" text,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sessions OWNER TO appleesports_admin;

--
-- Name: shifts; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.shifts (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "OperatorId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "LoginTime" timestamp with time zone DEFAULT now() NOT NULL,
    "LogoutTime" timestamp with time zone,
    "DeviceInfo" jsonb,
    "Status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "Summary" jsonb,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shifts OWNER TO appleesports_admin;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.system_config (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "ConfigKey" character varying(100) NOT NULL,
    "ConfigValue" jsonb NOT NULL,
    "Description" text,
    "UpdatedBy" uuid,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_config OWNER TO appleesports_admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.users (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "Email" character varying(255) NOT NULL,
    "PasswordHash" character varying(255) NOT NULL,
    "FullName" character varying(100) NOT NULL,
    "Role" character varying(20) DEFAULT 'super_admin'::character varying NOT NULL,
    "Status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "LastLogin" timestamp with time zone,
    "DeviceInfo" jsonb,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO appleesports_admin;

--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: appleesports_admin
--

CREATE TABLE public.wallet_transactions (
    "Id" uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "MemberId" uuid NOT NULL,
    "BranchId" uuid NOT NULL,
    "OperatorId" uuid,
    "AdminId" uuid,
    "Action" character varying(30) NOT NULL,
    "Amount" numeric(10,2) NOT NULL,
    "BalanceBefore" numeric(10,2) NOT NULL,
    "BalanceAfter" numeric(10,2) NOT NULL,
    "PaymentType" character varying(20),
    "CashAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "OnlineAmount" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "BillId" uuid,
    "Reason" text,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "TargetWallet" character varying(20) DEFAULT 'Gaming'::character varying NOT NULL
);


ALTER TABLE public.wallet_transactions OWNER TO appleesports_admin;

--
-- Data for Name: EodSnapshots; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public."EodSnapshots" ("Id", "BranchId", "ReportDate", "GeneratedByOperatorId", "SnapshotVersion", "SchemaVersion", "SnapshotData", "CreatedAt", "UpdatedAt") FROM stdin;
\.


--
-- Data for Name: PricingProfiles; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public."PricingProfiles" ("Id", "Name", "BaseHourlyRate", "BranchId", "IsActive", "CreatedAt", "UpdatedAt") FROM stdin;
20000000-0000-0000-0000-000000000001	PRO COMBAT DESK	160.00	b0000000-0000-0000-0000-000000000001	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
20000000-0000-0000-0000-000000000002	CHAMPION ZONE	150.00	b0000000-0000-0000-0000-000000000002	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
20000000-0000-0000-0000-000000000003	ELITE WAR ZONE	160.00	b0000000-0000-0000-0000-000000000002	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
20000000-0000-0000-0000-000000000004	RECRUIT DECK	160.00	b0000000-0000-0000-0000-000000000003	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
20000000-0000-0000-0000-000000000005	VETERAN STAND	170.00	b0000000-0000-0000-0000-000000000003	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
20000000-0000-0000-0000-000000000006	VIP ELITE HUB	180.00	b0000000-0000-0000-0000-000000000003	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
20000000-0000-0000-0000-000000000007	TITAN DESK	180.00	b0000000-0000-0000-0000-000000000004	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
20000000-0000-0000-0000-000000000008	GOD-TIER arena	190.00	b0000000-0000-0000-0000-000000000004	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
20000000-0000-0000-0000-000000000009	SOFA CLUB COUCH	100.00	b0000000-0000-0000-0000-000000000004	t	2026-06-10 07:31:15.647538+00	2026-06-10 07:31:15.647538+00
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20260603100828_AddPcManagementSystem	8.0.0
20260603182354_AddEodSnapshots	8.0.0
20260603185217_AddOptimisticConcurrencyXmin	8.0.0
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.audit_logs ("Id", "UserId", "OperatorId", "UserRole", "UserName", "Action", "TargetType", "TargetId", "BranchId", "BranchName", "Details", "IpAddress", "DeviceInfo", "CreatedAt") FROM stdin;
f19e51fa-05a4-4aa9-99bf-3e88db410dc1	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	login	\N	\N	\N	\N	{"method": "email_password", "deviceInfo": null}	\N	\N	2026-06-10 07:32:46.866079+00
3baf8b22-8d8c-42a3-8205-229a69aa69e2	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	logout	\N	\N	\N	\N	{"shiftId": null}	\N	\N	2026-06-10 07:43:17.57881+00
0076e98c-85a4-4945-8be7-d3da03cb7525	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	failed_login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"reason": "Invalid password/PIN", "deviceInfo": null}	\N	\N	2026-06-10 07:43:31.220309+00
6fd2153b-977d-4a55-8a8f-e4b3e1ccf64d	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	login	\N	\N	\N	\N	{"method": "email_password", "deviceInfo": null}	\N	\N	2026-06-10 07:43:52.939498+00
56174da8-50b4-4bbe-a959-d5a587562ace	\N	30000000-0000-0000-0000-000000000002	operator	Ankur Operator	failed_login	\N	\N	b0000000-0000-0000-0000-000000000001	Adajan	{"reason": "Invalid password/PIN", "deviceInfo": null}	\N	\N	2026-06-10 07:44:39.830741+00
db50cef0-4a2e-4a0c-9d18-eb1de8050b59	\N	30000000-0000-0000-0000-000000000002	operator	Ankur Operator	login	\N	\N	b0000000-0000-0000-0000-000000000001	Adajan	{"shiftId": "7ff188b6-aa15-4e34-b445-5dd8e429ddcd", "loginTime": "2026-06-10T07:44:46.4063587+00:00", "deviceInfo": null}	\N	\N	2026-06-10 07:44:46.502178+00
aa77cc87-274b-44c0-a2d5-7f469eb53c27	\N	30000000-0000-0000-0000-000000000002	operator	Ankur Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000001	Adajan	{"shiftId": "7ff188b6-aa15-4e34-b445-5dd8e429ddcd"}	\N	\N	2026-06-10 07:44:46.512315+00
1b42df0f-27e9-4d9d-8b0e-84ba7f68e875	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "d73cb321-8189-4137-aacd-314e2cd76326", "loginTime": "2026-06-10T08:06:46.0677147+00:00", "deviceInfo": null}	\N	\N	2026-06-10 08:06:46.516439+00
44350bcf-7cc5-47ee-ba31-3cc67ae2bd66	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "d73cb321-8189-4137-aacd-314e2cd76326"}	\N	\N	2026-06-10 08:06:46.615479+00
1bf3b061-1551-4a95-9fc4-c0bf60c51c33	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 100}	\N	\N	2026-06-10 08:06:59.864036+00
c6208fb6-5a89-4dde-adee-2fa87ca185ff	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	logout	\N	\N	\N	\N	{"shiftId": "d73cb321-8189-4137-aacd-314e2cd76326"}	\N	\N	2026-06-10 08:07:42.975035+00
7f6b1d2a-b99d-4c82-a73f-e7f0d4549cef	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "43489dd5-2d9a-43cc-abab-c9cd2a68f108", "loginTime": "2026-06-10T08:07:57.3040978+00:00", "deviceInfo": null}	\N	\N	2026-06-10 08:07:57.323183+00
ab4264df-a5e9-4fd1-97ce-5eee44c94156	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "43489dd5-2d9a-43cc-abab-c9cd2a68f108"}	\N	\N	2026-06-10 08:07:57.329093+00
552213f5-7e31-4f6a-8089-48815baeab31	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 100}	\N	\N	2026-06-10 08:08:02.575472+00
2ae3adad-bf4a-45ff-a6fa-f7c14066dadc	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "18bc7b39-3f52-4cf5-a311-e4301e313c25", "loginTime": "2026-06-10T08:13:35.9239133+00:00", "deviceInfo": null}	\N	\N	2026-06-10 08:13:36.762762+00
71aca973-b391-470c-a486-7a1942b2ac2f	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "18bc7b39-3f52-4cf5-a311-e4301e313c25"}	\N	\N	2026-06-10 08:13:36.952224+00
ccfbe72e-4178-4c9a-9ec7-77e876db9308	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	logout	\N	\N	\N	\N	{"shiftId": "18bc7b39-3f52-4cf5-a311-e4301e313c25"}	\N	\N	2026-06-10 08:14:21.093038+00
23177c7e-33b3-4221-94dc-ab233dfccacd	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "b7f3c103-1370-47a8-868f-b8d12be84f25", "loginTime": "2026-06-10T08:14:25.3948411+00:00", "deviceInfo": null}	\N	\N	2026-06-10 08:14:25.408315+00
3012e167-ae81-422a-8963-fb905b5bd63d	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "b7f3c103-1370-47a8-868f-b8d12be84f25"}	\N	\N	2026-06-10 08:14:25.416276+00
0a98e3f4-6e81-491e-9cc9-ce5dcd5cad44	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 100}	\N	\N	2026-06-10 08:14:31.172861+00
6bdf97d8-55c1-44d2-934b-ab10cda5839e	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	login	\N	\N	\N	\N	{"method": "email_password", "deviceInfo": null}	\N	\N	2026-06-10 08:14:52.682136+00
415b02f7-6230-494e-9870-d2c981247905	\N	30000000-0000-0000-0000-000000000003	operator	System	session_start	session	0995ba8c-b17c-44b8-96a1-18844aa3d54d	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-03", "ExpectedAmount": 200, "DurationMinutes": 120}	\N	\N	2026-06-10 08:16:14.704345+00
1143c66b-b0be-4005-8d34-e8c66b9ab241	\N	30000000-0000-0000-0000-000000000003	operator	System	session_stop	session	0995ba8c-b17c-44b8-96a1-18844aa3d54d	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-03", "TotalAmount": 200.00}	\N	\N	2026-06-10 08:17:52.911332+00
b4c8c88e-1eb5-4ad6-98fc-c0d95dab0ed7	\N	30000000-0000-0000-0000-000000000003	Operator	System	payment_process	bill	ba7de6ba-36dd-46d1-8803-b19693ed5544	b0000000-0000-0000-0000-000000000002	\N	{"Cash": 200, "Total": 200, "PaymentType": "Cash"}	\N	\N	2026-06-10 08:18:16.56356+00
fb4baec1-5365-4d9a-8d73-7b0679de334d	\N	30000000-0000-0000-0000-000000000003	Operator	System	bill_complete	bill	ba7de6ba-36dd-46d1-8803-b19693ed5544	b0000000-0000-0000-0000-000000000002	\N	{"BillNumber": "BILL-20260610-C897"}	\N	\N	2026-06-10 08:18:16.74125+00
99b1ef52-7bc0-46de-b0a1-277d41eddaab	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_create	food_order	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"Total": 50.00, "ItemCount": 1, "OrderNumber": "ORD-260610-0001"}	\N	\N	2026-06-10 08:18:38.824422+00
4ffa7c4e-f694-44b0-ac8c-db2d442392b1	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_update	food_order	db3df109-b23a-4971-8637-c551e703424e	b0000000-0000-0000-0000-000000000002	\N	{"Reason": null, "Status": "Preparing"}	\N	\N	2026-06-10 08:18:41.436546+00
11ea4bcc-5ce1-487d-ab35-3de6621c6b32	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_update	food_order	db3df109-b23a-4971-8637-c551e703424e	b0000000-0000-0000-0000-000000000002	\N	{"Reason": null, "Status": "Ready"}	\N	\N	2026-06-10 08:18:42.327384+00
189dd5a2-e030-4ce0-b78e-3bbd080d7288	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_update	food_order	db3df109-b23a-4971-8637-c551e703424e	b0000000-0000-0000-0000-000000000002	\N	{"Reason": null, "Status": "Delivered"}	\N	\N	2026-06-10 08:18:44.123627+00
6a881bb1-ba9b-4eec-acb5-c594acb2de8e	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_create	food_order	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"Total": 30.00, "ItemCount": 1, "OrderNumber": "ORD-260610-0002"}	\N	\N	2026-06-10 08:18:50.993168+00
d3db09c2-abbb-42a3-8a02-1f79740751c9	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_update	food_order	34b2a0d5-0f42-44d2-bc69-6c92e08178d2	b0000000-0000-0000-0000-000000000002	\N	{"Reason": null, "Status": "Preparing"}	\N	\N	2026-06-10 08:18:52.623423+00
a1822e9d-e720-424c-a01b-dc03e6014e7c	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_update	food_order	34b2a0d5-0f42-44d2-bc69-6c92e08178d2	b0000000-0000-0000-0000-000000000002	\N	{"Reason": null, "Status": "Ready"}	\N	\N	2026-06-10 08:18:53.327413+00
623ba100-852a-4897-b25c-79e18d8be26d	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_update	food_order	34b2a0d5-0f42-44d2-bc69-6c92e08178d2	b0000000-0000-0000-0000-000000000002	\N	{"Reason": null, "Status": "Delivered"}	\N	\N	2026-06-10 08:18:54.159694+00
397fe181-e3aa-40bd-9031-f62fb3746fe8	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_update	food_order	34b2a0d5-0f42-44d2-bc69-6c92e08178d2	b0000000-0000-0000-0000-000000000002	\N	{"Reason": null, "Status": "Completed"}	\N	\N	2026-06-10 08:19:17.727248+00
becf41ac-aece-44fc-8645-122c8f5714d1	\N	30000000-0000-0000-0000-000000000003	Operator	System	food_order_update	food_order	db3df109-b23a-4971-8637-c551e703424e	b0000000-0000-0000-0000-000000000002	\N	{"Reason": null, "Status": "Completed"}	\N	\N	2026-06-10 08:19:18.886036+00
a771330a-7921-4b51-a6d5-7fcae9d8beb0	\N	30000000-0000-0000-0000-000000000003	operator	System	session_start	session	60ed3e87-5bfc-4c36-a6e5-91699441bc21	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-03", "ExpectedAmount": 300, "DurationMinutes": 180}	\N	\N	2026-06-10 08:20:13.878134+00
18a4823e-22a2-42dc-8636-df3653fae6b1	\N	30000000-0000-0000-0000-000000000003	operator	System	session_stop	session	60ed3e87-5bfc-4c36-a6e5-91699441bc21	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-03", "TotalAmount": 300.00}	\N	\N	2026-06-10 08:20:16.963787+00
f820844e-2810-4121-a4be-23ae2617dde5	\N	30000000-0000-0000-0000-000000000003	Operator	System	payment_process	bill	89050fd7-4f9a-4149-9113-e333a57b6d55	b0000000-0000-0000-0000-000000000002	\N	{"Cash": 130, "Total": 300, "PaymentType": "Split"}	\N	\N	2026-06-10 08:20:50.941644+00
da9f68b0-65c6-4adb-a8fd-cfc87f9dd736	\N	30000000-0000-0000-0000-000000000003	Operator	System	bill_complete	bill	89050fd7-4f9a-4149-9113-e333a57b6d55	b0000000-0000-0000-0000-000000000002	\N	{"BillNumber": "BILL-20260610-DF24"}	\N	\N	2026-06-10 08:20:50.966238+00
dc9166e0-dfe4-4e42-a076-06f9119268c4	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	logout	\N	\N	\N	\N	{"shiftId": "b7f3c103-1370-47a8-868f-b8d12be84f25"}	\N	\N	2026-06-10 08:21:16.891702+00
54ac5112-b55a-4615-acc9-b8beefbc5b52	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "787bab40-af6f-47a6-8382-90d13f62a841", "loginTime": "2026-06-10T08:22:39.8676087+00:00", "deviceInfo": null}	\N	\N	2026-06-10 08:22:39.885921+00
b8b4c71d-f879-41f8-b209-971557840ac3	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 0}	\N	\N	2026-06-10 08:22:44.228007+00
9d83b336-9168-4fee-a4d5-98719c0e6450	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "787bab40-af6f-47a6-8382-90d13f62a841"}	\N	\N	2026-06-10 08:22:39.901335+00
6ae094ac-7fea-4156-b210-0df4436d9e9e	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	logout	\N	\N	\N	\N	{"shiftId": "787bab40-af6f-47a6-8382-90d13f62a841"}	\N	\N	2026-06-10 08:23:40.664957+00
ba0e4348-6abe-41ac-9b95-536c042a3bb2	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "2f6ad91f-5b7c-45cf-a44a-6e9945fd32cc", "loginTime": "2026-06-10T09:23:54.4212271+00:00", "deviceInfo": null}	\N	\N	2026-06-10 09:23:54.705049+00
60c8cc49-8123-4bd2-93e7-3945d675260d	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "2f6ad91f-5b7c-45cf-a44a-6e9945fd32cc"}	\N	\N	2026-06-10 09:23:54.771451+00
cf8e7396-c853-4019-8072-3ab6e0056bba	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 0}	\N	\N	2026-06-10 09:24:06.184123+00
3f9ed864-79a1-4e38-a6e5-82322cb80936	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "fed05d26-aaba-4f6d-9b3f-130ad5fd8d84", "loginTime": "2026-06-10T09:38:33.1240663+00:00", "deviceInfo": null}	\N	\N	2026-06-10 09:38:34.265453+00
66358ef4-baeb-4a50-85d1-e52ac10f35f5	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "fed05d26-aaba-4f6d-9b3f-130ad5fd8d84"}	\N	\N	2026-06-10 09:38:34.590709+00
a02e64a4-212d-402b-9654-c40a6597f12e	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_create	member	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"FullName": "Harsh Dave", "MemberNumber": "MEM-2606-0001"}	\N	\N	2026-06-10 09:45:09.184422+00
d03b33b3-060f-44a9-acb0-88651acf072c	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_create	member	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"FullName": "Meet", "MemberNumber": "MEM-2606-0002"}	\N	\N	2026-06-10 09:45:52.962815+00
2d7a27fa-f63d-4504-95fa-c3e86aaaccf7	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "56ceb2de-5b78-4242-832a-8cb0ea7f39be", "loginTime": "2026-06-10T09:50:14.6912555+00:00", "deviceInfo": null}	\N	\N	2026-06-10 09:50:15.432145+00
b318e82f-a48e-4f45-b1a9-dfd0a53fc90c	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "56ceb2de-5b78-4242-832a-8cb0ea7f39be"}	\N	\N	2026-06-10 09:50:15.550064+00
30728a86-3d17-4355-ab4c-65dc5ecb6b80	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 0}	\N	\N	2026-06-10 09:50:20.572424+00
d812e8ca-9876-48bb-9f8f-f1213758b806	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_create	member	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"FullName": "harshal", "MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 09:51:09.083683+00
d5960041-3819-465a-a723-c60218972450	\N	30000000-0000-0000-0000-000000000003	Operator	System	wallet_recharge	wallet	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"Amount": 100, "PaymentType": "Cash"}	\N	\N	2026-06-10 09:51:28.25816+00
64e922a3-7079-4c31-976b-b8c7550266f2	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "d3650e5a-0229-469e-9c7b-5ac07104180d", "loginTime": "2026-06-10T09:55:09.7748095+00:00", "deviceInfo": null}	\N	\N	2026-06-10 09:55:10.411725+00
c29bb334-ce30-4da3-8770-d9e19c4447bf	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "d3650e5a-0229-469e-9c7b-5ac07104180d"}	\N	\N	2026-06-10 09:55:10.530575+00
f64cebd1-9bff-4f7b-9dad-5b043a02be56	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 100}	\N	\N	2026-06-10 09:56:20.426398+00
f8401ce5-f2de-4c05-bf0f-ea646942553b	\N	30000000-0000-0000-0000-000000000003	Operator	System	wallet_recharge	wallet	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"Amount": 200, "PaymentType": "Cash"}	\N	\N	2026-06-10 09:56:32.077889+00
6d2daa05-8bb0-4d4f-9839-92cbd545a44b	\N	30000000-0000-0000-0000-000000000003	operator	System	session_start	session	01cc1aae-d913-4c39-a850-8a6c95e550f1	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-02", "ExpectedAmount": 100, "DurationMinutes": 60}	\N	\N	2026-06-10 10:08:23.605011+00
fcd93ee4-f2f7-4f19-8e76-8f8f0b9f6c3d	\N	30000000-0000-0000-0000-000000000003	operator	System	session_stop	session	01cc1aae-d913-4c39-a850-8a6c95e550f1	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-02", "TotalAmount": 100.00}	\N	\N	2026-06-10 10:08:26.374327+00
3cff2c4a-3cdf-4fda-b117-ff0f4adc927e	\N	30000000-0000-0000-0000-000000000003	Operator	System	payment_process	bill	aecdabf6-3329-4912-a8d8-2f27e8b9cdf6	b0000000-0000-0000-0000-000000000002	\N	{"Cash": 100, "Total": 100, "PaymentType": "Cash"}	\N	\N	2026-06-10 10:08:41.238737+00
3a884cf9-920f-4870-9d47-7e8576cef1b3	\N	30000000-0000-0000-0000-000000000003	Operator	System	bill_complete	bill	aecdabf6-3329-4912-a8d8-2f27e8b9cdf6	b0000000-0000-0000-0000-000000000002	\N	{"BillNumber": "BILL-20260610-C0D4"}	\N	\N	2026-06-10 10:08:41.423167+00
91dae23e-23c9-4383-85cc-05cc11ed1c52	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "f2a00d0d-06d1-4396-8cca-ea703b42ee6f", "loginTime": "2026-06-10T10:20:57.0360022+00:00", "deviceInfo": null}	\N	\N	2026-06-10 10:20:57.604316+00
f690cbf3-3c92-4ce8-845f-860bd362e9d6	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "f2a00d0d-06d1-4396-8cca-ea703b42ee6f"}	\N	\N	2026-06-10 10:20:57.721333+00
44e1971a-dc2c-4192-990a-f2afa0c0b385	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 10:22:34.296046+00
e15d56d2-8f96-4206-9b90-d30c11cc16f2	\N	30000000-0000-0000-0000-000000000003	operator	System	session_start	session	4a45b281-4027-49e8-8e94-600cbec3b83c	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-02", "ExpectedAmount": 50, "DurationMinutes": 30}	\N	\N	2026-06-10 10:22:59.233825+00
f4e34d97-3f40-4ff0-aede-bb68826fa919	\N	30000000-0000-0000-0000-000000000003	operator	System	session_stop	session	4a45b281-4027-49e8-8e94-600cbec3b83c	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-02", "TotalAmount": 50.00}	\N	\N	2026-06-10 10:23:01.156125+00
eced4ccd-44fa-4337-8a56-edeea44a2ea5	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 10:23:41.813195+00
aee5448f-2d93-41af-bfac-1b907c0ecf16	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "16249e73-ab3a-41a9-8f79-9f5f54604398", "loginTime": "2026-06-10T10:39:06.9110829+00:00", "deviceInfo": null}	\N	\N	2026-06-10 10:39:06.933031+00
02a43300-6444-4494-a5a8-d26e6d2b12df	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "16249e73-ab3a-41a9-8f79-9f5f54604398"}	\N	\N	2026-06-10 10:39:06.942983+00
a58c811c-e4fe-44af-9914-53415714c2f9	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 10:39:30.221553+00
7db0a2c7-9b78-4a2e-aa67-4f2b5c5c9147	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 10:40:51.13113+00
820cfe8a-22bf-42c1-b5bf-e0b678301b41	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 10:50:52.987151+00
6c77dd5c-fd5d-4437-b937-02012b492e79	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 10:52:00.12462+00
18dc3ce0-b421-4002-8bea-f632bbf97552	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "070e95dd-c66f-4511-968c-c546f2bb2127", "loginTime": "2026-06-10T10:55:45.6449688+00:00", "deviceInfo": null}	\N	\N	2026-06-10 10:55:45.935479+00
e1f46ec8-ac7a-41de-aec8-0c5c4418aa3c	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "070e95dd-c66f-4511-968c-c546f2bb2127"}	\N	\N	2026-06-10 10:55:46.013428+00
258c59f5-3d36-4286-a418-cd4d51ad4ef8	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 10:56:04.535059+00
a2863cc5-98b5-467d-a0d6-7ee60841b81e	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 10:59:24.027357+00
52d0d895-e9b0-482f-80a0-bb40d31d5c66	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 11:03:54.248341+00
3cf749ae-be43-4b51-8c57-db66937f8a74	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "82b0b37f-1d08-47b5-9521-32257306bd16", "loginTime": "2026-06-10T11:57:15.4854808+00:00", "deviceInfo": null}	\N	\N	2026-06-10 11:57:16.021487+00
3669525a-7804-4268-ae59-2a02928910b4	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "82b0b37f-1d08-47b5-9521-32257306bd16"}	\N	\N	2026-06-10 11:57:16.12915+00
451223a0-e162-4c84-b06d-6d8aaf79e37a	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 11:58:08.36651+00
8d6103a9-8673-4fed-b6ec-5f9432df0e7e	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 12:00:29.712835+00
561bba4f-0b48-430f-b60a-52fcc2a23e3a	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "e7782a92-1617-4d92-a28f-dd3c3a95e54d", "loginTime": "2026-06-10T12:15:43.4161394+00:00", "deviceInfo": null}	\N	\N	2026-06-10 12:15:44.016181+00
bce148c1-f92c-4313-a41f-4eef1a3c06e8	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "e7782a92-1617-4d92-a28f-dd3c3a95e54d"}	\N	\N	2026-06-10 12:15:44.144513+00
587147a9-6b56-4226-97df-03327ea27e63	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 12:16:12.869639+00
9c9a303c-7415-49aa-9898-082580e4df2f	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 12:19:39.897108+00
51a34fa3-c008-4bcf-a65b-a63d10bc33ec	\N	30000000-0000-0000-0000-000000000004	operator	Nazmin Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "3ba249d6-11f3-4856-b3d4-ded7e5561c41", "loginTime": "2026-06-10T12:35:24.5041593+00:00", "deviceInfo": null}	\N	\N	2026-06-10 12:35:24.922257+00
f41abb9d-3f2b-4b39-a9ac-3e28b98c8a64	\N	30000000-0000-0000-0000-000000000004	operator	Nazmin Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "3ba249d6-11f3-4856-b3d4-ded7e5561c41"}	\N	\N	2026-06-10 12:35:25.016405+00
6b777def-a271-4532-971d-8bca465b1bf3	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	login	\N	\N	\N	\N	{"method": "email_password", "deviceInfo": null}	\N	\N	2026-06-10 12:35:58.027052+00
16b9168b-f06c-47e6-acf0-e10d38c777f5	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	login	\N	\N	\N	\N	{"method": "email_password", "deviceInfo": null}	\N	\N	2026-06-10 12:37:25.372991+00
c09eff62-baf2-45cf-a4ac-3405e1f82e45	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_create	member	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000001	\N	{"FullName": "Test Validation User", "MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:40:05.598605+00
95f5825e-0ee0-43f0-a86e-327c0fa85253	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:40:35.495855+00
6253a446-b828-46b8-980a-6736e7ec19f7	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:41:17.882906+00
708421c6-e7e1-4e2a-944c-7b2b6e5dd107	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	logout	\N	\N	\N	\N	{"shiftId": null}	\N	\N	2026-06-10 12:47:03.102106+00
297a4bd4-e9dc-465b-97be-e075dbcde4e8	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	failed_login	\N	\N	\N	\N	{"reason": "Invalid password", "deviceInfo": null}	\N	\N	2026-06-10 12:47:33.506052+00
b3b8338d-faf3-4941-897e-1ff7fc95b7da	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	login	\N	\N	\N	\N	{"method": "email_password", "deviceInfo": null}	\N	\N	2026-06-10 12:48:07.000775+00
ec6a907c-c18a-438e-974c-9af20f02b33e	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:49:50.28811+00
77db4759-1ed9-4801-8e57-90c63b616747	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:51:25.691682+00
307fe575-5991-4396-b954-6a4780944d3b	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:52:39.403332+00
65293656-fdf4-4b57-84f2-824887dc3618	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:54:01.172436+00
b1419bb2-66ec-41ff-9ff8-a8132ae7ed08	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:55:23.490105+00
2c171e8b-2188-4905-9bf2-85ad9bd2f7b4	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:56:34.978535+00
14c9a5d7-78c1-4511-a0bd-501633fa990f	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:57:26.531774+00
172451a2-fe15-4452-a286-b26742a2c4bc	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:58:07.888419+00
a778946e-a72c-49b4-bc57-c92b30a8c7c0	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:58:53.249504+00
4e794a10-b439-4b99-ab4d-1f945bbb7da8	\N	22222222-2222-2222-2222-222222222222	Operator	System	member_update	member	c3c74895-fe32-422b-9d4c-09e1db96b307	b0000000-0000-0000-0000-000000000001	\N	{"MemberNumber": "MEM-2606-0004"}	\N	\N	2026-06-10 12:59:43.788595+00
7416e0db-c745-4f0e-84ad-fa0d99a43ccf	\N	30000000-0000-0000-0000-000000000001	operator	Jigar Operator	login	\N	\N	b0000000-0000-0000-0000-000000000001	Adajan	{"shiftId": "4f332388-2356-4ebc-9c5f-6d4bfcd9b906", "loginTime": "2026-06-10T19:05:17.697611+00:00", "deviceInfo": null}	\N	\N	2026-06-10 19:05:18.523864+00
693027c8-f18e-41a1-b3ed-4b6024b7c483	\N	30000000-0000-0000-0000-000000000001	operator	Jigar Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000001	Adajan	{"shiftId": "4f332388-2356-4ebc-9c5f-6d4bfcd9b906"}	\N	\N	2026-06-10 19:05:18.67623+00
0dbc87fa-d150-4f5b-b7dd-470f7ba44036	\N	30000000-0000-0000-0000-000000000001	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000001	\N	{"OpeningBalance": 1000}	\N	\N	2026-06-10 19:05:38.001539+00
4d5de4e2-18b1-47dd-9972-70f9e8a7e207	\N	30000000-0000-0000-0000-000000000001	operator	Jigar Operator	logout	\N	\N	\N	\N	{"shiftId": "4f332388-2356-4ebc-9c5f-6d4bfcd9b906"}	\N	\N	2026-06-10 19:07:11.800715+00
8ad9e5aa-b99d-4a10-837a-fddf597e17db	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	login	\N	\N	\N	\N	{"method": "email_password", "deviceInfo": null}	\N	\N	2026-06-10 19:07:49.808688+00
d0a67b08-01d3-42ee-acf4-a6095cf155ab	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	logout	\N	\N	\N	\N	{"shiftId": null}	\N	\N	2026-06-10 19:16:32.038122+00
03fc95ff-b7a0-42fe-a9b4-cdff36ea7d9f	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	failed_login	\N	\N	\N	\N	{"reason": "Invalid password", "deviceInfo": null}	\N	\N	2026-06-10 19:16:57.409395+00
c7a6d1d7-68ad-4a1f-99ed-7433c437506b	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	failed_login	\N	\N	\N	\N	{"reason": "Invalid password", "deviceInfo": null}	\N	\N	2026-06-10 19:17:29.503869+00
40444de9-8c19-4451-b147-5c18d3a6e01f	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	failed_login	\N	\N	\N	\N	{"reason": "Invalid password", "deviceInfo": null}	\N	\N	2026-06-10 19:18:48.172583+00
6877726a-f144-4615-9598-1104b3248971	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	failed_login	\N	\N	\N	\N	{"reason": "Invalid password", "deviceInfo": null}	\N	\N	2026-06-10 19:19:20.865647+00
8b4ef248-5a24-4c42-a037-6d0dd558e114	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	failed_login	\N	\N	\N	\N	{"reason": "Invalid password", "deviceInfo": null}	\N	\N	2026-06-10 19:20:23.706688+00
13e7ac95-6a52-4096-91ba-a88cbdf9447f	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	failed_login	\N	\N	\N	\N	{"reason": "Invalid password", "deviceInfo": null}	\N	\N	2026-06-10 19:21:21.938381+00
c6a340e8-b17f-4a90-8f84-5f3fd5d56aae	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	failed_login	\N	\N	\N	\N	{"reason": "Invalid password", "deviceInfo": null}	\N	\N	2026-06-10 19:22:21.904901+00
f676c817-c6c5-4054-9b7f-725b198da395	\N	30000000-0000-0000-0000-000000000001	operator	Jigar Operator	login	\N	\N	b0000000-0000-0000-0000-000000000001	Adajan	{"shiftId": "e7a469ca-5b12-4220-b768-898c63e1c906", "loginTime": "2026-06-10T19:33:52.7380278+00:00", "deviceInfo": null}	\N	\N	2026-06-10 19:33:53.772116+00
0364e48c-8e50-4527-81db-4b8cd6b36ee1	\N	30000000-0000-0000-0000-000000000001	operator	Jigar Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000001	Adajan	{"shiftId": "e7a469ca-5b12-4220-b768-898c63e1c906"}	\N	\N	2026-06-10 19:33:54.32381+00
5da7134c-dfff-4061-85ea-06224a0ceaf5	\N	30000000-0000-0000-0000-000000000001	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000001	\N	{"OpeningBalance": 100}	\N	\N	2026-06-10 19:41:42.730653+00
64c3a0dd-2f0a-46ed-ad7e-b7095fd3e595	22222222-2222-2222-2222-222222222222	\N	super_admin	System Admin	login	\N	\N	\N	\N	{"method": "email_password", "deviceInfo": null}	\N	\N	2026-06-10 19:59:51.536239+00
50d790d7-af6d-460c-9af3-3b59af762321	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	failed_login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"reason": "Invalid password/PIN", "deviceInfo": null}	\N	\N	2026-06-10 20:07:06.190596+00
9967ba9a-8e3c-4a82-a075-50e079e9ab43	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	failed_login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"reason": "Invalid password/PIN", "deviceInfo": null}	\N	\N	2026-06-10 20:07:17.718005+00
3e660057-b0b1-47a5-a8c1-e8bead10612a	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	failed_login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"reason": "Invalid password/PIN", "deviceInfo": null}	\N	\N	2026-06-10 20:07:20.848143+00
26ee240e-74d8-47a6-9914-d2ae17619d8c	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "0c7e75f5-75ff-4d35-b9b3-4aa082811fb5", "loginTime": "2026-06-10T20:07:26.6138213+00:00", "deviceInfo": null}	\N	\N	2026-06-10 20:07:26.642974+00
5e12a509-5893-43cd-9579-de9f01bfd1d3	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "0c7e75f5-75ff-4d35-b9b3-4aa082811fb5"}	\N	\N	2026-06-10 20:07:26.670487+00
1d772982-1b7e-4fd7-8dde-e5df186b4a99	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 100}	\N	\N	2026-06-10 20:07:37.433772+00
b636de01-c5a0-4e0f-95d4-e6a534e10eb7	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0003"}	\N	\N	2026-06-10 20:08:33.034603+00
d2382c88-b4a8-49e3-ba79-358cb9404e47	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "03759cb4-db03-4121-917f-b145d9950233", "loginTime": "2026-06-10T20:12:43.5590385+00:00", "deviceInfo": null}	\N	\N	2026-06-10 20:12:44.203099+00
1b80519e-c873-468e-9c24-24f34270753a	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "03759cb4-db03-4121-917f-b145d9950233"}	\N	\N	2026-06-10 20:12:44.34681+00
a684ce35-4ca7-474b-8d0d-6b79c61fd47a	\N	30000000-0000-0000-0000-000000000003	Operator	System	member_update	member	e36fa765-6cff-4cb3-851e-42512bf09b84	b0000000-0000-0000-0000-000000000002	\N	{"MemberNumber": "MEM-2606-0002"}	\N	\N	2026-06-10 20:13:24.422341+00
6527dd15-9e3d-4a3b-94dd-a759ed626a2a	\N	30000000-0000-0000-0000-000000000003	Operator	System	wallet_recharge	wallet	e36fa765-6cff-4cb3-851e-42512bf09b84	b0000000-0000-0000-0000-000000000002	\N	{"Amount": 500, "PaymentType": "Online"}	\N	\N	2026-06-10 20:13:41.953892+00
e75020ab-78f2-43e8-9788-6d74bb13d9ff	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "ca9bdbf1-9490-4cbf-987f-e4461fe14257", "loginTime": "2026-06-10T20:23:05.291504+00:00", "deviceInfo": null}	\N	\N	2026-06-10 20:23:05.940505+00
1347768b-dac6-4cb3-838a-d31684b61647	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "ca9bdbf1-9490-4cbf-987f-e4461fe14257"}	\N	\N	2026-06-10 20:23:06.080937+00
6eeea21a-5092-415d-b679-93ea4845f884	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "d6674986-8954-4182-aa15-1e9190a5e54b", "loginTime": "2026-06-10T20:27:28.473518+00:00", "deviceInfo": null}	\N	\N	2026-06-10 20:27:29.033997+00
60a21a52-9e26-4fbe-96d6-4203d708ef60	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "d6674986-8954-4182-aa15-1e9190a5e54b"}	\N	\N	2026-06-10 20:27:29.174925+00
a0c98aa1-d648-4d34-b966-ae716455c434	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "98ec0c45-e216-4e8e-8697-26523ff4373d", "loginTime": "2026-06-10T20:53:22.8029772+00:00", "deviceInfo": null}	\N	\N	2026-06-10 20:53:23.3739+00
440932a0-a1fc-4fde-849d-9701cbf85e26	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "98ec0c45-e216-4e8e-8697-26523ff4373d"}	\N	\N	2026-06-10 20:53:23.482064+00
01d4adb6-0157-4623-82aa-936b4182b2b4	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	login	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "5e9b122c-e6f8-415b-afbe-e5dc366455eb", "loginTime": "2026-06-10T20:59:06.1363116+00:00", "deviceInfo": null}	\N	\N	2026-06-10 20:59:06.848286+00
59812a60-9ce8-4f49-a931-8faa2dfc320d	\N	30000000-0000-0000-0000-000000000003	operator	Harshal Operator	shift_start	\N	\N	b0000000-0000-0000-0000-000000000002	City Light	{"shiftId": "5e9b122c-e6f8-415b-afbe-e5dc366455eb"}	\N	\N	2026-06-10 20:59:06.962172+00
d637246a-8dbd-4e90-af78-f3051f34657c	\N	30000000-0000-0000-0000-000000000003	operator	System	session_start	session	c5d7090e-f47a-4aaa-b441-1912725df05b	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-03", "ExpectedAmount": 100, "DurationMinutes": 60}	\N	\N	2026-06-10 21:01:33.142635+00
adff7139-cabb-4b70-97cc-610ab132f824	\N	30000000-0000-0000-0000-000000000003	operator	System	session_stop	session	c5d7090e-f47a-4aaa-b441-1912725df05b	b0000000-0000-0000-0000-000000000002	\N	{"PcNumber": "PC-03", "TotalAmount": 100.00}	\N	\N	2026-06-10 21:01:38.099925+00
345c5771-8bdf-4ff1-9ba3-fc52c79b3eb0	\N	30000000-0000-0000-0000-000000000003	Operator	System	cash_register_open	cash_register	00000000-0000-0000-0000-000000000000	b0000000-0000-0000-0000-000000000002	\N	{"OpeningBalance": 100}	\N	\N	2026-06-10 21:06:58.58285+00
\.


--
-- Data for Name: bill_items; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.bill_items ("Id", "BillId", "ItemType", "ItemName", "Quantity", "UnitPrice", "TotalPrice", "InventoryId", "CreatedAt") FROM stdin;
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.bills ("Id", "BillNumber", "SessionId", "PcId", "BranchId", "OperatorId", "ShiftId", "CustomerName", "MemberId", "GamingAmount", "FoodAmount", "Subtotal", "DiscountType", "DiscountValue", "DiscountAmount", "DiscountBy", "DiscountReason", "TotalAmount", "PaymentType", "CashAmount", "OnlineAmount", "WalletAmount", "CashReceived", "ChangeReturned", "ActualCashCollected", "Status", "CompletedAt", "CreatedAt", "UpdatedAt") FROM stdin;
ba7de6ba-36dd-46d1-8803-b19693ed5544	BILL-20260610-C897	0995ba8c-b17c-44b8-96a1-18844aa3d54d	a4a8739e-518c-5279-b0ed-95f4273c245e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	b7f3c103-1370-47a8-868f-b8d12be84f25	meet	\N	200.00	0.00	200.00	\N	0.00	0.00	\N	\N	200.00	cash	200.00	0.00	0.00	200.00	0.00	200.00	completed	2026-06-10 08:18:16.485431+00	2026-06-10 08:16:13.927427+00	2026-06-10 08:18:16.485507+00
89050fd7-4f9a-4149-9113-e333a57b6d55	BILL-20260610-DF24	60ed3e87-5bfc-4c36-a6e5-91699441bc21	a4a8739e-518c-5279-b0ed-95f4273c245e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	b7f3c103-1370-47a8-868f-b8d12be84f25	harsh	\N	300.00	0.00	300.00	\N	0.00	0.00	\N	\N	300.00	split	130.00	170.00	0.00	130.00	0.00	130.00	completed	2026-06-10 08:20:50.936771+00	2026-06-10 08:20:13.855139+00	2026-06-10 08:20:50.936771+00
aecdabf6-3329-4912-a8d8-2f27e8b9cdf6	BILL-20260610-C0D4	01cc1aae-d913-4c39-a850-8a6c95e550f1	92d4d610-ad94-51cd-929a-f3002051d63e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	d3650e5a-0229-469e-9c7b-5ac07104180d	harshal	\N	100.00	0.00	100.00	\N	0.00	0.00	\N	\N	100.00	cash	100.00	0.00	0.00	100.00	0.00	100.00	completed	2026-06-10 10:08:41.070068+00	2026-06-10 10:08:22.786779+00	2026-06-10 10:08:41.070121+00
6cc873b1-9336-458c-9253-1d53f9d524f6	BILL-20260610-216F	4a45b281-4027-49e8-8e94-600cbec3b83c	92d4d610-ad94-51cd-929a-f3002051d63e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	f2a00d0d-06d1-4396-8cca-ea703b42ee6f	hsd	\N	50.00	0.00	50.00	\N	0.00	0.00	\N	\N	50.00	\N	0.00	0.00	0.00	0.00	0.00	0.00	pending	\N	2026-06-10 10:22:58.729491+00	2026-06-10 10:22:58.729491+00
2203e5e1-72bc-474f-bc5f-e01f7c0f2552	BILL-20260610-0451	c5d7090e-f47a-4aaa-b441-1912725df05b	a4a8739e-518c-5279-b0ed-95f4273c245e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	5e9b122c-e6f8-415b-afbe-e5dc366455eb	meet	\N	100.00	0.00	100.00	\N	0.00	0.00	\N	\N	100.00	\N	0.00	0.00	0.00	0.00	0.00	0.00	pending	\N	2026-06-10 21:01:32.642405+00	2026-06-10 21:01:32.642405+00
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.branches ("Id", "Name", "Address", "OpeningTime", "ClosingTime", "Status", "CreatedAt", "UpdatedAt") FROM stdin;
b0000000-0000-0000-0000-000000000001	Adajan	Adajan, Surat	10:00:00	02:00:00	active	2026-06-10 07:31:15.179758+00	2026-06-10 07:31:15.179758+00
b0000000-0000-0000-0000-000000000002	City Light	City Light, Surat	10:00:00	02:00:00	active	2026-06-10 07:31:15.179758+00	2026-06-10 07:31:15.179758+00
b0000000-0000-0000-0000-000000000003	Katargam	Katargam, Surat	10:00:00	02:00:00	active	2026-06-10 07:31:15.179758+00	2026-06-10 07:31:15.179758+00
b0000000-0000-0000-0000-000000000004	Varachha	Varachha, Surat	10:00:00	02:00:00	active	2026-06-10 07:31:15.179758+00	2026-06-10 07:31:15.179758+00
\.


--
-- Data for Name: cash_register; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.cash_register ("Id", "ShiftId", "BranchId", "OperatorId", "OpeningBalance", "TotalCashSales", "TotalSplitCash", "ExpectedDrawerCash", "PhysicalCashCounted", "CashDifference", "MismatchReason", "Status", "OpenedAt", "VerifiedAt", "ClosedAt") FROM stdin;
0c5b51f6-65ea-4e4d-a4d6-7ffe1cda5a45	d73cb321-8189-4137-aacd-314e2cd76326	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	100.00	0.00	0.00	100.00	\N	\N	\N	open	2026-06-10 08:06:59.743334+00	\N	\N
faee9820-190f-4b17-bf7a-b47abe5369e3	43489dd5-2d9a-43cc-abab-c9cd2a68f108	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	100.00	0.00	0.00	100.00	\N	\N	\N	open	2026-06-10 08:08:02.574988+00	\N	\N
6bffd490-b232-41c7-927c-2e79abbe3718	b7f3c103-1370-47a8-868f-b8d12be84f25	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	100.00	330.00	0.00	430.00	\N	\N	\N	open	2026-06-10 08:14:31.060132+00	\N	\N
825d9473-a3a7-434a-8846-5e29e91360bb	787bab40-af6f-47a6-8382-90d13f62a841	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	0.00	0.00	0.00	0.00	\N	\N	\N	open	2026-06-10 08:22:44.227637+00	\N	\N
26535513-57ce-4317-aabc-c6a7b67b0a0c	2f6ad91f-5b7c-45cf-a44a-6e9945fd32cc	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	0.00	0.00	0.00	0.00	\N	\N	\N	open	2026-06-10 09:24:06.172399+00	\N	\N
a47faa1f-ebb2-4a7a-bb78-5d14561d8ed2	56ceb2de-5b78-4242-832a-8cb0ea7f39be	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	0.00	0.00	0.00	100.00	\N	\N	\N	open	2026-06-10 09:50:20.400409+00	\N	\N
4dd3ce2b-0ee8-4f3d-8446-d81f902cbde9	d3650e5a-0229-469e-9c7b-5ac07104180d	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	100.00	100.00	0.00	400.00	\N	\N	\N	open	2026-06-10 09:56:20.317229+00	\N	\N
464ac6aa-1314-4fee-8604-178f81561680	4f332388-2356-4ebc-9c5f-6d4bfcd9b906	b0000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	1000.00	0.00	0.00	1000.00	\N	\N	\N	open	2026-06-10 19:05:37.795729+00	\N	\N
a3948f08-d16d-4734-a2c8-d8a1835412b1	e7a469ca-5b12-4220-b768-898c63e1c906	b0000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	100.00	0.00	0.00	100.00	\N	\N	\N	open	2026-06-10 19:41:42.211007+00	\N	\N
22d39d7d-871a-45c8-9099-1d04a4186c31	0c7e75f5-75ff-4d35-b9b3-4aa082811fb5	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	100.00	0.00	0.00	100.00	\N	\N	\N	open	2026-06-10 20:07:37.433178+00	\N	\N
e19fdb1b-0f2d-4b79-a655-748fd2ffd1a1	5e9b122c-e6f8-415b-afbe-e5dc366455eb	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	100.00	0.00	0.00	100.00	\N	\N	\N	open	2026-06-10 21:06:58.11884+00	\N	\N
\.


--
-- Data for Name: cash_transactions; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.cash_transactions ("Id", "CashRegisterId", "BillId", "BranchId", "OperatorId", "PcNumber", "CashAmount", "GamingAmount", "FoodAmount", "TransactionType", "CreatedAt") FROM stdin;
50e6f225-052a-41b2-a330-88222a755d1c	6bffd490-b232-41c7-927c-2e79abbe3718	ba7de6ba-36dd-46d1-8803-b19693ed5544	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	PC-03	200.00	200.00	0.00	billing	2026-06-10 08:18:16.49758+00
bd36b346-80f0-4565-8a07-26aadfab05f7	6bffd490-b232-41c7-927c-2e79abbe3718	89050fd7-4f9a-4149-9113-e333a57b6d55	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	PC-03	130.00	130.00	0.00	billing	2026-06-10 08:20:50.940941+00
fad858dd-5059-4546-b5a1-73584c686920	a47faa1f-ebb2-4a7a-bb78-5d14561d8ed2	\N	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	\N	100.00	0.00	0.00	wallet_recharge	2026-06-10 09:51:28.160672+00
75886ad9-6c14-4e33-bd27-f5bef0802bc1	4dd3ce2b-0ee8-4f3d-8446-d81f902cbde9	\N	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	\N	200.00	0.00	0.00	wallet_recharge	2026-06-10 09:56:32.005178+00
d10ef030-5c75-4a42-9a04-e282750626ab	4dd3ce2b-0ee8-4f3d-8446-d81f902cbde9	aecdabf6-3329-4912-a8d8-2f27e8b9cdf6	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	PC-02	100.00	100.00	0.00	billing	2026-06-10 10:08:41.162529+00
\.


--
-- Data for Name: denomination_counts; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.denomination_counts ("Id", "CashRegisterId", "ShiftId", "BranchId", "OperatorId", "Notes2000", "Notes500", "Notes200", "Notes100", "Notes50", "Notes20", "Notes10", "Coins5", "Coins2", "Coins1", "CountedTotal", "ExpectedTotal", "Difference", "IsVerified", "CreatedAt") FROM stdin;
\.


--
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.discounts ("Id", "BillId", "BranchId", "AdminId", "DiscountType", "DiscountValue", "DiscountAmount", "Reason", "CreatedAt") FROM stdin;
\.


--
-- Data for Name: food_order_items; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.food_order_items ("Id", "OrderId", "InventoryId", "ItemName", "Quantity", "UnitPrice", "TotalPrice", "CreatedAt") FROM stdin;
b26d6683-57c6-4dc1-b65d-ac6775e4b5f7	db3df109-b23a-4971-8637-c551e703424e	dea4d886-11a8-5421-8e34-6730fa5c731d	Cola	1	50.00	50.00	2026-06-10 08:18:38.624794+00
25bff9c0-52d3-4e25-8392-b932ab2379e7	34b2a0d5-0f42-44d2-bc69-6c92e08178d2	d01e1638-cbd0-5b15-9b9e-7c0b864f5504	Chips	1	30.00	30.00	2026-06-10 08:18:50.984929+00
\.


--
-- Data for Name: food_orders; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.food_orders ("Id", "OrderNumber", "SessionId", "PcId", "BranchId", "OperatorId", "CustomerName", "MemberId", "TotalAmount", "PaymentType", "Status", "CancelledReason", "OrderTime", "AcceptedAt", "ReadyAt", "DeliveredAt", "CompletedAt", "CreatedAt", "UpdatedAt") FROM stdin;
34b2a0d5-0f42-44d2-bc69-6c92e08178d2	ORD-260610-0002	\N	\N	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003		\N	30.00	\N	completed	\N	2026-06-10 08:18:50.984929+00	2026-06-10 08:18:52.623316+00	\N	2026-06-10 08:18:54.159614+00	2026-06-10 08:19:17.726771+00	2026-06-10 08:18:50.984929+00	2026-06-10 08:19:17.726771+00
db3df109-b23a-4971-8637-c551e703424e	ORD-260610-0001	\N	\N	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003		\N	50.00	\N	completed	\N	2026-06-10 08:18:38.624794+00	2026-06-10 08:18:41.434713+00	\N	2026-06-10 08:18:44.123267+00	2026-06-10 08:19:18.885952+00	2026-06-10 08:18:38.624794+00	2026-06-10 08:19:18.885952+00
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.inventory ("Id", "BranchId", "ItemName", "Category", "Price", "CurrentStock", "MinStockLimit", "Status", "ImageUrl", "CreatedAt", "UpdatedAt") FROM stdin;
f5365869-0c43-5a18-bf02-f0a33713a6d1	b0000000-0000-0000-0000-000000000001	Cola	Beverage	50.00	100	10	available	\N	2026-06-10 07:31:18.768832+00	2026-06-10 07:31:18.768832+00
db8b99fb-9fa0-5dc7-84dd-45060160ee1d	b0000000-0000-0000-0000-000000000001	Chips	Snack	30.00	50	5	available	\N	2026-06-10 07:31:18.768832+00	2026-06-10 07:31:18.768832+00
787b7a74-c2d4-5e49-add0-7346d85dd5ec	b0000000-0000-0000-0000-000000000003	Cola	Beverage	50.00	100	10	available	\N	2026-06-10 07:31:18.768832+00	2026-06-10 07:31:18.768832+00
a6092bfd-e757-5ea2-b45e-317573b0a141	b0000000-0000-0000-0000-000000000003	Chips	Snack	30.00	50	5	available	\N	2026-06-10 07:31:18.768832+00	2026-06-10 07:31:18.768832+00
00dde0fb-67c4-5499-9eb6-bd688743f102	b0000000-0000-0000-0000-000000000004	Cola	Beverage	50.00	100	10	available	\N	2026-06-10 07:31:18.768832+00	2026-06-10 07:31:18.768832+00
38ad7ce5-3a8f-5bea-ab77-372cc34c84e2	b0000000-0000-0000-0000-000000000004	Chips	Snack	30.00	50	5	available	\N	2026-06-10 07:31:18.768832+00	2026-06-10 07:31:18.768832+00
dea4d886-11a8-5421-8e34-6730fa5c731d	b0000000-0000-0000-0000-000000000002	Cola	Beverage	50.00	99	10	available	\N	2026-06-10 07:31:18.768832+00	2026-06-10 08:18:38.624794+00
d01e1638-cbd0-5b15-9b9e-7c0b864f5504	b0000000-0000-0000-0000-000000000002	Chips	Snack	30.00	49	5	available	\N	2026-06-10 07:31:18.768832+00	2026-06-10 08:18:50.984929+00
\.


--
-- Data for Name: inventory_logs; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.inventory_logs ("Id", "InventoryId", "BranchId", "OperatorId", "Action", "Quantity", "OldValue", "NewValue", "Reason", "CreatedAt") FROM stdin;
\.


--
-- Data for Name: loyalty_points; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.loyalty_points ("Id", "MemberId", "BranchId", "OperatorId", "AdminId", "Action", "Category", "Points", "PointsBefore", "PointsAfter", "BillId", "RewardType", "RewardValue", "Reason", "CreatedAt") FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.members ("Id", "MemberNumber", "FullName", "MobileNumber", "Email", "Status", "GamingPoints", "FoodPoints", "TotalPoints", "TotalGamingSpend", "TotalFoodSpend", "HomeBranchId", "JoinDate", "LastVisit", "CreatedBy", "CreatedAt", "UpdatedAt", "GamingBalance", "FoodBalance", "Username", "PasswordHash") FROM stdin;
87d70061-fdba-4d34-9ef9-0d9c5b996a4a	MEM-2606-0001	Harsh Dave	9173676680	meet200406@gmail.com	active	0	0	0	0.00	0.00	b0000000-0000-0000-0000-000000000002	2026-06-10 09:45:08.954916+00	\N	30000000-0000-0000-0000-000000000003	2026-06-10 09:45:09.524861+00	2026-06-10 09:45:09.524861+00	0.00	0.00	\N	\N
e36fa765-6cff-4cb3-851e-42512bf09b84	MEM-2606-0002	Meet	1234567890	meet200406@gmail.com	active	0	0	0	0.00	0.00	b0000000-0000-0000-0000-000000000002	2026-06-10 09:45:52.960913+00	\N	30000000-0000-0000-0000-000000000003	2026-06-10 09:45:52.965848+00	2026-06-10 20:13:24.097039+00	500.00	0.00	boggie	$2a$11$NVVz3LjbPixSMnpRj/CgleVLzjgH1vEyurilPEk.N9SsFZB5VH9z.
c3c74895-fe32-422b-9d4c-09e1db96b307	MEM-2606-0004	Test Validation User	9999999999	\N	active	0	0	0	0.00	0.00	b0000000-0000-0000-0000-000000000001	2026-06-10 12:40:05.563294+00	\N	22222222-2222-2222-2222-222222222222	2026-06-10 12:40:05.661204+00	2026-06-10 12:59:43.788452+00	0.00	0.00	testmember	$2a$11$5aw9sFQfWgNF6d0qFtSUguDyrQ/rjauwWTKY5uol8/aSP7zfSNFLu
ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	MEM-2606-0003	harshal	1234567899	meet200406@gmail.com	active	0	0	0	0.00	0.00	b0000000-0000-0000-0000-000000000002	2026-06-10 09:51:09.069566+00	\N	30000000-0000-0000-0000-000000000003	2026-06-10 09:51:09.151882+00	2026-06-10 20:08:32.705408+00	100.00	200.00	who	$2a$11$UhdduJ4VeosFsuoSvbY.k.OQOqJDE.7qMEH8AVlhSFLaI7fUqnuvO
\.


--
-- Data for Name: operators; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.operators ("Id", "FullName", "Username", "PasswordHash", "MobileNumber", "BranchId", "Status", "DashboardPermissions", "LastLogin", "DeviceInfo", "CreatedBy", "CreatedAt", "UpdatedAt") FROM stdin;
30000000-0000-0000-0000-000000000005	Karan Operator	karan	$2a$11$TzuE8x9VcVgkP124XnmyL.lyDGbYbEdce.hAJvqsKEGy8DphWwv7O	\N	b0000000-0000-0000-0000-000000000003	active	{"pc_status": true, "food_orders": true, "cash_register": true, "main_dashboard": true, "billing_counter": true}	\N	\N	\N	2026-06-10 07:31:15.665342+00	2026-06-10 07:31:15.665342+00
30000000-0000-0000-0000-000000000006	Mayur Operator	mayur	$2a$11$TzuE8x9VcVgkP124XnmyL.lyDGbYbEdce.hAJvqsKEGy8DphWwv7O	\N	b0000000-0000-0000-0000-000000000003	active	{"pc_status": true, "food_orders": true, "cash_register": true, "main_dashboard": true, "billing_counter": true}	\N	\N	\N	2026-06-10 07:31:15.665342+00	2026-06-10 07:31:15.665342+00
30000000-0000-0000-0000-000000000007	Bhavdip Operator	bhavdip	$2a$11$TzuE8x9VcVgkP124XnmyL.lyDGbYbEdce.hAJvqsKEGy8DphWwv7O	\N	b0000000-0000-0000-0000-000000000004	active	{"pc_status": true, "food_orders": true, "cash_register": true, "main_dashboard": true, "billing_counter": true}	\N	\N	\N	2026-06-10 07:31:15.665342+00	2026-06-10 07:31:15.665342+00
30000000-0000-0000-0000-000000000008	Darshan Operator	darshan	$2a$11$TzuE8x9VcVgkP124XnmyL.lyDGbYbEdce.hAJvqsKEGy8DphWwv7O	\N	b0000000-0000-0000-0000-000000000004	active	{"pc_status": true, "food_orders": true, "cash_register": true, "main_dashboard": true, "billing_counter": true}	\N	\N	\N	2026-06-10 07:31:15.665342+00	2026-06-10 07:31:15.665342+00
30000000-0000-0000-0000-000000000001	Jigar Operator	jigar	$2a$11$TzuE8x9VcVgkP124XnmyL.lyDGbYbEdce.hAJvqsKEGy8DphWwv7O	\N	b0000000-0000-0000-0000-000000000001	active	{"pc_status": true, "food_orders": true, "cash_register": true, "main_dashboard": true, "billing_counter": true}	2026-06-10 19:33:53.133938+00	\N	\N	2026-06-10 07:31:15.665342+00	2026-06-10 19:33:53.134262+00
30000000-0000-0000-0000-000000000002	Ankur Operator	ankur	$2a$11$TzuE8x9VcVgkP124XnmyL.lyDGbYbEdce.hAJvqsKEGy8DphWwv7O	\N	b0000000-0000-0000-0000-000000000001	active	{"pc_status": true, "food_orders": true, "cash_register": true, "main_dashboard": true, "billing_counter": true}	2026-06-10 07:44:46.420753+00	\N	\N	2026-06-10 07:31:15.665342+00	2026-06-10 07:44:46.420892+00
30000000-0000-0000-0000-000000000004	Nazmin Operator	nazmin	$2a$11$TzuE8x9VcVgkP124XnmyL.lyDGbYbEdce.hAJvqsKEGy8DphWwv7O	\N	b0000000-0000-0000-0000-000000000002	active	{"pc_status": true, "food_orders": true, "cash_register": true, "main_dashboard": true, "billing_counter": true}	2026-06-10 12:35:24.604275+00	\N	\N	2026-06-10 07:31:15.665342+00	2026-06-10 12:35:24.604384+00
30000000-0000-0000-0000-000000000003	Harshal Operator	harshal	$2a$11$TzuE8x9VcVgkP124XnmyL.lyDGbYbEdce.hAJvqsKEGy8DphWwv7O	\N	b0000000-0000-0000-0000-000000000002	active	{"eod": true, "members": true, "sessions": true, "settings": false, "cash_desk": true, "pc_status": true, "food_orders": true, "menu_editor": true, "reservations": true, "cash_register": true, "main_dashboard": true, "billing_counter": true}	2026-06-10 20:59:06.386429+00	\N	\N	2026-06-10 07:31:15.665342+00	2026-06-10 20:59:06.386625+00
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.payments ("Id", "BillId", "BranchId", "OperatorId", "PaymentType", "TotalAmount", "CashAmount", "OnlineAmount", "WalletAmount", "CashReceived", "ChangeReturned", "ActualCashCollected", "GamingPortion", "FoodPortion", "Status", "CreatedAt") FROM stdin;
4045e0cc-6989-4f6f-84fc-cffa992af96a	ba7de6ba-36dd-46d1-8803-b19693ed5544	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	cash	200.00	200.00	0.00	0.00	200.00	0.00	200.00	200.00	0.00	completed	2026-06-10 08:18:16.386008+00
f764f70c-81d8-4578-a67c-a1f33fea7db3	89050fd7-4f9a-4149-9113-e333a57b6d55	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	split	300.00	130.00	170.00	0.00	130.00	0.00	130.00	300.00	0.00	completed	2026-06-10 08:20:50.935946+00
820e9d1c-84d1-4648-9432-79df6e31b6a8	aecdabf6-3329-4912-a8d8-2f27e8b9cdf6	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	cash	100.00	100.00	0.00	0.00	100.00	0.00	100.00	100.00	0.00	completed	2026-06-10 10:08:40.980352+00
\.


--
-- Data for Name: pcs; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.pcs ("Id", "PcNumber", "BranchId", "State", "CurrentSessionId", "CurrentReservationId", "LastActiveAt", "LastOperatorId", "IpAddress", "Specs", "PcName", "Zone", "PricingProfileId", "HardwareNotes", "IsActive", "IsDeleted", "CreatedAt", "UpdatedAt") FROM stdin;
d17afe28-3047-5831-a71a-fb084b96b8e4	PC-01	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 1	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
3709cb3a-428d-550a-8cef-54bc0c63eac3	PC-02	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 2	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
6d303f6f-039a-5de0-bd98-a975b28a133e	PC-03	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 3	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
b241e024-7401-5bcf-affc-509a9ea901fd	PC-04	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 4	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
468ff609-4bd3-5072-8eb1-e778bf1e018e	PC-05	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 5	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
c481290b-a459-58d1-8f43-cdb48a97deda	PC-06	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 6	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
dfb4dd98-10e6-596e-9e43-84ea6e451f09	PC-07	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 7	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
d4eafc64-194c-5c59-a1ba-6d0cf0283aa6	PC-08	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 8	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
2d874b17-4753-5a48-9c0e-777cc047aa8c	PC-09	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 9	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9564111e-e527-5f25-9352-51983afe9a26	PC-10	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 10	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
d6198bde-5a2a-5d59-b672-da389b949be3	PC-11	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 11	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
451a8a95-6aab-5e83-89bd-1db054d64e50	PC-12	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 12	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
7a375797-3f14-53e4-a0ab-f5d08e449abc	PC-13	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 13	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
973f2141-6eda-539d-9e1b-18e962ceb73b	PC-14	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 14	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
4a3960e2-7d1f-5c0a-bf11-7033cd80757f	PC-15	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 15	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
c5d7c552-97a7-5aa6-856c-4b4796ed2d08	PC-16	b0000000-0000-0000-0000-000000000001	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 4060 Ti (240Hz)"}	Gaming Rig 16	PRO COMBAT DESK	20000000-0000-0000-0000-000000000001	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
d5f8f99e-f96c-5bb7-b378-8e6db7fdaa5f	PC-01	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 1	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
ebcf5f5f-1180-5b8b-9e4d-811d08c0d055	PC-04	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 4	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
653ec14d-b7c8-57c9-93b8-4fb73f32d7b4	PC-05	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 5	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9c3eef2a-1459-5c11-addc-d70c06c8b91a	PC-06	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 6	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
50b1d4c1-0840-5ee6-8328-73e3acc5720d	PC-07	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 7	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
1fac7a31-df73-500f-acc2-eecaf0f9c6f6	PC-08	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 8	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9db21a23-dac4-57ca-8f97-a7471984ab15	PC-09	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 9	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
92139bc6-bb86-5aa0-a8b3-35f9cff74105	PC-10	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 10	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
98b306f4-7b59-5cbb-8ad8-bc9a3fff8873	PC-11	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 11	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
a1a3b146-e15b-5ff4-b0ad-6c0bca711a5f	PC-12	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 12	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
37b50fa2-15d7-59d2-b367-eb5419b7ec79	PC-13	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 13	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
5e733916-eafc-58a3-a58e-22cc3c3b1182	PC-14	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 14	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
903e61d3-c59b-573d-9666-979864680a8f	PC-15	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 15	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
194e3b57-daf7-5bc1-b115-362cce318be3	PC-16	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 16	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
f74dcd8f-be2e-54d5-a7c9-7c0b924ea6a7	PC-17	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 17	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
ab3054f5-478d-5151-9951-5c32e3ffffff	PC-18	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 18	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
7b5a05a3-cb33-5b6c-9305-21ef19f1a4fd	PC-19	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 19	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9b59aa45-cbff-54c0-8daa-3f8887d46682	PC-20	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 20	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9f5aaf2a-0a2d-5f36-84de-9ef4229318be	PC-21	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 21	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
7df5765c-696a-5c2d-b338-e5603f8bee18	PC-22	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 22	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
766ca83d-dbfd-5501-a7cf-13c0b94e9d35	PC-23	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 23	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
c6e173ca-653d-5308-b901-760d0dfab58e	PC-24	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 24	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
5c6dc98a-afce-5c98-8af2-be4b1738a60f	PC-25	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 25	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
7c22d8c2-6982-502b-adf9-12a43a278b4b	PC-26	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 26	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
075a8940-a14e-5466-abde-2ae4768a6d95	PC-27	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 27	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
4044fe27-9dd2-515c-8e9d-0653a72345c8	PC-28	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 28	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
0fdfb321-01de-5be5-9f2e-c0e5bd0282a5	PC-29	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 29	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
a6f1a4bd-55c3-5015-84c5-02ebb49a5a26	PC-30	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 30	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
fc1ccf7d-3f64-54ba-bcca-0fc63c801992	PC-31	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 31	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
aaa446ff-8ebf-57f9-8c47-65d3675f07df	PC-32	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 32	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
06057746-ca2c-55d1-9936-35258ee3b1a7	PC-33	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 33	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
c06400fa-897c-551e-94bf-a1d2c1e8c9c7	PC-34	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 34	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
fcc1b2d7-ed70-5e0f-894e-5663a3484cef	PC-35	b0000000-0000-0000-0000-000000000002	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 3060 Ti (240Hz)"}	Gaming Rig 35	ELITE WAR ZONE	20000000-0000-0000-0000-000000000003	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
086eb781-b22c-5823-a38a-222a4d46091c	PC-01	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 1	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
08fcb25b-6d27-5836-8897-d4b9d748b6fe	PC-02	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 2	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
b1b7f544-1ae6-5d52-968f-4e692412f032	PC-03	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 3	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
1ec8f1d7-0c26-58ad-a90c-d813aeecc12d	PC-04	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 4	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
40313386-d57e-5277-ad55-bb2da7ad6ddc	PC-05	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 5	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
49ab066a-2d4b-5f7c-8d30-b4388741db0f	PC-06	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 6	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
807863ca-0969-5e8f-83c3-464923491b33	PC-07	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 7	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
37f1e402-db19-5df6-89d6-aa1dfb583e59	PC-08	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 8	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
2928d5db-65b8-590b-b100-5209824e9e4a	PC-09	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 9	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
df9c31f7-530c-5d71-afac-81486b758672	PC-10	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 10	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
1a283529-6055-5486-a3c7-aaee7bdc533e	PC-11	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 11	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
d5160801-cc7f-56be-a267-6624dc58c5ed	PC-12	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (165Hz)"}	Gaming Rig 12	RECRUIT DECK	20000000-0000-0000-0000-000000000004	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
cb13a3a2-1751-5330-b054-830968e3fdbc	PC-13	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 13	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
32a7f98e-9e16-5dab-81c7-553188008c38	PC-14	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 14	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
3c7ff3c0-f302-5888-b103-1ae4fd0d38de	PC-15	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 15	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
b8ec1db7-0e1d-59c9-9af4-ce59e1baed07	PC-16	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 16	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
b9bce586-7e56-5c52-829a-10bd19feed37	PC-17	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 17	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
0df56fb4-c447-5200-b705-b07eb6349129	PC-18	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 18	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
2a59e370-edae-5848-ac33-b01b21daf1d2	PC-19	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 19	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
560f5830-a269-57e8-b2ff-d7e81f4be587	PC-20	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 20	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
a458f319-0c86-5a38-a13b-7dcdbde39da4	PC-21	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 21	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
8d0ae10f-5ac3-5ef5-8010-3e41aec9d514	PC-22	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i5 13th Gen", "gpu": "RTX 2060 Ti (240Hz)"}	Gaming Rig 22	VETERAN STAND	20000000-0000-0000-0000-000000000005	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9d25bb9a-ac40-53e4-b74a-8a394628e536	PC-23	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 23	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
d5ea2670-6256-5cd4-8136-52fd1d17120e	PC-24	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 24	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
4c6db9fb-e1e2-5a02-84ef-fdeb49d7b8ce	PC-25	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 25	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
c8e47d6b-4df1-5a6f-83f4-dd701be24d5c	PC-26	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 26	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
bbd6eeb2-72b3-5c2b-8502-9c59ab69b3ba	PC-27	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 27	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
81aab746-8c61-5cf1-b3c1-db5def447a71	PC-28	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 28	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
037b6b1b-8e89-5dd9-a51f-85d0c5e9c22e	PC-29	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 29	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
586f3c2c-5e1b-56b9-ae73-706fc10b5aad	PC-30	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 30	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9a85d7e1-68e7-5046-84c5-74ff8471ecb5	PC-31	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 31	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
94817d02-c72c-5cb1-ba74-62ff98d4982e	PC-32	b0000000-0000-0000-0000-000000000003	idle	\N	\N	\N	\N	\N	{"cpu": "i7 13th Gen", "gpu": "RTX 3060 Ti Trio (360Hz)"}	Gaming Rig 32	VIP ELITE HUB	20000000-0000-0000-0000-000000000006	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9f17137d-5c5a-51b3-87eb-75ea8e5bb934	PC-01	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 1	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
e39b98e2-0cf3-5560-98b4-f3a54db1f495	PC-02	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 2	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
7d0eb685-1473-5918-9ca3-7601da7349c9	PC-03	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 3	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
7dd446f7-4b25-5477-b11e-a28871e94d25	PC-04	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 4	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
d677cb0c-8fff-55a2-85a0-c7289a01bcdd	PC-05	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 5	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
4132e27c-21df-5230-bb8a-ec3e0982665d	PC-06	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 6	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
400f06f5-4cff-5eca-983d-0a9b6dcb4ea9	PC-07	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 7	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
77904a17-b13a-5ea2-a308-2051fb20601e	PC-08	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 8	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
964f24be-45ac-5842-8203-0238b604eb9c	PC-09	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 9	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
22585860-9b4e-5bed-8385-73106b33f45c	PC-10	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (240Hz)"}	Gaming Rig 10	TITAN DESK	20000000-0000-0000-0000-000000000007	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
ccd157b1-5f71-57df-9895-75f3334f02d1	PC-11	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 11	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
19c1454f-4348-57a6-897b-98d180cc6f63	PC-12	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 12	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
b955a1e2-c510-5c43-b59e-1a6d75757e86	PC-13	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 13	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
0ca49eb6-249b-5a3e-a3c3-5826bf39c0ff	PC-14	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 14	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
a98adb70-008d-5b3a-89fc-f4cd914521b5	PC-15	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 15	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
22ffb33e-f7f3-5cb9-b806-0d02e91a788b	PC-16	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 16	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
c98aa4b1-4a8a-5a36-945c-fb267bcedf01	PC-17	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 17	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
ef6c6096-c934-5160-893c-4c699442f2b1	PC-18	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 18	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
a198065a-5106-56c2-9828-717ee5ca2603	PC-19	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 19	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
b16f7c83-58a8-51e1-b5c8-ba6dab78b360	PC-20	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "i7 14th Gen", "gpu": "RTX 5060 Ti Gaming 2X (400Hz)"}	Gaming Rig 20	GOD-TIER arena	20000000-0000-0000-0000-000000000008	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
0fc3df9e-ce26-53ea-9054-c6c05ed364dc	Console-01	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "PlayStation 5", "gpu": "4K OLED (3x PS5)"}	PS5 Console 1	SOFA CLUB COUCH	20000000-0000-0000-0000-000000000009	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
b0f89fa4-28b1-520d-a18c-578b31588a3b	Console-02	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "PlayStation 5", "gpu": "4K OLED (3x PS5)"}	PS5 Console 2	SOFA CLUB COUCH	20000000-0000-0000-0000-000000000009	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
9c31c611-93b4-55f2-b93b-d3bfe784a16a	Console-03	b0000000-0000-0000-0000-000000000004	idle	\N	\N	\N	\N	\N	{"cpu": "PlayStation 5", "gpu": "4K OLED (3x PS5)"}	PS5 Console 3	SOFA CLUB COUCH	20000000-0000-0000-0000-000000000009	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
92d4d610-ad94-51cd-929a-f3002051d63e	PC-02	b0000000-0000-0000-0000-000000000002	awaiting_billing	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 2	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
a4a8739e-518c-5279-b0ed-95f4273c245e	PC-03	b0000000-0000-0000-0000-000000000002	awaiting_billing	\N	\N	\N	\N	\N	{"cpu": "i5 11th Gen", "gpu": "GTX 1660 Ti (144Hz)"}	Gaming Rig 3	CHAMPION ZONE	20000000-0000-0000-0000-000000000002	\N	t	f	2026-06-10 07:31:18.701152+00	2026-06-10 07:31:18.701152+00
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.reservations ("Id", "PcId", "BranchId", "OperatorId", "CustomerName", "MemberId", "ReservationTime", "DurationMin", "GracePeriodMin", "State", "StartedAt", "ExpiredAt", "CancelledAt", "OverrideBy", "OverrideReason", "Notes", "CreatedAt", "UpdatedAt") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.sessions ("Id", "PcId", "BranchId", "OperatorId", "ShiftId", "CustomerName", "MemberId", "StartTime", "EndTime", "PlannedDurationMin", "ActualDurationMin", "GamingAmount", "FoodAmount", "TotalAmount", "State", "GamingType", "Notes", "CreatedAt", "UpdatedAt") FROM stdin;
0995ba8c-b17c-44b8-96a1-18844aa3d54d	a4a8739e-518c-5279-b0ed-95f4273c245e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	b7f3c103-1370-47a8-868f-b8d12be84f25	meet	\N	2026-06-10 08:16:13.927427+00	2026-06-10 08:17:52.88587+00	120	1	200.00	0.00	200.00	completed	WALK-IN - 120m	\N	2026-06-10 08:16:13.927427+00	2026-06-10 08:17:52.88587+00
60ed3e87-5bfc-4c36-a6e5-91699441bc21	a4a8739e-518c-5279-b0ed-95f4273c245e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	b7f3c103-1370-47a8-868f-b8d12be84f25	harsh	\N	2026-06-10 08:20:13.855139+00	2026-06-10 08:20:16.937912+00	180	0	300.00	0.00	300.00	completed	WALK-IN - 180m	\N	2026-06-10 08:20:13.855139+00	2026-06-10 08:20:16.937912+00
01cc1aae-d913-4c39-a850-8a6c95e550f1	92d4d610-ad94-51cd-929a-f3002051d63e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	d3650e5a-0229-469e-9c7b-5ac07104180d	harshal	\N	2026-06-10 10:08:22.786779+00	2026-06-10 10:08:26.353517+00	60	0	100.00	0.00	100.00	completed	WALK-IN - 60m	\N	2026-06-10 10:08:22.786779+00	2026-06-10 10:08:26.353517+00
4a45b281-4027-49e8-8e94-600cbec3b83c	92d4d610-ad94-51cd-929a-f3002051d63e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	f2a00d0d-06d1-4396-8cca-ea703b42ee6f	hsd	\N	2026-06-10 10:22:58.729491+00	2026-06-10 10:23:01.125787+00	30	0	50.00	0.00	50.00	completed	WALK-IN - 30m	\N	2026-06-10 10:22:58.729491+00	2026-06-10 10:23:01.125787+00
c5d7090e-f47a-4aaa-b441-1912725df05b	a4a8739e-518c-5279-b0ed-95f4273c245e	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	5e9b122c-e6f8-415b-afbe-e5dc366455eb	meet	\N	2026-06-10 21:01:32.642405+00	2026-06-10 21:01:38.059882+00	60	0	100.00	0.00	100.00	completed	MEMBER - 60m	\N	2026-06-10 21:01:32.642405+00	2026-06-10 21:01:38.059882+00
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.shifts ("Id", "OperatorId", "BranchId", "LoginTime", "LogoutTime", "DeviceInfo", "Status", "Summary", "CreatedAt") FROM stdin;
fefd1e50-9d3d-51d6-a467-b93b556b768b	30000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000001	2026-06-10 07:31:18.776835+00	\N	\N	active	\N	2026-06-10 07:31:18.776835+00
c40463ce-5ccd-505a-b4fd-769f89dc06ea	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 07:31:18.776835+00	\N	\N	active	\N	2026-06-10 07:31:18.776835+00
84162576-eaeb-5295-85e1-5d211329f4d6	30000000-0000-0000-0000-000000000005	b0000000-0000-0000-0000-000000000003	2026-06-10 07:31:18.776835+00	\N	\N	active	\N	2026-06-10 07:31:18.776835+00
7233557b-b773-55dc-847a-bbccb52f41dc	30000000-0000-0000-0000-000000000007	b0000000-0000-0000-0000-000000000004	2026-06-10 07:31:18.776835+00	\N	\N	active	\N	2026-06-10 07:31:18.776835+00
7ff188b6-aa15-4e34-b445-5dd8e429ddcd	30000000-0000-0000-0000-000000000002	b0000000-0000-0000-0000-000000000001	2026-06-10 07:44:46.406358+00	\N	\N	active	\N	2026-06-10 07:44:46.406514+00
d73cb321-8189-4137-aacd-314e2cd76326	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 08:06:46.067714+00	2026-06-10 08:07:42.929587+00	\N	completed	\N	2026-06-10 08:06:46.067854+00
43489dd5-2d9a-43cc-abab-c9cd2a68f108	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 08:07:57.304097+00	\N	\N	active	\N	2026-06-10 08:07:57.304098+00
18bc7b39-3f52-4cf5-a311-e4301e313c25	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 08:13:35.923913+00	2026-06-10 08:14:21.016997+00	\N	completed	\N	2026-06-10 08:13:35.924089+00
b7f3c103-1370-47a8-868f-b8d12be84f25	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 08:14:25.394841+00	2026-06-10 08:21:16.871276+00	\N	completed	\N	2026-06-10 08:14:25.394842+00
787bab40-af6f-47a6-8382-90d13f62a841	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 08:22:39.867608+00	2026-06-10 08:23:40.634317+00	\N	completed	\N	2026-06-10 08:22:39.867609+00
2f6ad91f-5b7c-45cf-a44a-6e9945fd32cc	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 09:23:54.421227+00	\N	\N	active	\N	2026-06-10 09:23:54.421228+00
fed05d26-aaba-4f6d-9b3f-130ad5fd8d84	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 09:38:33.124066+00	\N	\N	active	\N	2026-06-10 09:38:33.124263+00
56ceb2de-5b78-4242-832a-8cb0ea7f39be	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 09:50:14.691255+00	\N	\N	active	\N	2026-06-10 09:50:14.691531+00
d3650e5a-0229-469e-9c7b-5ac07104180d	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 09:55:09.774809+00	\N	\N	active	\N	2026-06-10 09:55:09.774958+00
f2a00d0d-06d1-4396-8cca-ea703b42ee6f	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 10:20:57.036002+00	\N	\N	active	\N	2026-06-10 10:20:57.036174+00
16249e73-ab3a-41a9-8f79-9f5f54604398	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 10:39:06.911082+00	\N	\N	active	\N	2026-06-10 10:39:06.911083+00
070e95dd-c66f-4511-968c-c546f2bb2127	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 10:55:45.644968+00	\N	\N	active	\N	2026-06-10 10:55:45.645181+00
82b0b37f-1d08-47b5-9521-32257306bd16	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 11:57:15.48548+00	\N	\N	active	\N	2026-06-10 11:57:15.485805+00
e7782a92-1617-4d92-a28f-dd3c3a95e54d	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 12:15:43.416139+00	\N	\N	active	\N	2026-06-10 12:15:43.41631+00
3ba249d6-11f3-4856-b3d4-ded7e5561c41	30000000-0000-0000-0000-000000000004	b0000000-0000-0000-0000-000000000002	2026-06-10 12:35:24.504159+00	\N	\N	active	\N	2026-06-10 12:35:24.504301+00
4f332388-2356-4ebc-9c5f-6d4bfcd9b906	30000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000001	2026-06-10 19:05:17.697611+00	2026-06-10 19:07:11.695646+00	\N	completed	\N	2026-06-10 19:05:17.697836+00
e7a469ca-5b12-4220-b768-898c63e1c906	30000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000001	2026-06-10 19:33:52.738027+00	\N	\N	active	\N	2026-06-10 19:33:52.73833+00
0c7e75f5-75ff-4d35-b9b3-4aa082811fb5	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 20:07:26.613821+00	\N	\N	active	\N	2026-06-10 20:07:26.613822+00
03759cb4-db03-4121-917f-b145d9950233	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 20:12:43.559038+00	\N	\N	active	\N	2026-06-10 20:12:43.559248+00
ca9bdbf1-9490-4cbf-987f-e4461fe14257	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 20:23:05.291504+00	\N	\N	active	\N	2026-06-10 20:23:05.291651+00
d6674986-8954-4182-aa15-1e9190a5e54b	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 20:27:28.473518+00	\N	\N	active	\N	2026-06-10 20:27:28.473657+00
98ec0c45-e216-4e8e-8697-26523ff4373d	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 20:53:22.802977+00	\N	\N	active	\N	2026-06-10 20:53:22.803109+00
5e9b122c-e6f8-415b-afbe-e5dc366455eb	30000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	2026-06-10 20:59:06.136311+00	\N	\N	active	\N	2026-06-10 20:59:06.13685+00
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.system_config ("Id", "ConfigKey", "ConfigValue", "Description", "UpdatedBy", "UpdatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.users ("Id", "Email", "PasswordHash", "FullName", "Role", "Status", "LastLogin", "DeviceInfo", "CreatedAt", "UpdatedAt") FROM stdin;
22222222-2222-2222-2222-222222222222	admin@appleesports.com	$2a$11$HuaGgvFZSbPHVNiw.vi52OnKtKSIl4X8p1BBiKHUYvs7kq8I14Luy	System Admin	super_admin	active	2026-06-10 19:59:51.51859+00	\N	2026-06-10 07:31:15.188523+00	2026-06-10 19:59:51.518873+00
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: appleesports_admin
--

COPY public.wallet_transactions ("Id", "MemberId", "BranchId", "OperatorId", "AdminId", "Action", "Amount", "BalanceBefore", "BalanceAfter", "PaymentType", "CashAmount", "OnlineAmount", "BillId", "Reason", "CreatedAt", "TargetWallet") FROM stdin;
c1454a9a-c43f-43f7-a43e-dbf8c6ab9928	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	\N	recharge	100.00	0.00	100.00	Cash	100.00	0.00	\N	Manual top-up	2026-06-10 09:51:28.03506+00	Gaming
e0610fe9-6053-482d-82ff-f6e9b02c1628	ae3580d9-cb5b-48c4-9cba-0de3c9e623a8	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	\N	recharge	200.00	0.00	200.00	Cash	200.00	0.00	\N	Manual top-up	2026-06-10 09:56:31.999223+00	Food
bacc01e3-459f-4e7c-86cc-a05f427f2174	e36fa765-6cff-4cb3-851e-42512bf09b84	b0000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000003	\N	recharge	500.00	0.00	500.00	Online	0.00	500.00	\N	Manual top-up	2026-06-10 20:13:41.894755+00	Gaming
\.


--
-- Name: EodSnapshots PK_EodSnapshots; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public."EodSnapshots"
    ADD CONSTRAINT "PK_EodSnapshots" PRIMARY KEY ("Id");


--
-- Name: PricingProfiles PK_PricingProfiles; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public."PricingProfiles"
    ADD CONSTRAINT "PK_PricingProfiles" PRIMARY KEY ("Id");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: audit_logs PK_audit_logs; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_audit_logs" PRIMARY KEY ("Id");


--
-- Name: bill_items PK_bill_items; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT "PK_bill_items" PRIMARY KEY ("Id");


--
-- Name: bills PK_bills; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "PK_bills" PRIMARY KEY ("Id");


--
-- Name: branches PK_branches; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "PK_branches" PRIMARY KEY ("Id");


--
-- Name: cash_register PK_cash_register; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_register
    ADD CONSTRAINT "PK_cash_register" PRIMARY KEY ("Id");


--
-- Name: cash_transactions PK_cash_transactions; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "PK_cash_transactions" PRIMARY KEY ("Id");


--
-- Name: denomination_counts PK_denomination_counts; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.denomination_counts
    ADD CONSTRAINT "PK_denomination_counts" PRIMARY KEY ("Id");


--
-- Name: discounts PK_discounts; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT "PK_discounts" PRIMARY KEY ("Id");


--
-- Name: food_order_items PK_food_order_items; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_order_items
    ADD CONSTRAINT "PK_food_order_items" PRIMARY KEY ("Id");


--
-- Name: food_orders PK_food_orders; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_orders
    ADD CONSTRAINT "PK_food_orders" PRIMARY KEY ("Id");


--
-- Name: inventory PK_inventory; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "PK_inventory" PRIMARY KEY ("Id");


--
-- Name: inventory_logs PK_inventory_logs; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT "PK_inventory_logs" PRIMARY KEY ("Id");


--
-- Name: loyalty_points PK_loyalty_points; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT "PK_loyalty_points" PRIMARY KEY ("Id");


--
-- Name: members PK_members; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "PK_members" PRIMARY KEY ("Id");


--
-- Name: operators PK_operators; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT "PK_operators" PRIMARY KEY ("Id");


--
-- Name: payments PK_payments; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_payments" PRIMARY KEY ("Id");


--
-- Name: pcs PK_pcs; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.pcs
    ADD CONSTRAINT "PK_pcs" PRIMARY KEY ("Id");


--
-- Name: reservations PK_reservations; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "PK_reservations" PRIMARY KEY ("Id");


--
-- Name: sessions PK_sessions; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "PK_sessions" PRIMARY KEY ("Id");


--
-- Name: shifts PK_shifts; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "PK_shifts" PRIMARY KEY ("Id");


--
-- Name: system_config PK_system_config; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT "PK_system_config" PRIMARY KEY ("Id");


--
-- Name: users PK_users; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_users" PRIMARY KEY ("Id");


--
-- Name: wallet_transactions PK_wallet_transactions; Type: CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "PK_wallet_transactions" PRIMARY KEY ("Id");


--
-- Name: IX_EodSnapshots_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_EodSnapshots_BranchId" ON public."EodSnapshots" USING btree ("BranchId");


--
-- Name: IX_EodSnapshots_GeneratedByOperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_EodSnapshots_GeneratedByOperatorId" ON public."EodSnapshots" USING btree ("GeneratedByOperatorId");


--
-- Name: IX_Members_Username; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_Members_Username" ON public.members USING btree ("Username") WHERE ("Username" IS NOT NULL);


--
-- Name: IX_PricingProfiles_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_PricingProfiles_BranchId" ON public."PricingProfiles" USING btree ("BranchId");


--
-- Name: IX_bills_BillNumber; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_bills_BillNumber" ON public.bills USING btree ("BillNumber");


--
-- Name: IX_bills_DiscountBy; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_bills_DiscountBy" ON public.bills USING btree ("DiscountBy");


--
-- Name: IX_bills_MemberId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_bills_MemberId" ON public.bills USING btree ("MemberId");


--
-- Name: IX_bills_PcId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_bills_PcId" ON public.bills USING btree ("PcId");


--
-- Name: IX_bills_ShiftId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_bills_ShiftId" ON public.bills USING btree ("ShiftId");


--
-- Name: IX_branches_Name; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_branches_Name" ON public.branches USING btree ("Name");


--
-- Name: IX_cash_register_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_cash_register_OperatorId" ON public.cash_register USING btree ("OperatorId");


--
-- Name: IX_cash_transactions_BillId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_cash_transactions_BillId" ON public.cash_transactions USING btree ("BillId");


--
-- Name: IX_cash_transactions_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_cash_transactions_BranchId" ON public.cash_transactions USING btree ("BranchId");


--
-- Name: IX_cash_transactions_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_cash_transactions_OperatorId" ON public.cash_transactions USING btree ("OperatorId");


--
-- Name: IX_denomination_counts_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_denomination_counts_BranchId" ON public.denomination_counts USING btree ("BranchId");


--
-- Name: IX_denomination_counts_CashRegisterId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_denomination_counts_CashRegisterId" ON public.denomination_counts USING btree ("CashRegisterId");


--
-- Name: IX_denomination_counts_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_denomination_counts_OperatorId" ON public.denomination_counts USING btree ("OperatorId");


--
-- Name: IX_denomination_counts_ShiftId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_denomination_counts_ShiftId" ON public.denomination_counts USING btree ("ShiftId");


--
-- Name: IX_discounts_AdminId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_discounts_AdminId" ON public.discounts USING btree ("AdminId");


--
-- Name: IX_discounts_BillId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_discounts_BillId" ON public.discounts USING btree ("BillId");


--
-- Name: IX_discounts_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_discounts_BranchId" ON public.discounts USING btree ("BranchId");


--
-- Name: IX_food_order_items_InventoryId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_food_order_items_InventoryId" ON public.food_order_items USING btree ("InventoryId");


--
-- Name: IX_food_orders_MemberId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_food_orders_MemberId" ON public.food_orders USING btree ("MemberId");


--
-- Name: IX_food_orders_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_food_orders_OperatorId" ON public.food_orders USING btree ("OperatorId");


--
-- Name: IX_food_orders_OrderNumber; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_food_orders_OrderNumber" ON public.food_orders USING btree ("OrderNumber");


--
-- Name: IX_food_orders_PcId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_food_orders_PcId" ON public.food_orders USING btree ("PcId");


--
-- Name: IX_inventory_logs_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_inventory_logs_BranchId" ON public.inventory_logs USING btree ("BranchId");


--
-- Name: IX_inventory_logs_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_inventory_logs_OperatorId" ON public.inventory_logs USING btree ("OperatorId");


--
-- Name: IX_loyalty_points_AdminId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_loyalty_points_AdminId" ON public.loyalty_points USING btree ("AdminId");


--
-- Name: IX_loyalty_points_BillId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_loyalty_points_BillId" ON public.loyalty_points USING btree ("BillId");


--
-- Name: IX_loyalty_points_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_loyalty_points_BranchId" ON public.loyalty_points USING btree ("BranchId");


--
-- Name: IX_loyalty_points_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_loyalty_points_OperatorId" ON public.loyalty_points USING btree ("OperatorId");


--
-- Name: IX_members_HomeBranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_members_HomeBranchId" ON public.members USING btree ("HomeBranchId");


--
-- Name: IX_members_MemberNumber; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_members_MemberNumber" ON public.members USING btree ("MemberNumber");


--
-- Name: IX_members_Username; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_members_Username" ON public.members USING btree ("Username") WHERE ("Username" IS NOT NULL);


--
-- Name: IX_operators_CreatedBy; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_operators_CreatedBy" ON public.operators USING btree ("CreatedBy");


--
-- Name: IX_operators_Username; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_operators_Username" ON public.operators USING btree ("Username");


--
-- Name: IX_payments_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_payments_OperatorId" ON public.payments USING btree ("OperatorId");


--
-- Name: IX_pcs_CurrentReservationId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_pcs_CurrentReservationId" ON public.pcs USING btree ("CurrentReservationId");


--
-- Name: IX_pcs_CurrentSessionId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_pcs_CurrentSessionId" ON public.pcs USING btree ("CurrentSessionId");


--
-- Name: IX_pcs_LastOperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_pcs_LastOperatorId" ON public.pcs USING btree ("LastOperatorId");


--
-- Name: IX_pcs_PcNumber_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_pcs_PcNumber_BranchId" ON public.pcs USING btree ("PcNumber", "BranchId");


--
-- Name: IX_pcs_PricingProfileId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_pcs_PricingProfileId" ON public.pcs USING btree ("PricingProfileId");


--
-- Name: IX_reservations_MemberId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_reservations_MemberId" ON public.reservations USING btree ("MemberId");


--
-- Name: IX_reservations_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_reservations_OperatorId" ON public.reservations USING btree ("OperatorId");


--
-- Name: IX_reservations_OverrideBy; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_reservations_OverrideBy" ON public.reservations USING btree ("OverrideBy");


--
-- Name: IX_sessions_MemberId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_sessions_MemberId" ON public.sessions USING btree ("MemberId");


--
-- Name: IX_sessions_ShiftId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_sessions_ShiftId" ON public.sessions USING btree ("ShiftId");


--
-- Name: IX_system_config_ConfigKey; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_system_config_ConfigKey" ON public.system_config USING btree ("ConfigKey");


--
-- Name: IX_system_config_UpdatedBy; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_system_config_UpdatedBy" ON public.system_config USING btree ("UpdatedBy");


--
-- Name: IX_users_Email; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX "IX_users_Email" ON public.users USING btree ("Email");


--
-- Name: IX_wallet_transactions_AdminId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_wallet_transactions_AdminId" ON public.wallet_transactions USING btree ("AdminId");


--
-- Name: IX_wallet_transactions_BillId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_wallet_transactions_BillId" ON public.wallet_transactions USING btree ("BillId");


--
-- Name: IX_wallet_transactions_BranchId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_wallet_transactions_BranchId" ON public.wallet_transactions USING btree ("BranchId");


--
-- Name: IX_wallet_transactions_OperatorId; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX "IX_wallet_transactions_OperatorId" ON public.wallet_transactions USING btree ("OperatorId");


--
-- Name: idx_audit_action; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_audit_action ON public.audit_logs USING btree ("Action");


--
-- Name: idx_audit_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_audit_branch ON public.audit_logs USING btree ("BranchId");


--
-- Name: idx_audit_date; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_audit_date ON public.audit_logs USING btree ("CreatedAt");


--
-- Name: idx_audit_operator; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_audit_operator ON public.audit_logs USING btree ("OperatorId");


--
-- Name: idx_audit_target; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_audit_target ON public.audit_logs USING btree ("TargetType", "TargetId");


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_audit_user ON public.audit_logs USING btree ("UserId");


--
-- Name: idx_bill_items_bill; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_bill_items_bill ON public.bill_items USING btree ("BillId");


--
-- Name: idx_bills_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_bills_branch ON public.bills USING btree ("BranchId");


--
-- Name: idx_bills_date; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_bills_date ON public.bills USING btree ("CreatedAt");


--
-- Name: idx_bills_operator; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_bills_operator ON public.bills USING btree ("OperatorId");


--
-- Name: idx_bills_session; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_bills_session ON public.bills USING btree ("SessionId");


--
-- Name: idx_bills_status; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_bills_status ON public.bills USING btree ("Status");


--
-- Name: idx_cash_register_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_cash_register_branch ON public.cash_register USING btree ("BranchId");


--
-- Name: idx_cash_register_shift; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX idx_cash_register_shift ON public.cash_register USING btree ("ShiftId");


--
-- Name: idx_cash_txn_date; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_cash_txn_date ON public.cash_transactions USING btree ("CreatedAt");


--
-- Name: idx_cash_txn_register; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_cash_txn_register ON public.cash_transactions USING btree ("CashRegisterId");


--
-- Name: idx_food_items_order; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_food_items_order ON public.food_order_items USING btree ("OrderId");


--
-- Name: idx_food_orders_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_food_orders_branch ON public.food_orders USING btree ("BranchId");


--
-- Name: idx_food_orders_date; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_food_orders_date ON public.food_orders USING btree ("OrderTime");


--
-- Name: idx_food_orders_session; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_food_orders_session ON public.food_orders USING btree ("SessionId");


--
-- Name: idx_food_orders_status; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_food_orders_status ON public.food_orders USING btree ("Status");


--
-- Name: idx_inv_logs_date; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_inv_logs_date ON public.inventory_logs USING btree ("CreatedAt");


--
-- Name: idx_inv_logs_item; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_inv_logs_item ON public.inventory_logs USING btree ("InventoryId");


--
-- Name: idx_inventory_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_inventory_branch ON public.inventory USING btree ("BranchId");


--
-- Name: idx_inventory_category; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_inventory_category ON public.inventory USING btree ("Category");


--
-- Name: idx_inventory_status; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_inventory_status ON public.inventory USING btree ("Status");


--
-- Name: idx_loyalty_member; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_loyalty_member ON public.loyalty_points USING btree ("MemberId");


--
-- Name: idx_members_mobile; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE UNIQUE INDEX idx_members_mobile ON public.members USING btree ("MobileNumber");


--
-- Name: idx_members_status; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_members_status ON public.members USING btree ("Status");


--
-- Name: idx_operators_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_operators_branch ON public.operators USING btree ("BranchId");


--
-- Name: idx_operators_status; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_operators_status ON public.operators USING btree ("Status");


--
-- Name: idx_payments_bill; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_payments_bill ON public.payments USING btree ("BillId");


--
-- Name: idx_payments_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_payments_branch ON public.payments USING btree ("BranchId");


--
-- Name: idx_payments_date; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_payments_date ON public.payments USING btree ("CreatedAt");


--
-- Name: idx_payments_type; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_payments_type ON public.payments USING btree ("PaymentType");


--
-- Name: idx_pcs_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_pcs_branch ON public.pcs USING btree ("BranchId");


--
-- Name: idx_pcs_state; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_pcs_state ON public.pcs USING btree ("State");


--
-- Name: idx_reservations_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_reservations_branch ON public.reservations USING btree ("BranchId");


--
-- Name: idx_reservations_pc; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_reservations_pc ON public.reservations USING btree ("PcId");


--
-- Name: idx_reservations_state; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_reservations_state ON public.reservations USING btree ("State");


--
-- Name: idx_reservations_time; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_reservations_time ON public.reservations USING btree ("ReservationTime");


--
-- Name: idx_sessions_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_sessions_branch ON public.sessions USING btree ("BranchId");


--
-- Name: idx_sessions_date; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_sessions_date ON public.sessions USING btree ("StartTime");


--
-- Name: idx_sessions_operator; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_sessions_operator ON public.sessions USING btree ("OperatorId");


--
-- Name: idx_sessions_pc; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_sessions_pc ON public.sessions USING btree ("PcId");


--
-- Name: idx_sessions_state; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_sessions_state ON public.sessions USING btree ("State");


--
-- Name: idx_shifts_branch; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_shifts_branch ON public.shifts USING btree ("BranchId");


--
-- Name: idx_shifts_operator; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_shifts_operator ON public.shifts USING btree ("OperatorId");


--
-- Name: idx_shifts_status; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_shifts_status ON public.shifts USING btree ("Status");


--
-- Name: idx_wallet_txn_date; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_wallet_txn_date ON public.wallet_transactions USING btree ("CreatedAt");


--
-- Name: idx_wallet_txn_member; Type: INDEX; Schema: public; Owner: appleesports_admin
--

CREATE INDEX idx_wallet_txn_member ON public.wallet_transactions USING btree ("MemberId");


--
-- Name: EodSnapshots FK_EodSnapshots_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public."EodSnapshots"
    ADD CONSTRAINT "FK_EodSnapshots_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE CASCADE;


--
-- Name: EodSnapshots FK_EodSnapshots_operators_GeneratedByOperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public."EodSnapshots"
    ADD CONSTRAINT "FK_EodSnapshots_operators_GeneratedByOperatorId" FOREIGN KEY ("GeneratedByOperatorId") REFERENCES public.operators("Id") ON DELETE CASCADE;


--
-- Name: pcs FK_Pcs_PricingProfiles_PricingProfileId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.pcs
    ADD CONSTRAINT "FK_Pcs_PricingProfiles_PricingProfileId" FOREIGN KEY ("PricingProfileId") REFERENCES public."PricingProfiles"("Id") ON DELETE SET NULL;


--
-- Name: PricingProfiles FK_PricingProfiles_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public."PricingProfiles"
    ADD CONSTRAINT "FK_PricingProfiles_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE CASCADE;


--
-- Name: audit_logs FK_audit_logs_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_audit_logs_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE SET NULL;


--
-- Name: bill_items FK_bill_items_bills_BillId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT "FK_bill_items_bills_BillId" FOREIGN KEY ("BillId") REFERENCES public.bills("Id") ON DELETE CASCADE;


--
-- Name: bills FK_bills_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "FK_bills_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: bills FK_bills_members_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "FK_bills_members_MemberId" FOREIGN KEY ("MemberId") REFERENCES public.members("Id") ON DELETE SET NULL;


--
-- Name: bills FK_bills_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "FK_bills_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE RESTRICT;


--
-- Name: bills FK_bills_pcs_PcId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "FK_bills_pcs_PcId" FOREIGN KEY ("PcId") REFERENCES public.pcs("Id") ON DELETE SET NULL;


--
-- Name: bills FK_bills_sessions_SessionId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "FK_bills_sessions_SessionId" FOREIGN KEY ("SessionId") REFERENCES public.sessions("Id") ON DELETE SET NULL;


--
-- Name: bills FK_bills_shifts_ShiftId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "FK_bills_shifts_ShiftId" FOREIGN KEY ("ShiftId") REFERENCES public.shifts("Id") ON DELETE SET NULL;


--
-- Name: bills FK_bills_users_DiscountBy; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "FK_bills_users_DiscountBy" FOREIGN KEY ("DiscountBy") REFERENCES public.users("Id") ON DELETE SET NULL;


--
-- Name: cash_register FK_cash_register_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_register
    ADD CONSTRAINT "FK_cash_register_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: cash_register FK_cash_register_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_register
    ADD CONSTRAINT "FK_cash_register_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE RESTRICT;


--
-- Name: cash_register FK_cash_register_shifts_ShiftId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_register
    ADD CONSTRAINT "FK_cash_register_shifts_ShiftId" FOREIGN KEY ("ShiftId") REFERENCES public.shifts("Id") ON DELETE RESTRICT;


--
-- Name: cash_transactions FK_cash_transactions_bills_BillId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "FK_cash_transactions_bills_BillId" FOREIGN KEY ("BillId") REFERENCES public.bills("Id") ON DELETE SET NULL;


--
-- Name: cash_transactions FK_cash_transactions_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "FK_cash_transactions_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: cash_transactions FK_cash_transactions_cash_register_CashRegisterId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "FK_cash_transactions_cash_register_CashRegisterId" FOREIGN KEY ("CashRegisterId") REFERENCES public.cash_register("Id") ON DELETE RESTRICT;


--
-- Name: cash_transactions FK_cash_transactions_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "FK_cash_transactions_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE RESTRICT;


--
-- Name: denomination_counts FK_denomination_counts_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.denomination_counts
    ADD CONSTRAINT "FK_denomination_counts_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: denomination_counts FK_denomination_counts_cash_register_CashRegisterId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.denomination_counts
    ADD CONSTRAINT "FK_denomination_counts_cash_register_CashRegisterId" FOREIGN KEY ("CashRegisterId") REFERENCES public.cash_register("Id") ON DELETE RESTRICT;


--
-- Name: denomination_counts FK_denomination_counts_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.denomination_counts
    ADD CONSTRAINT "FK_denomination_counts_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE RESTRICT;


--
-- Name: denomination_counts FK_denomination_counts_shifts_ShiftId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.denomination_counts
    ADD CONSTRAINT "FK_denomination_counts_shifts_ShiftId" FOREIGN KEY ("ShiftId") REFERENCES public.shifts("Id") ON DELETE RESTRICT;


--
-- Name: discounts FK_discounts_bills_BillId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT "FK_discounts_bills_BillId" FOREIGN KEY ("BillId") REFERENCES public.bills("Id") ON DELETE RESTRICT;


--
-- Name: discounts FK_discounts_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT "FK_discounts_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: discounts FK_discounts_users_AdminId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT "FK_discounts_users_AdminId" FOREIGN KEY ("AdminId") REFERENCES public.users("Id") ON DELETE RESTRICT;


--
-- Name: food_order_items FK_food_order_items_food_orders_OrderId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_order_items
    ADD CONSTRAINT "FK_food_order_items_food_orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES public.food_orders("Id") ON DELETE CASCADE;


--
-- Name: food_order_items FK_food_order_items_inventory_InventoryId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_order_items
    ADD CONSTRAINT "FK_food_order_items_inventory_InventoryId" FOREIGN KEY ("InventoryId") REFERENCES public.inventory("Id") ON DELETE RESTRICT;


--
-- Name: food_orders FK_food_orders_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_orders
    ADD CONSTRAINT "FK_food_orders_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: food_orders FK_food_orders_members_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_orders
    ADD CONSTRAINT "FK_food_orders_members_MemberId" FOREIGN KEY ("MemberId") REFERENCES public.members("Id") ON DELETE SET NULL;


--
-- Name: food_orders FK_food_orders_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_orders
    ADD CONSTRAINT "FK_food_orders_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE SET NULL;


--
-- Name: food_orders FK_food_orders_pcs_PcId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_orders
    ADD CONSTRAINT "FK_food_orders_pcs_PcId" FOREIGN KEY ("PcId") REFERENCES public.pcs("Id") ON DELETE SET NULL;


--
-- Name: food_orders FK_food_orders_sessions_SessionId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.food_orders
    ADD CONSTRAINT "FK_food_orders_sessions_SessionId" FOREIGN KEY ("SessionId") REFERENCES public.sessions("Id") ON DELETE SET NULL;


--
-- Name: inventory FK_inventory_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "FK_inventory_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: inventory_logs FK_inventory_logs_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT "FK_inventory_logs_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: inventory_logs FK_inventory_logs_inventory_InventoryId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT "FK_inventory_logs_inventory_InventoryId" FOREIGN KEY ("InventoryId") REFERENCES public.inventory("Id") ON DELETE CASCADE;


--
-- Name: inventory_logs FK_inventory_logs_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT "FK_inventory_logs_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE SET NULL;


--
-- Name: loyalty_points FK_loyalty_points_bills_BillId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT "FK_loyalty_points_bills_BillId" FOREIGN KEY ("BillId") REFERENCES public.bills("Id") ON DELETE SET NULL;


--
-- Name: loyalty_points FK_loyalty_points_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT "FK_loyalty_points_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: loyalty_points FK_loyalty_points_members_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT "FK_loyalty_points_members_MemberId" FOREIGN KEY ("MemberId") REFERENCES public.members("Id") ON DELETE RESTRICT;


--
-- Name: loyalty_points FK_loyalty_points_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT "FK_loyalty_points_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE SET NULL;


--
-- Name: loyalty_points FK_loyalty_points_users_AdminId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT "FK_loyalty_points_users_AdminId" FOREIGN KEY ("AdminId") REFERENCES public.users("Id") ON DELETE SET NULL;


--
-- Name: members FK_members_branches_HomeBranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "FK_members_branches_HomeBranchId" FOREIGN KEY ("HomeBranchId") REFERENCES public.branches("Id") ON DELETE SET NULL;


--
-- Name: operators FK_operators_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT "FK_operators_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: operators FK_operators_users_CreatedBy; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT "FK_operators_users_CreatedBy" FOREIGN KEY ("CreatedBy") REFERENCES public.users("Id") ON DELETE SET NULL;


--
-- Name: payments FK_payments_bills_BillId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_payments_bills_BillId" FOREIGN KEY ("BillId") REFERENCES public.bills("Id") ON DELETE RESTRICT;


--
-- Name: payments FK_payments_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_payments_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: payments FK_payments_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_payments_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE RESTRICT;


--
-- Name: pcs FK_pcs_PricingProfiles_PricingProfileId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.pcs
    ADD CONSTRAINT "FK_pcs_PricingProfiles_PricingProfileId" FOREIGN KEY ("PricingProfileId") REFERENCES public."PricingProfiles"("Id");


--
-- Name: pcs FK_pcs_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.pcs
    ADD CONSTRAINT "FK_pcs_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE CASCADE;


--
-- Name: pcs FK_pcs_operators_LastOperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.pcs
    ADD CONSTRAINT "FK_pcs_operators_LastOperatorId" FOREIGN KEY ("LastOperatorId") REFERENCES public.operators("Id") ON DELETE SET NULL;


--
-- Name: pcs FK_pcs_reservations_CurrentReservationId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.pcs
    ADD CONSTRAINT "FK_pcs_reservations_CurrentReservationId" FOREIGN KEY ("CurrentReservationId") REFERENCES public.reservations("Id") ON DELETE SET NULL;


--
-- Name: pcs FK_pcs_sessions_CurrentSessionId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.pcs
    ADD CONSTRAINT "FK_pcs_sessions_CurrentSessionId" FOREIGN KEY ("CurrentSessionId") REFERENCES public.sessions("Id") ON DELETE SET NULL;


--
-- Name: reservations FK_reservations_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "FK_reservations_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: reservations FK_reservations_members_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "FK_reservations_members_MemberId" FOREIGN KEY ("MemberId") REFERENCES public.members("Id") ON DELETE SET NULL;


--
-- Name: reservations FK_reservations_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "FK_reservations_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE RESTRICT;


--
-- Name: reservations FK_reservations_pcs_PcId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "FK_reservations_pcs_PcId" FOREIGN KEY ("PcId") REFERENCES public.pcs("Id") ON DELETE RESTRICT;


--
-- Name: reservations FK_reservations_users_OverrideBy; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "FK_reservations_users_OverrideBy" FOREIGN KEY ("OverrideBy") REFERENCES public.users("Id") ON DELETE SET NULL;


--
-- Name: sessions FK_sessions_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_sessions_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: sessions FK_sessions_members_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_sessions_members_MemberId" FOREIGN KEY ("MemberId") REFERENCES public.members("Id") ON DELETE SET NULL;


--
-- Name: sessions FK_sessions_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_sessions_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE RESTRICT;


--
-- Name: sessions FK_sessions_pcs_PcId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_sessions_pcs_PcId" FOREIGN KEY ("PcId") REFERENCES public.pcs("Id") ON DELETE RESTRICT;


--
-- Name: sessions FK_sessions_shifts_ShiftId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_sessions_shifts_ShiftId" FOREIGN KEY ("ShiftId") REFERENCES public.shifts("Id") ON DELETE SET NULL;


--
-- Name: shifts FK_shifts_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "FK_shifts_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: shifts FK_shifts_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "FK_shifts_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE RESTRICT;


--
-- Name: system_config FK_system_config_users_UpdatedBy; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT "FK_system_config_users_UpdatedBy" FOREIGN KEY ("UpdatedBy") REFERENCES public.users("Id") ON DELETE SET NULL;


--
-- Name: wallet_transactions FK_wallet_transactions_bills_BillId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "FK_wallet_transactions_bills_BillId" FOREIGN KEY ("BillId") REFERENCES public.bills("Id") ON DELETE SET NULL;


--
-- Name: wallet_transactions FK_wallet_transactions_branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "FK_wallet_transactions_branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public.branches("Id") ON DELETE RESTRICT;


--
-- Name: wallet_transactions FK_wallet_transactions_members_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "FK_wallet_transactions_members_MemberId" FOREIGN KEY ("MemberId") REFERENCES public.members("Id") ON DELETE RESTRICT;


--
-- Name: wallet_transactions FK_wallet_transactions_operators_OperatorId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "FK_wallet_transactions_operators_OperatorId" FOREIGN KEY ("OperatorId") REFERENCES public.operators("Id") ON DELETE SET NULL;


--
-- Name: wallet_transactions FK_wallet_transactions_users_AdminId; Type: FK CONSTRAINT; Schema: public; Owner: appleesports_admin
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "FK_wallet_transactions_users_AdminId" FOREIGN KEY ("AdminId") REFERENCES public.users("Id") ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict w14UCc2ebO4EDa5ZTHnPkQSZ6pY9TSDATUItEdIQ2bQFZP4iW7bfIobAdaLHFTZ

