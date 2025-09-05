module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    title: { type: DataTypes.STRING, allowNull:false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10,2), allowNull:false },
    stock: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
    sku: { type: DataTypes.STRING, unique:true, allowNull:true }
  }, { timestamps:true, tableName:'products' });
};
