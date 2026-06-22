/**
 * Roomie AI shared header and footer.
 * This keeps every HTML page short and consistent.
 */

document.addEventListener("DOMContentLoaded", () => {
  const currentScript = document.querySelector('script[src="./js/components.js"]');
  const pageName = currentScript ? currentScript.dataset.page : "";

  renderHeader(pageName);
  renderFooter(pageName);
});

function renderHeader(pageName) {
  if (document.querySelector(".header")) return;

  const header = document.createElement("header");
  header.className = "header";
  header.innerHTML = `
    <div class="container header-content">
      <a href="index.html" class="logo">✦ Roomie AI</a>

      <nav class="nav-menu">
        <a href="index.html" class="${pageName === "home" ? "active" : ""}">Trang chủ</a>
        <a href="rooms.html" class="${pageName === "rooms" ? "active" : ""}">Tìm phòng</a>
        <a href="ai-search.html" class="${pageName === "ai-search" ? "active" : ""}">AI Search</a>
        <a href="favorites.html" class="${pageName === "favorites" ? "active" : ""}">Yêu thích <span class="fav-count-badge badge-hidden">0</span></a>
        <a href="my-bookings.html" class="${pageName === "my-bookings" ? "active" : ""}">Lịch hẹn</a>
        <a href="post-room.html" class="${pageName === "post-room" ? "active" : ""}">Đăng tin</a>
        <a href="profile.html" class="${pageName === "profile" ? "active" : ""}">Hồ sơ</a>
      </nav>

      <div class="header-actions" id="auth-header-container">
        <a href="login.html" class="login-link">Đăng nhập</a>
      </div>

      <button class="menu-btn" id="hamburger-btn" type="button">☰</button>
    </div>

    <nav class="mobile-menu hidden" id="mobile-menu">
      <a href="index.html">Trang chủ</a>
      <a href="rooms.html">Tìm phòng</a>
      <a href="ai-search.html">AI Search</a>
      <a href="favorites.html">Yêu thích <span class="fav-count-badge badge-hidden">0</span></a>
      <a href="my-bookings.html">Lịch hẹn</a>
      <a href="post-room.html">Đăng tin phòng</a>
      <a href="profile.html">Hồ sơ</a>
      <a href="login.html">Đăng nhập</a>
    </nav>
  `;

  document.body.prepend(header);
}

function renderFooter(pageName) {
  if (document.querySelector(".footer")) return;

  const footer = document.createElement("footer");
  footer.className = "footer";

  footer.innerHTML = `
      <div class="footer-grid container">
        <div class="footer-col brand-col">
          <a href="index.html" class="footer-logo">
            <span class="icon sparkle-icon">✦</span>
            <span class="display-font">Roomie AI</span>
          </a>
          <p class="footer-description">Nền tảng tìm kiếm phòng trọ, căn hộ và ở ghép thông minh giúp kết nối người thuê và chủ nhà nhanh nhất.</p>
          <div class="social-links-row">
            <a href="#" class="social-link" title="Facebook"><span class="icon">f</span></a>
            <a href="#" class="social-link" title="Instagram"><span class="icon">◎</span></a>
            <a href="#" class="social-link" title="Email"><span class="icon">✉</span></a>
          </div>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading display-font">Điều hướng nhanh</h3>
          <ul class="footer-links-list">
            <li><a href="index.html">Trang chủ</a></li>
            <li><a href="rooms.html">Tìm kiếm phòng trọ</a></li>
            <li><a href="ai-search.html">Trò chuyện cùng AI</a></li>
            <li><a href="favorites.html">Phòng trọ yêu thích</a></li>
            <li><a href="my-bookings.html">Lịch xem phòng</a></li>
            <li><a href="post-room.html">Đăng tin cho thuê</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading display-font">Thông tin & hỗ trợ</h3>
          <ul class="footer-links-list">
            <li><a href="about.html">Giới thiệu</a></li>
            <li><a href="contact.html">Liên hệ</a></li>
            <li><a href="faq.html">Câu hỏi thường gặp</a></li>
            <li><a href="statistics.html">Thống kê</a></li>
            <li><a href="comparison.html">So sánh phòng</a></li>
            <li><a href="my-posts.html">Tin đã đăng</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading display-font">Thông tin đề tài</h3>
          <div class="footer-info-text">
            <p><strong>Báo cáo cuối kỳ:</strong> Thiết kế Giao diện Website</p>
            <p><strong>Đề tài:</strong> Nền tảng tìm trọ thông minh Roomie AI</p>
            <p class="footer-subinfo-text">Sản phẩm mô phỏng UI/UX hỗ trợ học sinh, sinh viên tìm trọ an toàn, dễ dàng.</p>
          </div>
        </div>
      </div>
      ${footerBottomHtml()}
    `;

  document.body.appendChild(footer);
}

function footerBottomHtml() {
  return `
    <div class="footer-bottom container">
      <div>&copy; 6/2026 Roomie  Platform. Bản quyền thuộc về Roomie.</div>
      
    </div>
  `;
}
