# Roomie AI - Website tìm phòng trọ thông minh

Roomie AI là đồ án giao diện website tìm phòng trọ dành cho sinh viên và người đi làm. Dự án dùng HTML, CSS và JavaScript thuần; dữ liệu tương tác được mô phỏng bằng `localStorage`.

## Mục tiêu

- Tìm và lọc phòng theo khu vực, giá, loại phòng và tiện ích.
- Xem thông tin chi tiết, lưu yêu thích và đặt lịch xem phòng.
- Mô phỏng tìm kiếm bằng câu tự nhiên với AI Search.
- Hỗ trợ chủ trọ đăng và quản lý tin.
- Cung cấp hồ sơ, lịch hẹn, thống kê và so sánh phòng.

## Công nghệ

- HTML5
- CSS3 và Media Query
- JavaScript thuần
- localStorage
- Emoji/ký tự làm icon

Không sử dụng Tailwind, Bootstrap, Google Fonts, Lucide, React, Vue, Angular hoặc TypeScript.

## 15 trang chính

1. `index.html` - Trang chủ
2. `about.html` - Giới thiệu
3. `contact.html` - Liên hệ
4. `rooms.html` - Tìm phòng
5. `room-detail.html` - Chi tiết phòng
6. `faq.html` - Câu hỏi thường gặp
7. `favorites.html` - Phòng yêu thích
8. `profile.html` - Hồ sơ cá nhân
9. `my-bookings.html` - Lịch xem phòng
10. `ai-search.html` - AI Search
11. `statistics.html` - Dashboard thống kê
12. `comparison.html` - So sánh phòng
13. `login.html` - Đăng nhập
14. `post-room.html` - Đăng tin
15. `my-posts.html` - Tin đăng của tôi

`booking.html` được giữ làm trang chức năng phụ để tạo lịch hẹn.

## Phân công nhóm

| Thành viên | Trang phụ trách |
|---|---|
| Đại | `index.html`, `about.html`, `contact.html` |
| Dung | `rooms.html`, `room-detail.html`, `faq.html` |
| Chi | `favorites.html`, `profile.html`, `my-bookings.html` |
| Đức | `ai-search.html`, `statistics.html`, `comparison.html` |
| Duy | `login.html`, `post-room.html`, `my-posts.html` |

Mỗi thành viên phụ trách HTML, CSS và JavaScript của ba trang được giao.

## Cấu trúc chính

```text
roomie-ai-refactored/
├── *.html
├── css/
│   ├── style.css
│   ├── home.css
│   ├── rooms.css
│   ├── ai-search.css
│   ├── auth.css
│   ├── detail.css
│   ├── info.css
│   ├── dashboard.css
│   └── responsive.css
└── js/
    ├── components.js
    ├── main.js
    ├── rooms-data.js
    ├── home.js
    ├── rooms.js
    ├── room-detail.js
    ├── ai-search.js
    ├── favorites.js
    ├── booking.js
    ├── auth.js
    ├── post-room.js
    ├── contact.js
    ├── faq.js
    ├── profile.js
    ├── my-bookings.js
    ├── statistics.js
    ├── comparison.js
    └── my-posts.js
```

## Dữ liệu localStorage

- `roomie_user`: tài khoản đăng nhập.
- `roomie_favorites`: ID phòng yêu thích.
- `roomie_appointments`: lịch xem phòng.
- `roomie_user_posted_rooms`: tin phòng đã đăng.
- `roomie_contacts`: liên hệ hỗ trợ đã gửi.

## Cách chạy và kiểm thử

1. Mở thư mục bằng Visual Studio Code.
2. Cài extension Live Server.
3. Nhấn chuột phải `index.html` và chọn **Open with Live Server**.
4. Kiểm tra menu trên desktop và nút hamburger trên mobile.
5. Lưu phòng yêu thích rồi mở `favorites.html` và `profile.html`.
6. Đặt lịch từ `booking.html?id=1`, sau đó xem `my-bookings.html`.
7. Đăng phòng tại `post-room.html`, sau đó xem `my-posts.html`.
8. Mở `statistics.html` và `comparison.html` để kiểm tra dữ liệu phòng.
