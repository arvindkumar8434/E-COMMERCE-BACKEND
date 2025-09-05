const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    email: { type: DataTypes.STRING, allowNull:false, unique:true, validate:{ isEmail: true } },
    password: { type: DataTypes.STRING, allowNull:false },
    name: { type: DataTypes.STRING },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue:false }
  }, { timestamps:true, tableName:'users' });

  User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  User.prototype.verifyPassword = function(pass) {
    return bcrypt.compare(pass, this.password);
  };

  return User;
};
