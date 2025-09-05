const express = require('express');
const { Product } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// list with pagination & simple filters
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page||'1'));
  const limit = Math.min(100, parseInt(req.query.limit||'20'));
  const offset = (page-1)*limit;
  const where = {};
  if (req.query.q) where.title = { [require('sequelize').Op.iLike || require('sequelize').Op.like ]: `%${req.query.q}%` }; // works for both
  const { count, rows } = await Product.findAndCountAll({ where, limit, offset, order:[['createdAt','DESC']] });
  res.json({ total: count, page, perPage: limit, products: rows });
});

// get single product
router.get('/:id', async (req, res) => {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// create product (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  const { title, description, price, stock, sku } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'title & price required' });
  const p = await Product.create({ title, description, price, stock: stock||0, sku });
  res.status(201).json(p);
});

// update product (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await p.update(req.body);
  res.json(p);
});

// delete product (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await p.destroy();
  res.json({ ok:true });
});

module.exports = router;
