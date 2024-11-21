const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create Collection
router.post('/', async (req, res) => {
    const { user_id, name, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO collections (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [user_id, name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Recommendation to Collection
router.post('/:id/recommendations', async (req, res) => {
    const { id } = req.params;
    const { recommendation_id } = req.body;
    try {
        const collection = await pool.query('SELECT * FROM collections WHERE id = $1', [id]);
        if (collection.rowCount === 0) return res.status(404).json({ error: 'Collection not found' });

        const result = await pool.query(
            'INSERT INTO collection_recommendations (collection_id, recommendation_id) VALUES ($1, $2) RETURNING *',
            [id, recommendation_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove Recommendation from Collection
router.delete('/:id/recommendations/:recommendationId', async (req, res) => {
    const { id, recommendationId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM collection_recommendations WHERE collection_id = $1 AND recommendation_id = $2 RETURNING *',
            [id, recommendationId]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Recommendation not found in collection' });

        res.status(200).json({ message: 'Recommendation removed from collection' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View Recommendations of a Collection
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT c.name AS collection_name, c.description, r.*
             FROM collections c
             JOIN collection_recommendations cr ON c.id = cr.collection_id
             JOIN recommendations r ON cr.recommendation_id = r.id
             WHERE c.id = $1`,
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Collection not found or empty' });

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Collection
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM collections WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Collection not found' });

        res.status(200).json({ message: 'Collection deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
