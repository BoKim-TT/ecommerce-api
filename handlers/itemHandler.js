const { MongoClient } = require('mongodb');

require('dotenv').config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//retrieve all the items
const getItems = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db('ecommerce');
    const results = await db
      .collection('items')
      .find({
        numInStock: { $gt: 1 },
      })
      .limit(16)
      .toArray();

    results.length <= 0
      ? res
          .status(404)
          .json({ status: 404, data: results, message: 'No items found' })
      : res
          .status(200)
          .json({ status: 200, data: { results }, message: 'items retrieved' });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    await client.close();
  }
};

//retrieve a singular item based on their Id

const getItem = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  //changing the req.params to a number
  const _id = Number(req.params.itemId);
  try {
    await client.connect();
    const db = client.db('ecommerce');
    //using the number _id to filter for single item
    const item = await db.collection('items').findOne({ _id });
    //if item was found by id status 200 if not status 404
    //return item as a object
    item
      ? res
          .status(200)
          .json({ status: 200, data: item, message: 'item receievd' })
      : res
          .status(404)
          .json({ status: 404, data: item, messsage: 'item not found' });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    await client.close();
  }
};

//GET company based on their id
const getCompany = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  //changing the req.params to a number
  const _id = Number(req.params.companyId);
  try {
    await client.connect();
    const db = client.db('ecommerce');
    //using the number _id to filter for single company
    const company = await db.collection('companies').findOne({ _id });
    //if company was found by id status 200 if not status 404
    //return company as a object
    company
      ? res
          .status(200)
          .json({ status: 200, data: company, message: 'company received' })
      : res
          .status(404)
          .json({ status: 404, data: company, messsage: 'company not found' });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    await client.close();
  }
};

module.exports = { getItems, getItem, getCompany };
