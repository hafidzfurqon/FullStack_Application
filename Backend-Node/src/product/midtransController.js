const midtransClient = require("midtrans-client");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const handlePayment = async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    // Hitung subtotal produk
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.qty,
      0
    );

    // Hitung platform fee (2%)
    const platformFee = Math.floor(subtotal * 0.02);

    // Hitung total akhir
    const grossAmount = subtotal + platformFee;

    const orderId = `ORDER-${Date.now()}`;

    // Tambahkan detail item + platform fee sebagai item tambahan
    const itemDetails = [
      ...items.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        quantity: item.qty,
        price: item.price,
      })),
      // code ini saya buat untuk platform fee
      {
        id: "PLATFORM_FEE",
        name: "Platform Fee",
        quantity: 1,
        price: platformFee,
      },
    ];

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/orders/success`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    res.status(200).json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans Snap Error:", error.message);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
};

module.exports = { handlePayment };
