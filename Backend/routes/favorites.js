const express = require('express');
const router = express.Router();
const { favorites } = require('../db/database');

/**
 * GET /api/favorites
 */
router.get('/favorites', (req, res) => {
  try {
    const rows = favorites.getAll();
    // Shape rows to match the original API contract
    const result = rows.map((row) => ({
      _id: row.id,
      from: row.from_currency,
      to: row.to_currency,
      createdAt: new Date(row.created_at * 1000).toISOString(),
    }));
    res.json(result);
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
});

/**
 * POST /api/favorites
 * Body: { from, to }
 */
router.post('/favorites', (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: 'Missing required fields: from, to' });
    }

    const fromUpper = from.toUpperCase();
    const toUpper   = to.toUpperCase();

    if (fromUpper === toUpper) {
      return res.status(400).json({ error: 'From and To currencies must be different' });
    }

    const row = favorites.create(fromUpper, toUpper);
    res.status(201).json({
      _id: row.id,
      from: row.from_currency,
      to: row.to_currency,
      createdAt: new Date(row.created_at * 1000).toISOString(),
    });
  } catch (err) {
    if (err.code === 'DUPLICATE') {
      return res.status(409).json({ error: err.message });
    }
    console.error('Add favorite error:', err);
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

/**
 * DELETE /api/favorites/:id
 */
router.delete('/favorites/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid favorite ID' });
    }

    const deleted = favorites.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed', id });
  } catch (err) {
    console.error('Delete favorite error:', err);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

module.exports = router;
