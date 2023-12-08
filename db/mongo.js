// mongo.js
const { MongoClient } = require("mongodb");

let db;

const connectDB = async () => {
  const client = new MongoClient(process.env.DB_URL);
  await client.connect();
  db = client.db("users");
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
};

module.exports = { connectDB, getDB };
