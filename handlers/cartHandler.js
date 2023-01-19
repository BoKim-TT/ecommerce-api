const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// use this package to generate unique ids: https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");

//adding item to cart or creating cart if no cart exist

const creatingCart = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  const user = req.params.user;
  //create random id
  const _id = uuidv4();

  try {
    await client.connect();
    const db = client.db("ecommerce");
    // finding a cart based on user
    let usersCart = await db.collection("cart").findOne({ user });

    //if cart does not exist for user
    if (!usersCart) {
      //no cart exist for user, must create new cart
      //inserting a new item into cart
      cart = await db.collection("cart").insertOne({
        _id,
        user,
        purchasedItems: [req.body],
      });

      return res
        .status(200)
        .json({ status: 200, data: cart, message: "new cart created" });
    }
    //if cart exists
    else {
      //find users cart
      const cartArr = await db.collection("cart").find({ user }).toArray();

      const cart = cartArr[0];
      //check if item is in users array
      const item = cart.purchasedItems.filter(
        (item) => item._id === req.body._id
      );
      //if the item is in the cart
      if (item.length > 0) {
        const purchase = item[0];
        //update the quantity of the item
        const updateQuantity = await db.collection("cart").updateOne(
          { user, "purchasedItems._id": req.body._id },
          {
            $set: {
              "purchasedItems.$.quantity":
                Number(req.body.quantity) + purchase.quantity,
            },
          }
        );
        return res.status(200).json({
          status: 200,
          data: updateQuantity,
          message: "item quantity updated",
        });
      }
      // if item is not in cart it will add it to purchasedItems
      const data = await db.collection("cart").updateOne(
        {
          user,
        },
        { $push: { purchasedItems: req.body } }
      );

      return res
        .status(200)
        .json({ status: 200, data: data, message: "new item added" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    client.close();
  }
};

//retrieving a cart

const getCart = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const user = req.params.user;
  try {
    await client.connect();
    const db = client.db("ecommerce");
    //finding the cart based on the user
    const cart = await db.collection("cart").findOne({ user });
    //if there is a cart it will return status: 200 if no cart status: 404
    if (cart) {
      return res
        .status(200)
        .json({ status: 200, data: cart, message: "cart retreieved" });
    } else {
      return res
        .status(404)
        .json({ status: 404, data: cart, message: "cart not found" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, data: req.body, message: err.message });
  } finally {
    client.close();
  }
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




module.exports = { creatingCart, getCart,deleteItem, deleteCart, updateQuantity };
