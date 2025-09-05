module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    status: { type: DataTypes.STRING, allowNull:false, defaultValue:'pending' }, // pending, paid, shipped, cancelled
    total: { type: DataTypes.DECIMAL(10,2), allowNull:false, defaultValue:0.00 },
    address: { type: DataTypes.TEXT, allowNull:true }
  }, { timestamps:true, tableName:'orders' });
};
