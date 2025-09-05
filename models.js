const { Sequelize, DataTypes } = require('sequelize');
const url = process.env.DATABASE_URL;
const dialect = process.env.DB_DIALECT || 'postgres';
const sequelize = new Sequelize(url, { dialect, logging: false });

const User = require('./user')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);
const OrderItem = require('./orderItem')(sequelize, DataTypes);

// relationships
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = { sequelize, Sequelize, User, Product, Order, OrderItem };
