const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// filtering items if theyre in stock
const itemsInStock = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("ecommerce");
    const itemsInStock = await db
      .collection("items")
      .find({ numInStock: { $gt: 0 } })
      .toArray();
    //checking if category contains items if so status 200 if not status 404

    itemsInStock.length > 0
      ? res.status(200).json({
          status: 200,
          data: itemsInStock,
          message: `items filtered are in stock `,
        })
      : res.status(404).json({
          status: 404,
          data: itemsInStock,
          message: `Could not find items`,
        });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    await client.close();
  }
};

//filtering based on if they're out of stock
const itemsOutOfStock = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("ecommerce");
    const items = await db
      .collection("items")
      .find({ numInStock: 0 })
      .toArray();
    //checking if category contains items if so status 200 if not status 404

    itemsInStock.length > 0
      ? res.status(200).json({
          status: 200,
          data: items,
          message: `items filtered are out of stock `,
        })
      : res.status(404).json({
          status: 404,
          data: itemsInStock,
          message: `Could not find items`,
        });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    await client.close();
  }
};

module.exports = { itemsInStock, itemsOutOfStock };
