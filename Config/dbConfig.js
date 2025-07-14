const { Sequelize } = require("sequelize");
const dontenv = require("dotenv");

console.log(process.env.NODE_ENV);
const sequelize = new Sequelize(process.env.DATABASE, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to SQL Server via Sequelize");
    await sequelize.sync({ force: false }); // Synchronize models with the database and apply changes
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
