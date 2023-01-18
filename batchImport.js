// import to mongodb
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;

const companies = require("./data/companies.json");
const items = require("./data/items.json");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const batchImportCompanies = async () => {
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("ecommerce");
    await db.collection("companies").insertMany(companies);
    console.log("companies added");
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
};



const batchImportItems = async () => {
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("ecommerce");
    await db.collection("items").insertMany(items);
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
};



module.exports = { batchImportCompanies, batchImportItems };