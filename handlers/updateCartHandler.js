const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
//updating the quantity of the item

const updateQuantity = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const { itemId, quantity } = req.body;
  const user = req.params.user;
  try {
    await client.connect();
    const db = await client.db("ecommerce");

    //creating a variable containing the item details
    let itemDetails = await db.collection("items").findOne({ _id: itemId });

    //if itemDetails is falsy return an error that item does not exist in items collection
    if (!itemDetails) {
      return res
        .status(404)
        .json({ status: 404, data: itemDetails, message: "item not found" });
    }

    //creating cart based on user
    const cart = await db.collection("cart").findOne({ user });

    //filter checking to see if item exist in purchasedItems array
    const foundItemArr = cart.purchasedItems.filter(
      (item) => item._id === itemId
    );

    //turns found item into object
    const foundItem = foundItemArr[0];

    //if item exists
    if (foundItem) {
      const update = await db
        .collection("cart")
        .updateOne(
          { user, "purchasedItems._id": itemId },
          { $set: { "purchasedItems.$.quantity": quantity } }
        );
      return res
        .status(200)
        .json({ status: 200, data: update, message: "quantity updated" });
    }
    //if item does not exist
    else {
      return res.status(400).json({
        type: "Invalid",
        msg: "item does not exist in cart",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    client.close();
  }
};

module.exports = { updateQuantity };
