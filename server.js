require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const PORT = process.env.PORT || 4000;
async function start() {
  await sequelize.sync({ alter: true }); // use {force:true} only in dev to reset
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}
start().catch(err => { console.error(err); process.exit(1); });
