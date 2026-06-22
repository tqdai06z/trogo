/**
 * Roomie AI Payment API - Backend tích hợp cổng thanh toán payOS
 * Sử dụng Express.js và @payos/node SDK
 * Thích hợp cho đồ án môn học và bài tập cuối kỳ của sinh viên.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const PayOS = require('@payos/node');

// Tải cấu hình từ các biến môi trường trong file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Cấu hình CORS để cho phép Frontend từ các nguồn khác nhau gọi API
app.use(cors({
  origin: '*', // Cho phép tất cả các nguồn truy cập trong quá trình test
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cho phép Express phân tích dữ liệu dạng JSON gửi lên trong body của request
app.use(express.json());
// Phân tích dữ liệu dạng url-encoded (form submit thông thường)
app.use(express.urlencoded({ extended: true }));

// Mảng tĩnh lưu trữ tạm thời các giao dịch thanh toán trong RAM (Demo không dùng database)
// Cấu trúc đơn hàng trong mảng:
// { orderCode, amount, description, roomId, customerName, phone, status: 'PENDING' | 'PAID' | 'CANCELLED', createdAt }
const payments = [];

// Khởi tạo đối tượng payOS SDK nếu đã cấu hình đầy đủ API Key trong .env
let payos = null;
const hasPayOSKeys = process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY;

if (hasPayOSKeys) {
  try {
    payos = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY
    );
    console.log("✅ Khởi tạo kết nối payOS SDK thành công!");
  } catch (error) {
    console.error("❌ Lỗi cấu hình payOS:", error.message);
  }
} else {
  console.log("⚠️ CẢNH BÁO: Chưa cấu hình thông số PayOS trong tệp .env! Server sẽ tự động chạy ở chế độ DEMO Giả Lập.");
}

/**
 * 1. API GET /
 * Kiểm tra trạng thái máy chủ hỗ trợ thanh toán
 */
app.get('/', (req, res) => {
  res.send('Roomie AI Payment API is running');
});

/**
 * 2. API POST /api/create-payment
 * Đăng ký tạo một link thanh toán trực tuyến từ payOS
 */
app.post('/api/create-payment', async (req, res) => {
  try {
    const { orderCode, amount, description, roomId, customerName, phone } = req.body;

    // Kiểm tra dữ liệu đầu vào tối thiểu
    if (!orderCode || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: "Lỗi: Không được bỏ trống các trường quan trọng (orderCode, amount, description)!"
      });
    }

    // Bước A: Tạo bản ghi lưu trữ trạng thái đơn hàng ban đầu là PENDING (Chờ thanh toán) vào mảng RAM
    const newPayment = {
      orderCode: Number(orderCode),
      amount: Number(amount),
      description: description,
      roomId: roomId || null,
      customerName: customerName || "Khách hàng Roomie",
      phone: phone || "",
      status: "PENDING",
      createdAt: new Date()
    };
    
    // Đảm bảo không bị trùng mã đơn hàng cũ trong bộ nhớ RAM tạm thời
    const existIndex = payments.findIndex(p => p.orderCode === Number(orderCode));
    if (existIndex !== -1) {
      payments[existIndex] = newPayment;
    } else {
      payments.push(newPayment);
    }

    // Xác định URL của Frontend (mặc định lấy từ biến môi trường hoặc cổng chạy local)
    const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';

    // Bước B: Nếu có cấu hình API Key thật, tạo liên kết thanh toán thật từ payOS
    if (payos) {
      // Lưu ý: payOS quy định description (mô tả thanh toán) tối đa 25 ký tự không dấu & ký tự đặc biệt
      // Hàm xử lý loại bỏ dấu tiếng Việt và giới hạn 20 ký tự để tránh lỗi từ payOS
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
        cancelUrl: `${frontendUrl}/payment-cancel.html`,
        returnUrl: `${frontendUrl}/payment-success.html`
      };

      console.log("Đang gọi payOS để sinh link checkout cho đơn hàng:", paymentData);
      const paymentLinkRes = await payos.createPaymentLink(paymentData);
      
      return res.json({
        success: true,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        qrCode: paymentLinkRes.qrCode || "",
        orderCode: paymentLinkRes.orderCode
      });
    } else {
      // BƯỚC PHỤ: Chế độ Giả Lập cực hay giúp Sinh Viên demo ngay lập tức 
      // khi chưa có Key thật hoặc muốn test luồng nhanh chóng trực tiếp trên điện thoại
      console.log(`[CHẾ ĐỘ GIẢ LẬP] Tạo đơn hàng thử nghiệm thành công cho đơn [${orderCode}]`);
      
      // Trả về url chuyển hướng trực tiếp đến trang success kèm tham số giả định
      const fakeCheckoutUrl = `${frontendUrl}/payment-success.html?orderCode=${orderCode}&demo=true`;
      
      // Hỗ trợ mô phỏng: Sau 6 giây tự động cập nhật đơn hàng thành PAID trong RAM
      // để khi người dùng chuyển hướng xong và gọi API kiểm tra trạng thái sẽ nhận được PAID
      setTimeout(() => {
        const order = payments.find(p => p.orderCode === Number(orderCode));
        if (order && order.status === 'PENDING') {
          order.status = 'PAID';
          console.log(`[CHẾ ĐỘ GIẢ LẬP] Tự động cập nhật đơn [${orderCode}] thành PAID sau 6 giây!`);
        }
      }, 6000);

      return res.json({
        success: true,
        checkoutUrl: fakeCheckoutUrl,
        qrCode: "https://payos.vn/wp-content/uploads/2023/12/demo-qr.png",
        orderCode: Number(orderCode),
        isDemo: true,
        message: "Chạy thử nghiệm thành công! Hệ thống đang tự kích hoạt chế độ mô phỏng thanh toán giả lập."
      });
    }

  } catch (error) {
    console.error("❌ Lỗi trong quá trình tạo thanh toán:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ thanh toán payOS: " + error.message
    });
  }
});

