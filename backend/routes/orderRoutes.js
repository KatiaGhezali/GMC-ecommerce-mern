const express = require("express");

const {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Customer routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllOrders);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateOrderStatus,
);

module.exports = router;
