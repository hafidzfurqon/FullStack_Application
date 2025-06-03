const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderDetail,
  getAllOrders,
  getDashboardStats,
  getRevenueTrend,
  getTopProducts,
  getOrderStatusDistribution,
} = require("./OrderService");

router.post("/", createOrder);
router.get("/:orderId", getOrderDetail);
router.get("/", getAllOrders);
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/revenue-trend", getRevenueTrend);
router.get("/dashboard/top-products", getTopProducts);
router.get("/dashboard/order-status", getOrderStatusDistribution);

module.exports = router;
