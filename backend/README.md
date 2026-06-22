# 🚀 Roomie AI Payment Backend - Hướng dẫn Deploy Render & Cấu hình payOS

Tài liệu này hướng dẫn chi tiết từng bước cho Sinh Viên để triển khai máy chủ thanh toán Node.js (Express) lên nền tảng đám mây **Render** hoàn toàn miễn phí, cùng cách cấu hình tích hợp cổng thanh toán **payOS**.

---

## 📁 Cấu trúc thư mục Backend
```text
backend/
├── package.json      # Định nghĩa thư viện (express, cors, dotenv, @payos/node)
├── server.js         # Toàn bộ mã nguồn API xử lý giao dịch và bẫy lỗi giả lập
├── .env.example      # File chứa định dạng cấu hình mẫu các biến môi trường
└── README.md         # Tài liệu hướng dẫn bạn đang đọc này
```

---

## 🛠️ Bước 1: Chuẩn bị trước khi Deploy
1. **Tạo tài khoản GitHub**: Nếu bạn chưa có, hãy tạo một tài khoản tại [github.com](https://github.com/).
2. **Đưa mã nguồn lên GitHub**:
   - Tạo một repository mới trên GitHub (vớI trạng thái Private hoặc Public tùy bạn).
   - Đẩy (push) toàn bộ thư mục `backend/` lên repository này (đảm bảo file `package.json` nằm ở cấp cao nhất của dự án Git hoặc cấu hình đường dẫn thư mục gốc đúng trên Render).

---

## ☁️ Bước 2: Deploy Backend lên Render (Miễn Phí)
**Render** là một dịch vụ PaaS hỗ trợ chạy và deploy Node.js cực kỳ dễ dàng từ GitHub.

1. Truy cập trang chủ [render.com](https://render.com/) và đăng nhập bằng tài khoản GitHub của bạn.
2. Tại màn hình Dashboard, bấm nút **New +** ở góc trên bên phải và chọn **Web Service**.
3. Chọn tùy chọn **Connect a repository** và nhấp chọn kho lưu trữ GitHub chứa code của bạn.
4. Cấu hình các thông số dịch vụ phù hợp:
   - **Name**: Nhập tên dự án viết liền không dấu (Ví dụ: `roomie-ai-payment-api`).
   - **Environment/Runtime**: Chọn **Node**.
   - **Branch**: Chọn nhánh đẩy code (Ví dụ: `main` hoặc `master`).
   - **Root Directory**: Nhập `backend` (Nếu repo của bạn chứa cả Frontend và Backend, còn nếu repo của bạn chỉ chứa riêng thư mục backend này ở ngoài cùng thì để trống).
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Chọn gói **Free** (Miễn phí).

---

## 🔑 Bước 3: Điền các biến môi trường (Environment Variables) trên Render

Để API kết nối thành công với payOS, bạn cần điền các thông số khóa bảo mật trên Render:

1. Cuộn xuống dưới trong bảng cấu hình Render Web Service hoặc vào mục **Environment** bên menu trái sau khi tạo xong.
2. Bấm nút **Add Environment Variable** để thêm lần lượt 5 cặp khóa sau:

| Tên Biến (Key) | Giá Trị Cụ Thể (Value) | Ghi chú lý giải |
|---|---|---|
| `PORT` | `10000` | Cổng hoạt động mặc định của backend |
| `FRONTEND_URL` | https://ten-cua-ban.github.io/roomie | Đường dẫn chạy website Frontend của bạn (ví dụ Github Pages, Vercel, hoặc localhost khi test) |
| `PAYOS_CLIENT_ID` | *Lấy từ payOS* | Mã Client ID được cấp trong trang quản trị payOS |
| `PAYOS_API_KEY` | *Lấy từ payOS* | API Key dùng để kết nối do payOS cung cấp |
| `PAYOS_CHECKSUM_KEY` | *Lấy từ payOS* | Khóa dùng để ký và đối soát checksum giao dịch |

3. Nhấp vào **Create Web Service** hoặc **Save Changes** để Render tự động build và chạy ứng dụng.
4. Chờ 1 - 2 phút, khi tab **Logs** báo chữ `🚀 Server running on port 10000` màu xanh lá, ứng dụng của bạn đã Online!
5. Sao chép lại đường dẫn URL của Web Service vừa tạo do Render cung cấp ở đầu trang (Dạng: `https://ten-backend-api.onrender.com`).

---

## 🎯 Bước 4: Lấy thông tin API Key & Cấu hình Webhook trên payOS

### 1. Đăng ký tài khoản và Lấy API Key
1. Đăng nhập vào trang quản trị payOS tại địa chỉ: [my.payos.vn](https://my.payos.vn/).
2. Chuyển sang mục **Cấu hình tích hợp** (Integration) tại menu chính.
3. Tại đây bạn sẽ thấy 3 dãy ký tự bảo mật tương ứng với:
   - `Client ID`
   - `API Key`
   - `Checksum Key`
4. Sao chép 3 chuỗi ký tự này để điền vào phần **Environment** của Render ở Bước 3.

### 2. Cấu hình Webhook nhận tin báo thanh toán thành công
payOS cần biết địa điểm (Webhook URL) trên backend của bạn để tự động phát đi tín hiệu khi người dùng thực hiện chuyển khoản thành công.

1. Vẫn tại mục phát triển trong **my.payos.vn**, tìm đến mục **Sự kiện Webhook** hoặc **Webhook URL**.
2. Nhập URL webhook của bạn có định dạng:
   ```text
   https://ten-backend-cua-ban.onrender.com/api/payos-webhook
   ```
   *(Thay thế `ten-backend-cua-ban.onrender.com` bằng link Render chính thức của bạn ở Bước 3).*
3. Nhấp nút **Xác nhận/Lưu cấu hình**.
4. payOS sẽ gửi một gói dữ liệu test để kiểm duyệt, nếu backend của bạn phản hồi HTTP status `200` thành công, webhook sẽ được kích hoạt chuyển trạng thái sang **Hoạt động / Online**.

---

## 💡 Lưu ý quan trọng dành cho sinh viên
- **Thời gian khởi động lại (Cold Start)**: Bạn đang dùng gói **Free** của Render nên sau 15 phút không có ai truy cập, api sẽ tự động "ngủ". Khi có cuộc gọi đầu tiên (ví dụ bấm nút thanh toán giữ chỗ), Render sẽ mất khoảng 40s - 1 phút để "đánh thức" server khởi động lại. Đây là hành vi hoàn toàn bình thường khi dùng dịch vụ miễn phí!
- **Hệ thống RAM ảo**: Giao dịch chỉ được lưu giữ tạm thời trong RAM của NodeJS. Nếu server bị khởi động lại hoặc đi ngủ trên Render, lịch sử mảng sẽ bị xóa trắng. Để nâng cấp đồ án lên 10 điểm, hãy kết nối thêm cơ sở dữ liệu thật như MongoDB, SQL, Firestore hoặc PostgreSQL nhé.

Chúc các bạn phát triển thành công và đạt điểm tối đa trong học phần này!
