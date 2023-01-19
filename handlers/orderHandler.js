const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
//to generate unique ids
const { v4: uuidv4 } = require("uuid");

/// create an order
const createOrder = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const { purchasedItems } = req.body;
  const user = req.params.user;
  const _id = uuidv4();

  try {
    await client.connect();
    const db = client.db("ecommerce");

    //if there are no items in purchased items array return error
    if (purchasedItems.length <= 0) {
      return res.status(400).json({
        status: 400,
        data: req.body,
        message: "Looks like your cart is empty",
      });
    }
    // if there are items in array create new order
    const date = new Date().toLocaleString();
    const order = await db
      .collection("orders")
      .insertOne({ _id, user, date, ...req.body });

    if (order.acknowledged) {
      //empty the current user's cart
      await db.collection("cart").deleteOne({ user });


      //   const items = await db.collection("items");
      // //update items collection numInStock value for each item in purchasedItems array
      // await purchasedItems.forEach(async (item) => {
      //   //update the item's numInstock
      //   const reduceBy = item.quantity * -1;
      //   const update = await items.updateOne(
      //     { _id: item._id },
      //     { $inc: { numInStock: reduceBy } }
      //   );
      //   console.log("---update---", update);

      //   if (update.modifiedCount === 1) {
      //     console.log(
      //       `Success, Inventory id ${item._id} was reduced by ${reduceBy}`
      //     );
      //   } else {
      //     console.log(`Unable to update ${item._id}`);
      //   }
      // });

      return res
        .status(200)
        .json({ status: 200, data: order, message: "new order created" });
    } else {
      return res.status(500).json({
        status: 500,
        data: req.body,
        message: "failed to create a new order",
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
//retrieves all of users order

const getOrders = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const user = req.params.user;
  try {
    await client.connect();
    const db = client.db("ecommerce");
    const orders = await db.collection("orders").find({ user }).toArray();
    //checking if there are orders in the orders array
    orders.length <= 0
      ? res.status(404).json({
          status: 404,
          data: orders,
          message: "you have no orders",
        })
      : res
          .status(200)
          .json({ status: 200, data: { orders }, message: "orders retrieved" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    client.close();
  }
};

module.exports = { createOrder, getOrders };
