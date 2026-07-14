-- Neon PostgreSQL schema for mymultisig-app
-- Run this in the Neon SQL Editor (console.neon.tech) or via psql:
--   psql $DATABASE_URL -f src/lib/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS multisig_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  multi_sig_address TEXT NOT NULL,
  request JSONB NOT NULL,
  description TEXT NOT NULL,
  submitter TEXT NOT NULL,
  signatures JSONB NOT NULL DEFAULT '[]',
  owner_signers JSONB NOT NULL DEFAULT '[]',
  date_submitted TEXT NOT NULL,
  date_executed TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_executed BOOLEAN NOT NULL DEFAULT false,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  is_successful BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_multisig_requests_multi_sig_address_is_active
  ON multisig_requests (multi_sig_address, is_active);

CREATE INDEX IF NOT EXISTS idx_multisig_requests_id ON multisig_requests (id);

CREATE TABLE IF NOT EXISTS multisig_wallets (
  id SERIAL PRIMARY KEY,
  chain_id INTEGER NOT NULL,
  chain_name TEXT NOT NULL,
  factory_address TEXT NOT NULL,
  contract_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  address TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  owner_count INTEGER NOT NULL,
  nonce INTEGER NOT NULL DEFAULT 0,
  owners JSONB NOT NULL DEFAULT '[]',
  is_deployed BOOLEAN DEFAULT true,
  wallet_type TEXT NOT NULL DEFAULT 'simple',
  allow_only_owner_request BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent migration for databases created before wallet_type existed.
ALTER TABLE multisig_wallets ADD COLUMN IF NOT EXISTS wallet_type TEXT NOT NULL DEFAULT 'simple';
ALTER TABLE multisig_wallets ADD COLUMN IF NOT EXISTS allow_only_owner_request BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS address_book (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  address TEXT NOT NULL,
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'wallet',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One label per (owner, chain, address); upserts key on this.
CREATE UNIQUE INDEX IF NOT EXISTS idx_address_book_owner_chain_address
  ON address_book (LOWER(owner_address), chain_id, LOWER(address));

-- Deduplicate wallets saved more than once (keep the newest row), then make
-- (chain, address) unique so re-imports upsert instead of duplicating.
DELETE FROM multisig_wallets a USING multisig_wallets b
  WHERE a.id < b.id AND a.chain_id = b.chain_id AND LOWER(a.address) = LOWER(b.address);
CREATE UNIQUE INDEX IF NOT EXISTS idx_multisig_wallets_chain_address
  ON multisig_wallets (chain_id, LOWER(address));

CREATE TABLE IF NOT EXISTS saved_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  chain_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  name TEXT NOT NULL,
  abi JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_contracts_owner_chain_address
  ON saved_contracts (LOWER(owner_address), chain_id, LOWER(address));

CREATE TABLE IF NOT EXISTS factories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  chain_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_factories_owner_chain_address
  ON factories (LOWER(owner_address), chain_id, LOWER(address));
