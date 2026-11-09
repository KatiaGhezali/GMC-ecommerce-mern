const mongoose = require("mongoose");
const crypto = require("crypto");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Create an order from the current user's cart
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { shippingAddress, paymentSuccess = true } = req.body;

    const requiredFields = [
      "fullName",
      "address",
      "city",
      "postalCode",
      "country",
      "phone",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) =>
          !shippingAddress[field] || !String(shippingAddress[field]).trim(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete shipping address",
      });
    }

    if (typeof paymentSuccess !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment result",
      });
    }

    let createdOrder;

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({
        user: req.user._id,
      }).session(session);

      if (!cart || cart.items.length === 0) {
        const error = new Error("Your cart is empty");
        error.statusCode = 400;
        throw error;
      }

      const orderItems = [];
      let subtotal = 0;

      // Validate every product and reserve its stock.
      for (const cartItem of cart.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: cartItem.product,
            stock: { $gte: cartItem.quantity },
          },
          {
            $inc: { stock: -cartItem.quantity },
          },
          {
            new: true,
            session,
          },
        );

        if (!product) {
          const error = new Error(
            "One or more products are unavailable or have insufficient stock",
          );
          error.statusCode = 400;
          throw error;
        }

        orderItems.push({
          product: product._id,
          title: product.title,
          thumbnail: product.thumbnail,
          quantity: cartItem.quantity,
          price: product.price,
        });

        subtotal += product.price * cartItem.quantity;
      }

      const shippingCost = subtotal >= 100 ? 0 : 10;
      const total = subtotal + shippingCost;

      const [order] = await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: "simulated",
            paymentStatus: "pending",
            subtotal,
            shippingCost,
            total,
          },
        ],
        { session },
      );

      if (paymentSuccess) {
        order.paymentStatus = "paid";
        order.orderStatus = "processing";
        order.paymentResult = {
          transactionId: `SIM-${crypto.randomUUID()}`,
          paidAt: new Date(),
        };
      } else {
        const error = new Error("Simulated payment failed");
        error.statusCode = 402;
        throw error;
      }

      await order.save({ session });

      await Cart.updateOne(
        { user: req.user._id },
        { $set: { items: [] } },
        { session },
      );

      createdOrder = order;
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  } finally {
    await session.endSession();
  }
};

// Get the current user's orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get one order belonging to the current user
const getMyOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    next(error);
  }
};

// Admin: get all orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: update an order's status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = ["processing", "shipped", "delivered", "cancelled"];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "A cancelled order cannot be updated",
      });
    }

    if (orderStatus === "cancelled" && order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Paid orders require a refund process before cancellation",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  updateOrderStatus,
};
