const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql',
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à MySQL réussie.');
  } catch (error) {
    console.error('Erreur de connexion à MySQL :', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };