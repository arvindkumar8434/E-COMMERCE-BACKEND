const express = require('express');
const { Order, OrderItem, Product, sequelize } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

/**
 * Create an order:
 * body: { items: [{ productId, quantity }], address: "..." }
 * Transactionally: verify stock, create order + items, decrement stock, compute total.
 */
router.post('/', auth, async (req, res) => {
  const { items, address } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });

  const t = await sequelize.transaction();
  try {
    // lock/select products
    const productIds = items.map(i => i.productId);
    const products = await Product.findAll({ where: { id: productIds }, transaction: t, lock: t.LOCK.UPDATE });

    // map products
    const prodMap = new Map(products.map(p => [p.id, p]));
    let total = 0;
    // check stock
    for (const it of items) {
      const p = prodMap.get(it.productId);
      if (!p) throw new Error(`Product ${it.productId} not found`);
      if (p.stock < it.quantity) throw new Error(`Insufficient stock for ${p.title}`);
      total += parseFloat(p.price) * it.quantity;
    }

    // create order
    const order = await Order.create({ userId: req.user.id, total: total.toFixed(2), address }, { transaction: t });

    // create order items & decrement stock
    for (const it of items) {
      const p = prodMap.get(it.productId);
      await OrderItem.create({
        orderId: order.id, productId: p.id, quantity: it.quantity, unitPrice: p.price
      }, { transaction: t });
      await p.update({ stock: p.stock - it.quantity }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ orderId: order.id, total: order.total });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

// list user's orders
router.get('/', auth, async (req, res) => {
  const orders = await Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem, include: [Product] }], order:[['createdAt','DESC']] });
  res.json(orders);
});

// get single order (owner only)
router.get('/:id', auth, async (req, res) => {
  const ord = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, include: [Product] }] });
  if (!ord) return res.status(404).json({ error: 'Not found' });
  if (ord.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  res.json(ord);
});

module.exports = router;