/**
 * 3. API POST /api/payos-webhook
 * Trực tiếp nhận tin báo trạng thái thanh toán từ payOS truyền về (Webhook)
 */
app.post('/api/payos-webhook', async (req, res) => {
  try {
    console.log("📥 Nhận Webhook từ payOS:", JSON.stringify(req.body, null, 2));

    // Thử nghiệm webhook cục bộ hoặc test webhook không cấu hình khóa bảo mật
    if (!payos) {
      const { orderCode, success } = req.body;
      if (orderCode) {
        const order = payments.find(p => p.orderCode === Number(orderCode));
        if (order) {
          order.status = success ? 'PAID' : 'CANCELLED';
          console.log(`[WEBHOOK GIẢ LẬP] Đã đổi trạng thái đơn [${orderCode}] thành ${order.status}`);
        }
      }
      return res.status(200).json({ success: true, message: "Nhận webhook giả lập thành công!" });
    }

    // THỰC TẾ: Gọi đối tượng Xác thực webhook từ phía payOS truyền sang để đảm bảo không bị giả mạo
    const webhookData = payos.verifyPaymentWebhookData(req.body);
    console.log("✅ Dữ liệu Webhook xác thực thành công:", webhookData);

    const { orderCode, code } = webhookData;

    // Tìm đơn hàng tương ứng trong RAM và tiến hành đổi trạng thái
    const order = payments.find(p => p.orderCode === Number(orderCode));
    if (order) {
      if (code === "00") { // "00" là mã thanh toán thành công của payOS
        order.status = "PAID";
        console.log(`[payOS Webhook] Cập nhật thành công đơn trọ [${orderCode}] -> ĐÃ THANH TOÁN`);
      } else {
        order.status = "CANCELLED";
        console.log(`[payOS Webhook] Đơn trọ [${orderCode}] đã bị hủy bỏ hoặc giao dịch lỗi.`);
      }
    } else {
      // Nếu chưa có đơn trọ này trong bộ nhớ (ví dụ webhook đẩy trước khi DB kịp lưu), ta tạo bản ghi mới luôn
      payments.push({
        orderCode: Number(orderCode),
        amount: webhookData.amount,
        description: "Đơn hàng tự động lưu qua Webhook payOS",
        status: code === "00" ? "PAID" : "CANCELLED",
        createdAt: new Date()
      });
    }

    // Phản hồi phản hồi hợp lệ HTTP STATUS 200 về cho hệ thống payOS hiểu để dừng gửi webhook lặp lại
    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully"
    });

  } catch (error) {
    console.error("❌ Lỗi xử lý xác minh Webhook:", error.message);
    // Để dễ kiểm tra gỡ lỗi tốt nhất, phản hồi mã lỗi 400 kèm nguyên nhân
    return res.status(400).json({
      success: false,
      message: "Webhook verify failed: " + error.message
    });
  }
});

/**
 * 4. API GET /api/payment-status/:orderCode
 * Trả về trạng thái hiện thời của đơn thanh toán
 */
app.get('/api/payment-status/:orderCode', (req, res) => {
  const orderCode = Number(req.params.orderCode);
  
  // Truy tìm đơn hàng trong mảng bộ nhớ RAM
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
    // Trường hợp không tìm thấy (do mảng RAM bị reset khi khởi động lại server hoặc test bằng mã giả)
    // Trả về trạng thái mặc định PENDING để trang success vẫn chạy và chờ mô phỏng demo tốt hơn
    return res.json({
      orderCode: orderCode,
      status: "PENDING",
      message: "Mã đơn chưa có trong bộ nhớ tạm (Có thể server vừa reset). Hiện tại trả về PENDING để hỗ trợ kiểm thử."
    });
  }
});

// Cho phép chạy Server lắng nghe trên cổng đã chỉ định
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Roomie AI Payment Server đang chạy tại:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
