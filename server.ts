import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// @ts-ignore
import PayOS from '@payos/node';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000; // Cổng 3000 là cổng duy nhất bắt buộc bởi nền tảng AI Studio

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mảng tĩnh lưu đơn hàng tạm thời trong bộ nhớ RAM
const payments: any[] = [];

// Khởi tạo payOS SDK nếu có key
let payos: any = null;
const hasKeys = process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY;

if (hasKeys) {
  try {
    payos = new (PayOS as any)(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY
    );
    console.log("✅ [Root Server] Khởi tạo thành công payOS!");
  } catch (err: any) {
    console.error("❌ [Root Server] Lỗi khởi tạo payOS:", err.message);
  }
} else {
  console.log("⚠️ [Root Server] Chưa điền API Key cho payOS. Sẽ chạy ở chế độ giả lập thanh toán (Demo simulator).");
}

/**
 * API GET /api/health
 */
app.get('/api', (req, res) => {
  res.send('Roomie AI Payment API is running');
});

/**
 * POST /api/create-payment
 */
app.post('/api/create-payment', async (req, res) => {
  try {
    const { orderCode, amount, description, roomId, customerName, phone } = req.body;

    if (!orderCode || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: orderCode, amount, description!"
      });
    }

    const newPayment = {
      orderCode: Number(orderCode),
      amount: Number(amount),
      description,
      roomId: roomId || null,
      customerName: customerName || "Nguyễn Văn A",
      phone: phone || "",
      status: 'PENDING',
      createdAt: new Date()
    };

    // Đảm bảo không trùng đơn
    const existIdx = payments.findIndex(p => p.orderCode === Number(orderCode));
    if (existIdx !== -1) {
      payments[existIdx] = newPayment;
    } else {
      payments.push(newPayment);
    }

    // Tự động xác định BASE URL lấy từ môi trường AI Studio hoặc tự cấu hình
    // AI Studio thường tự động gán API APP_URL, nếu không có thì gán mặc định localhost:3000
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    if (payos) {
      // Dọn dẹp mô tả tiếng Việt không dấu cho payOS
      const sanitizedDesc = description
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .substring(0, 20);

      const paymentData = {
        orderCode: Number(orderCode),
        amount: Number(amount),
        description: sanitizedDesc || "Dat_lich_phong",
        cancelUrl: `${appUrl}/payment-cancel.html`,
        returnUrl: `${appUrl}/payment-success.html`
      };

      console.log("[Root Server] Đang gọi payOS tạo link thanh toán:", paymentData);
      const resLink = await payos.createPaymentLink(paymentData);
      
      return res.json({
        success: true,
        checkoutUrl: resLink.checkoutUrl,
        qrCode: resLink.qrCode || "",
        orderCode: resLink.orderCode
      });
    } else {
      // Chế độ mô phỏng thanh toán
      console.log(`[Root Server - CHẾ ĐỘ GIẢ LẬP] Tạo đơn giả lập cho orderCode: ${orderCode}`);
      // Redirect trực tiếp đến trang success cùng tham số giả định orderCode
      const checkoutUrl = `${appUrl}/payment-success.html?orderCode=${orderCode}&demo=true`;
      
      // Giả lập sau 5 giây thanh toán thành công chuyển sang PAID trong RAM
      setTimeout(() => {
        const order = payments.find(p => p.orderCode === Number(orderCode));
        if (order && order.status === 'PENDING') {
          order.status = 'PAID';
          console.log(`[Root Server - CHẾ ĐỘ GIẢ LẬP] Tự động cập nhật đơn [${orderCode}] thành PAID sau 5 giây!`);
        }
      }, 5000);

      return res.json({
        success: true,
        checkoutUrl: checkoutUrl,
        qrCode: "https://payos.vn/wp-content/uploads/2023/12/demo-qr.png",
        orderCode: Number(orderCode),
        isDemo: true,
        message: "Hệ thống đang hoạt động ở chế độ giả lập thanh toán do chưa có API Keys."
      });
    }

  } catch (error: any) {
    console.error("❌ [Root Server] Lỗi tạo thanh toán:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ thanh toán payOS: " + error.message
    });
  }
});

/**
 * POST /api/payos-webhook
 */
app.post('/api/payos-webhook', async (req, res) => {
  try {
    console.log("📥 [Root Server Webhook]:", JSON.stringify(req.body, null, 2));

    if (!payos) {
      const { orderCode, success } = req.body;
      if (orderCode) {
        const order = payments.find(p => p.orderCode === Number(orderCode));
        if (order) {
          order.status = success ? 'PAID' : 'CANCELLED';
          console.log(`[Root Server WEBHOOK GIẢ LẬP] Đã đổi trạng thái đơn [${orderCode}] thành ${order.status}`);
        }
      }
      return res.status(200).json({ success: true, message: "Nhận webhook mô phỏng thành công!" });
    }

    const webhookData = payos.verifyPaymentWebhookData(req.body);
    console.log("✅ [Root Server Webhook] Xác nhận dữ liệu hợp lệ:", webhookData);

    const { orderCode, code } = webhookData;

    const order = payments.find(p => p.orderCode === Number(orderCode));
    if (order) {
      if (code === "00") {
        order.status = "PAID";
        console.log(`[Root Server Webhook] Đơn hàng [${orderCode}] -> ĐÃ THANH TOÁN`);
      } else {
        order.status = "CANCELLED";
        console.log(`[Root Server Webhook] Đơn hàng [${orderCode}] -> BỊ HỦY HOẶC LỖI`);
      }
    } else {
      payments.push({
        orderCode: Number(orderCode),
        amount: webhookData.amount,
        description: "Lưu tự động từ webhook",
        status: code === "00" ? "PAID" : "CANCELLED",
        createdAt: new Date()
      });
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error("❌ [Root Server Webhook] Lỗi xử lý:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payment-status/:orderCode
 */
app.get('/api/payment-status/:orderCode', (req, res) => {
  const orderCode = Number(req.params.orderCode);
  const order = payments.find(p => p.orderCode === orderCode);

  if (order) {
    return res.json({
      orderCode: order.orderCode,
      status: order.status,
      customerName: order.customerName,
      amount: order.amount,
      description: order.description,
      roomId: order.roomId
    });
  } else {
    return res.json({
      orderCode: orderCode,
      status: "PENDING",
      message: "Không có trong bộ nhớ tạm hiện thời, trả về mặc định PENDING"
    });
  }
});

// Phục vụ các tài nguyên giao diện Frontend tĩnh trực tiếp từ thư mục gốc
app.use('/js', express.static(path.resolve(__dirname, 'js')));
app.use('/css', express.static(path.resolve(__dirname, 'css')));
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));

// Phục vụ bất kỳ trang tĩnh .html nào khi người dùng truy cập trực tiếp
app.get('/:page.html', (req, res) => {
  const pageName = req.params.page;
  res.sendFile(path.resolve(__dirname, `${pageName}.html`));
});

// Phục vụ trang chủ index.html mặc định
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Root Hybrid server is listening on port ${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API Endpoint: http://localhost:${PORT}/api/`);
  console.log(`===============================================`);
});
