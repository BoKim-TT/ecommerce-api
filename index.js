"use strict";

const express = require("express");
const morgan = require("morgan");
const path = require("path");
const compression = require("compression");
const cors = require("cors");
require("dotenv").config();

const { batchImportCompanies, batchImportItems } = require("./batchImport");
const { getItems, getItem, getCompany } = require("./handlers/handlers");
const { itemsInStock, itemsOutOfStock } = require("./handlers/stockHandler");
const {
  itemsByCategory,
  itemByBodypart,
  itemByCompany,
} = require("./handlers/itemFilterHandlers");
const { createOrder, getOrders } = require("./handlers/orderHandlers1");
const {
  addItemToCart,
  creatingCart,
  getCart,
} = require("./handlers/cartHandlers");
const { updateQuantity } = require("./handlers/updateCartHandler");
const { deleteItem, deleteCart } = require("./handlers/deleteCartHandlers");

const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}
if (process.env.NODE_ENV === "production") {
  app.use(compression());
  app.use(express.static("client/build"));
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.use(express.static(path.join(__dirname, "/public")));
//---------------item endpoints ---------------------//
//GET all items
//returns an array if objects
app
  .get("/api/items", getItems)

  //GET a particular item based on ID
  //returns an object
  .get("/api/items/:itemId", getItem);

//GET an array of items based on the same category
app.get("/api/items/category/:category", itemsByCategory);

//GET an array of items based on the same body part
app.get("/api/items/body-part/:bodypart", itemByBodypart);

//GET an array of items based on the same company
app.get("/api/items/company/:companyId", itemByCompany);

//GET items array based on if they're in stock
app.get("/api/items-instock", itemsInStock);

//GET items array based on if they're out of stock
app.get("/api/items-out-of-stock", itemsOutOfStock);

//-------------- Company endpoints --------------------------//

//GET a company based on ID, return an object
app.get("/api/companies/:companyId", getCompany);

//---------------- Order endpoints ---------------------------//

//POST creating an order for checkout --- does not work
app.post("/api/order/:user", createOrder);

// GET for retrieving all the orders
app.get("/api/order/:user", getOrders);
//GET for retreiving an order based on the order _id

//------------------------CART endpoints ---------------------------//

//POST for creating new cart if cart does not exist and adding non repeatable items to cart
app.post("/api/cart/:user", creatingCart);

//GET for retrieveing a cart
app.get("/api/cart/:user", getCart);

//patch to update the quantity of the item
app.patch("/api/cart/:user", updateQuantity);

//delete item in cart
app.delete("/api/cart/:user", deleteItem);

// emptying users cart
app.delete("/api/empty-cart/:user", deleteCart);

// ------------------- this is our catch all endpoint -------------------//

app.get("*", (req, res) => {
  res.status(404).json({
    status: 404,
    message: "This is obviously not what you are looking for.",
  });
});

app.listen(PORT, () => console.info(`Listening on port ${PORT}`));
