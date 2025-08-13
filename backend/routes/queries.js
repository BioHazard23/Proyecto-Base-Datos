const express = require('express');
const router = express.Router();
const pool = require('../db');


router.get('/total-paid-per-customer', async (req, res) => {
  const sql = `
    SELECT c.customer_id, c.first_name || ' ' || c.last_name AS customer_name,
           COALESCE(SUM(t.amount),0) AS total_paid
    FROM customers c
    LEFT JOIN invoices i ON c.customer_id = i.customer_id
    LEFT JOIN transactions t ON i.invoice_id = t.invoice_id
    GROUP BY c.customer_id, customer_name
    ORDER BY total_paid DESC;
  `;
  try {
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});


router.get('/pending-invoices', async (req, res) => {
  const sql = `
    SELECT i.invoice_id, i.invoice_number, c.customer_id, c.first_name || ' ' || c.last_name AS customer_name,
           i.total_amount, COALESCE(paid.paid_amount,0) AS paid_amount,
           i.total_amount - COALESCE(paid.paid_amount,0) AS outstanding_amount
    FROM invoices i
    JOIN customers c ON i.customer_id = c.customer_id
    LEFT JOIN (
      SELECT invoice_id, SUM(amount) AS paid_amount
      FROM transactions
      GROUP BY invoice_id
    ) paid ON i.invoice_id = paid.invoice_id
    WHERE COALESCE(paid.paid_amount,0) < i.total_amount;
  `;
  try {
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});


router.get('/transactions-by-platform', async (req, res) => {
  const platform = req.query.platform;
  if (!platform) return res.status(400).json({ error: 'platform query param required' });
  const sql = `
    SELECT p.platform_name, t.transaction_id, t.transaction_reference, t.amount, t.transaction_date,
           c.customer_id, c.first_name || ' ' || c.last_name AS customer_name,
           i.invoice_id, i.invoice_number
    FROM transactions t
    JOIN platforms p ON t.platform_id = p.platform_id
    LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
    LEFT JOIN customers c ON i.customer_id = c.customer_id
    WHERE p.platform_name = $1
    ORDER BY t.transaction_date DESC;
  `;
  try {
    const result = await pool.query(sql, [platform]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
