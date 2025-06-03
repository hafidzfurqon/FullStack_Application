const prisma = require("../db");
const FEE_PERCENT = 0.02;
const createOrder = async (req, res) => {
  try {
    const { items, customer, paymentToken, paymentResult } = req.body;
    const userId = req.userData.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    // Validasi payment token jika diperlukan
    if (!paymentToken) {
      return res
        .status(400)
        .json({ success: false, message: "Payment token required" });
    }

    // Tentukan status berdasarkan paymentResult
    let orderStatus = "pending"; // default

    if (paymentResult) {
      if (
        paymentResult.status === "success" ||
        paymentResult.transaction_status === "settlement"
      ) {
        orderStatus = "success";
      } else if (
        paymentResult.status === "pending" ||
        paymentResult.transaction_status === "pending"
      ) {
        orderStatus = "pending";
      } else if (
        paymentResult.status === "canceled" ||
        paymentResult.transaction_status === "cancel"
      ) {
        orderStatus = "canceled";
      } else if (
        paymentResult.status === "rejected" ||
        paymentResult.transaction_status === "deny"
      ) {
        orderStatus = "rejected";
      }
    }

    const orders = [];

    // Create orders untuk setiap item
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.id} not found`,
        });
      }

      const order = await prisma.order.create({
        data: {
          userId: userId,
          productId: item.id,
          quantity: item.qty,
          totalPrice: item.price * item.qty,
          platformFee: Math.floor(item.price * item.qty * FEE_PERCENT),
          grossTotal:
            item.price * item.qty +
            Math.floor(item.price * item.qty * FEE_PERCENT),
          status: orderStatus, // SET STATUS YANG BENAR
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          product: {
            select: { id: true, name: true, price: true, image: true },
          },
        },
      });

      orders.push(order);
    }

    res.status(201).json({
      success: true,
      message: "Orders created successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create orders",
    });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userData.id;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        product: {
          select: { id: true, name: true, price: true, image: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Cegah akses jika order bukan milik user yang sedang login
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Order Detail Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order detail",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const totalOrders = await prisma.order.count({ where: whereClause });
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month stats
    const [
      totalProducts,
      totalUsers,
      currentMonthOrders,
      lastMonthOrders,
      currentMonthRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      // Total products
      prisma.product.count(),

      // Total users
      prisma.users.count(),

      // Current month orders
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: currentMonth,
          },
        },
      }),

      // Last month orders
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: lastMonth,
            lte: lastMonthEnd,
          },
        },
      }),

      // Current month revenue
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: currentMonth,
          },
        },
        _sum: {
          grossTotal: true,
        },
      }),

      // Last month revenue
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: lastMonth,
            lte: lastMonthEnd,
          },
        },
        _sum: {
          grossTotal: true,
        },
      }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const totalOrders = currentMonthOrders.length + lastMonthOrders.length;
    const totalRevenue =
      (currentMonthRevenue._sum.grossTotal || 0) +
      (lastMonthRevenue._sum.grossTotal || 0);

    const monthlyGrowth = {
      products: 0, // Products don't have historical tracking in your schema
      orders: calculateGrowth(
        currentMonthOrders.length,
        lastMonthOrders.length
      ),
      revenue: calculateGrowth(
        currentMonthRevenue._sum.grossTotal || 0,
        lastMonthRevenue._sum.grossTotal || 0
      ),
      users: 0, // Users don't have monthly tracking in your schema
    };

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalUsers,
        monthlyGrowth,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// Get revenue trend data for charts
const getRevenueTrend = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const revenueData = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [revenue, orderCount] = await Promise.all([
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            grossTotal: true,
          },
        }),
        prisma.order.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        }),
      ]);

      revenueData.push({
        month: startOfMonth.toLocaleDateString("id-ID", { month: "short" }),
        revenue: revenue._sum.grossTotal || 0,
        orders: orderCount,
      });
    }

    res.json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    console.error("Error fetching revenue trend:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue trend",
      error: error.message,
    });
  }
};

// Get top performing products
const getTopProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topProducts = await prisma.order.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        grossTotal: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          grossTotal: "desc",
        },
      },
      take: parseInt(limit),
    });

    // Get product details
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        return {
          id: product.id,
          name: product.name,
          orders: item._count.id,
          quantity: item._sum.quantity,
          revenue: item._sum.grossTotal,
        };
      })
    );

    res.json({
      success: true,
      data: productsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
      error: error.message,
    });
  }
};

// Get order status distribution (you'll need to add status field to Order model)
const getOrderStatusDistribution = async (req, res) => {
  try {
    // Ambil semua order dan group berdasarkan status
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Hitung total orders untuk menghitung persentase
    const totalOrders = statusCounts.reduce(
      (sum, item) => sum + item._count.status,
      0
    );

    // Mapping warna untuk setiap status
    const statusColors = {
      success: "#10b981", // Green - untuk completed/success orders
      pending: "#f59e0b", // Yellow - untuk pending orders
      canceled: "#ef4444", // Red - untuk cancelled orders
      rejected: "#6b7280", // Gray - untuk rejected orders
    };

    // Transform data untuk response
    const statusDistribution = statusCounts.map((item) => {
      const percentage =
        totalOrders > 0
          ? Math.round((item._count.status / totalOrders) * 100)
          : 0;

      return {
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1), // Capitalize first letter
        value: percentage,
        count: item._count.status, // Tambahkan count absolut juga
        color: statusColors[item.status] || "#6b7280", // Default gray jika status tidak dikenal
      };
    });

    // Sort berdasarkan jumlah order (descending)
    statusDistribution.sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: statusDistribution,
      totalOrders: totalOrders,
      message: "Order status distribution fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching order status distribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order status distribution",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrderDetail,
  getAllOrders,
  getDashboardStats,
  getRevenueTrend,
  getTopProducts,
  getOrderStatusDistribution,
};
