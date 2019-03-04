"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  router.get("/products", (req, res) => {
    knex
      .select("*")
      .from("products")
      .then((results) => {
        res.json(results);
    });
  });

  router.get("/orders/:id", (req, res) => {
    knex.from('products')
    .innerJoin('product_orders', 'product_orders.product_id', 'products.id')
    .innerJoin('orders', 'orders.id', 'product_orders.order_id')
    .select("product_orders.quantity", "products.price", "products.name", "products.img", "description")
    .where('orders.id', req.params.id)
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.error("error getting order products");
    });
  });

  return router;
}
