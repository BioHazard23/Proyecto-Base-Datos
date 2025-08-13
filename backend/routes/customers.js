const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const csv = require('csv-parser');

// Create
router.post('/', authenticateToken,
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  body('email').isEmail().optional({nullable: true}),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { first_name, last_name, email, phone, document_number } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO customers (first_name,last_name,email,phone,document_number) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [first_name, last_name, email, phone, document_number]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

// Read all
router.get('/', async (req, res) => {
  // Pagination and filtering
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);
  const offset = (page - 1) * pageSize;
  const search = req.query.search || '';
  try {
    const result = await pool.query(
      "SELECT * FROM customers WHERE (first_name || ' ' || last_name ILIKE $1 OR email ILIKE $1) ORDER BY customer_id LIMIT $2 OFFSET $3",
      ['%'+search+'%', pageSize, offset]
    );
    const countRes = await pool.query("SELECT COUNT(*) FROM customers WHERE (first_name || ' ' || last_name ILIKE $1 OR email ILIKE $1)", ['%'+search+'%']);
    res.json({ data: result.rows, total: parseInt(countRes.rows[0].count), page, pageSize });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY customer_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  };

// Read one
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE customer_id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Update
router.put('/:id', authenticateToken,
  body('first_name').optional().notEmpty(),
  body('last_name').optional().notEmpty(),
  body('email').optional().isEmail(),
  async (req, res) => {
    const fields = ['first_name','last_name','email','phone','document_number'];
    const updates = [];
    const values = [];
    let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        values.push(req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    const sql = `UPDATE customers SET ${updates.join(', ')} WHERE customer_id = $${idx} RETURNING *`;
    try {
      const result = await pool.query(sql, values);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'DB error' });
    }
  });

// Delete
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE customer_id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', customer: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// upload CSV to import customers
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const row of results) {
          // Expecting headers: first_name,last_name,email,phone,document_number
          await pool.query(
            `INSERT INTO customers (first_name,last_name,email,phone,document_number) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
            [row.first_name,row.last_name,row.email,row.phone,row.document_number]
          );
        }
        fs.unlinkSync(req.file.path);
        res.json({ inserted: results.length });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Import error' });
      }
    });
});

module.exports = router;
