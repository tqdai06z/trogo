/**
 * File: js/payment.js
 * Chức năng: Xử lý giao tiếp với Backend Node.js để khởi tạo link thanh toán qua payOS
 * Thích hợp cho đồ án môn học Roomie AI
 */

/**
 * Tạo yêu cầu thanh toán giữ chỗ qua payOS
 * @param {Object} room - Thông tin phòng trọ đang được đặt
 * @param {Object} bookingInfo - Thông tin đăng ký lịch xem phòng của quý khách
 */
async function createPayOSPayment(room, bookingInfo) {
  try {
    // =========================================================================
    // 💡 HƯỚNG DẪN CHO SINH VIÊN:
    // Mặc định "window.location.origin" sẽ tự nhận diện domain hiện tại (AI Studio / localhost).
    // Khi bạn đã deploy thành công backend lên Render, hãy đổi giá trị này thành URL Render của bạn.
    // Ví dụ: const BACKEND_URL = "https://roomie-ai-payment-api.onrender.com";
    // =========================================================================
    const BACKEND_URL = "http://localhost:10000";

    // Đảm bảo mã đơn hàng (orderCode) là số nguyên dương ngẫu nhiên (payOS đòi hỏi orderCode kiểu Number và duy nhất)
    const orderCode = Math.floor(100000 + Math.random() * 900000); 

    // Số tiền cọc giữ chỗ cố định cho buổi hẹn (50,000 VND theo yêu cầu)
    const amount = 50000;

    // Tạo chuỗi mô tả không dấu ngắn dưới 25 ký tự theo quy chuẩn của payOS
    const description = `Coc khao sat phong ${room ? room.id : '1'}`.substring(0, 24);

    console.log(`[PayOS] Bắt đầu gọi API tạo cổng thanh toán cho Đơn hàng #${orderCode}`);

    // Dữ liệu đóng gói gửi lên máy chủ
    const bodyData = {
      orderCode: orderCode,
      amount: amount,
      description: description,
      roomId: room ? room.id : 1,
      customerName: bookingInfo.name || "Khách Roomie",
      phone: bookingInfo.phone || ""
    };

    // Tạo hiệu ứng chờ Loading trên nút bấm của giao diện
    const btnSubmit = document.querySelector(".btn-primary-action") || document.querySelector("button[type='submit']");
    let originalBtnText = "";
    if (btnSubmit) {
      originalBtnText = btnSubmit.innerHTML;
      btnSubmit.innerHTML = `<span>Đang khởi tạo thanh toán... ⏳</span>`;
      btnSubmit.disabled = true;
    }

    // Thực hiện hàm gọi bất tuần tự POST tới backend API
    const response = await fetch(`${BACKEND_URL}/api/create-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    const result = await response.json();

    // Khôi phục nút bấm sau khi nhận phản hồi
    if (btnSubmit) {
      btnSubmit.innerHTML = originalBtnText;
      btnSubmit.disabled = false;
    }

    if (result.success && result.checkoutUrl) {
      // 1. Lưu giữ mã đơn hàng (orderCode) vào localStorage để sau khi thanh toán xong
      // trang payment-success.html có thể truy vấn lại trạng thái.
      localStorage.setItem("roomie_current_order_code", orderCode.toString());
      
      // 2. Lưu trạng thái đơn cọc hẹn phòng vào lịch sử cuộc hẹn của tài khoản người dùng
      saveAppointmentHistory(orderCode, room, bookingInfo);

      console.log("-> Tạo link thành công! Chuyển hướng người dùng tới payOS:", result.checkoutUrl);
      
      // 3. Tiến hành mở cổng thanh toán payOS trên trang hiện tại
      window.location.href = result.checkoutUrl;
    } else {
      alert("❌ Đầu ra API lỗi: " + (result.message || "Không thể tạo được link thanh toán từ payOS."));
    }

  } catch (error) {
    console.error("❌ Lỗi kết nối API thanh toán backend:", error);
    alert("❌ Không thể kết nối tới Backend Render API. Vui lòng kiểm tra lại cấu hình CORS hoặc chế độ khởi động lạnh (Cold Start) của Render!");
  }
}

/**
 * Hàm phụ: Lưu tạm lịch đặt khám phòng vào localStorage đồng bộ với hệ thống cũ của Roomie AI
 */
function saveAppointmentHistory(orderCode, room, bookingInfo) {
  try {
    const appointments = JSON.parse(localStorage.getItem("roomie_appointments") || "[]");
    
    // Tạo cấu trúc một cuộc hẹn xem phòng có liên đới hóa đơn cọc giữ chỗ
    const newAppointment = {
      id: "APPT" + Math.floor(1000 + Math.random() * 9000),
      orderCode: Number(orderCode),
      roomId: room ? room.id : 1,
      roomTitle: room ? room.title : "Phòng trọ dịch vụ cao cấp",
      roomPrice: room ? room.price : "3.500.000",
      customerName: bookingInfo.name,
      customerPhone: bookingInfo.phone,
      bookingDate: bookingInfo.date,
      bookingTime: bookingInfo.time,
      notes: bookingInfo.notes || "",
      paymentStatus: "PENDING", // Ban đầu là chờ thanh toán
      amountPaid: 50000,
      createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    localStorage.setItem("roomie_appointments", JSON.stringify(appointments));
    console.log("💾 Đã ghi nhận cuộc hẹn mới vào localStorage:", newAppointment);
  } catch (e) {
    console.error("Lỗi khi đồng bộ lịch sử cọc hẹn phòng:", e);
  }
}
