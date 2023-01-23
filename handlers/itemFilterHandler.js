const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// filtering items base on category
const itemsByCategory = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const category = req.params.category;

  try {
    await client.connect();
    const db = client.db("ecommerce");
    const items = await db
      .collection("items")
      .find({
        $and: [
          { category: category },
          {
            numInStock: { $gt: 1 },
          },
        ],
      })
      .limit(20)
      .toArray();
    //checking if category contains items if so status 200 if not status 404
    items.length > 0
      ? res.status(200).json({
          status: 200,
          data: items,
          message: `items filtered by ${category} `,
        })
      : res.status(404).json({
          status: 404,
          data: items,
          message: `Could not find items by category: ${category}`,
        });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    await client.close();
  }
};

// filtering items based on body-part

const itemByBodypart = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const body_location = req.params.bodypart;
  try {
    await client.connect();
    const db = client.db("ecommerce");
    const items = await db
      .collection("items")
      .find({ body_location })
      .toArray();
    //checking if category contains items if so status 200 if not status 404
    items.length > 0
      ? res.status(200).json({
          status: 200,
          data: items,
          message: `items filtered by ${body_location} `,
        })
      : res.status(404).json({
          status: 404,
          data: items,
          message: `Could not find items by body part: ${body_location}`,
        });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    await client.close();
  }
};

//filtering item based on their company
const itemByCompany = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const companyId = Number(req.params.companyId);
  try {
    await client.connect();
    const db = client.db("ecommerce");
    const items = await db.collection("items").find({ companyId }).toArray();
    //checking if category contains items if so status 200 if not status 404
    items.length > 0
      ? res.status(200).json({
          status: 200,
          data: items,
          message: `items filtered by company ${companyId} `,
        })
      : res.status(404).json({
          status: 404,
          data: items,
          message: `Could not find items by company: ${companyId}`,
        });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    await client.close();
  }
};

module.exports = { itemsByCategory, itemByBodypart, itemByCompany };
