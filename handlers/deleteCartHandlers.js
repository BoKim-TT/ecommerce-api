const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//deletes an item from the cart

const deleteItem = async (req, res) => {
  const user = req.params.user;
  const itemId = req.body._id;

  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("ecommerce");
    //finding cart of specific user
    const usersCart = await db.collection("cart").findOne({ user });

    //if there is no usersCart return error
    if (!usersCart) {
      return res.status(404).json({
        status: 404,
        data: usersCart,
        message: "Could not find users cart",
      });
    }
    //if usersCart is true
    else {
      //remove the item from purchasedItems
      //update based on user's cart and pull item based on item out of purchasedItems
      const removeItem = await db
        .collection("cart")
        .updateOne({ user }, { $pull: { purchasedItems: { _id: itemId } } });

      //find cart based on user and check if purchasedItems.length === 0 if true delete the cart
      const cart = await db.collection("cart").findOne({ user });
      if (cart.purchasedItems.length === 0) {
        const removeCart = await db.collection("cart").deleteOne({ user });
        return res
          .status(200)
          .json({ status: 200, data: removeCart, message: "cart removed" });
      }

      return res.status(200).json({
        status: 200,
        data: removeItem,
        message: "item deleted from cart",
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

// delete the whole cart based on user
const deleteCart = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const user = req.params.user;
  try {
    await client.connect();
    const db = client.db("ecommerce");
    const removed = await db.collection("cart").deleteOne({ user });
    return res.status(200).json({
      status: 200,
      data: removed,
      message: "users cart has been deleted",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    client.close();
  }
};

module.exports = { deleteItem, deleteCart };
