-- File: pd_juanmanuel_arangoarana_vanrossum.sql

CREATE DATABASE pd_juanmanuel_arangoarana_vanrossum;
\c pd_juanmanuel_arangoarana_vanrossum;

-- enable extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identification BIGINT NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(100)
);


-- 2. Invoices table
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) NOT NULL UNIQUE,
    billing_period DATE NOT NULL,
    amount_billed NUMERIC(12,2) NOT NULL,
    customer_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

-- 3. Transactions table
CREATE TABLE transactions (
    transaction_id VARCHAR(20) PRIMARY KEY,
    transaction_datetime TIMESTAMP NOT NULL,
    transaction_amount NUMERIC(12,2) NOT NULL,
    transaction_status VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount_paid NUMERIC(12,2) NOT NULL,
    platform_id INT NOT NULL,
    invoice_id INT NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices (invoice_id)
);

alter table public.invoices 
alter column billing_period type text

CREATE INDEX idx_transactions_invoice_id ON transactions(invoice_id);
CREATE INDEX idx_transactions_platform_id ON transactions(platform_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);


















