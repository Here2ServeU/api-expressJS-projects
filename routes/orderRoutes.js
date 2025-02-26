const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product || product.stock < quantity) {
        return res.status(400).json({ message: "Not enough stock" });
    }

    const totalPrice = product.price * quantity;
    const newOrder = new Order({ userId: req.user.id, productId, quantity, totalPrice });

    product.stock -= quantity;
    await product.save();
    await newOrder.save();

    res.status(201).json({ message: "Order placed successfully" });
});

module.exports = router;
