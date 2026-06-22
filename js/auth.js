/**
 * Authorization Handler Controller: Roomie AI (Login & SSO mock session manager)
 */

// Sử dụng các biến toàn cục từ main.js

document.addEventListener("DOMContentLoaded", () => {
  setupAuthListeners();
});

/**
 * Configure email registration, input fields, and Google SSO adapters
 */
function setupAuthListeners() {
  const loginForm = document.getElementById("auth-login-form");
  const googleBtn = document.getElementById("btn-google-sso");
  const signupLink = document.getElementById("auth-signup-demo");

  // 1. Core Email Form Submit
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email-input").value.trim();
      
      // Determine initial avatar letter based on input email or defaults
      let computedLetter = "KH";
      if (email) {
        computedLetter = email.charAt(0).toUpperCase();
      }

      // Check for custom names if they type specific ones, otherwise use "Người dùng Demo"
      let name = "Người dùng Demo";
      if (email.startsWith("admin")) {
        name = "Roomie Admin";
        computedLetter = "AD";
      } else if (email.startsWith("van")) {
        name = "Khách hàng Vân";
        computedLetter = "V";
      } else if (email.startsWith("thanh")) {
        name = "Khách hàng Thành";
        computedLetter = "T";
      } else if (email.startsWith("tq") || email.startsWith("tqdai")) {
        name = "Tạ Quang Đại";
        computedLetter = "Đ";
      }

      const mockUserProfile = {
        name: name,
        email: email,
        phone: "0912 345 678",
        avatarLetter: computedLetter,
        loggedInAt: new Date().toISOString()
      };

      // Save session
      localStorage.setItem("roomie_user", JSON.stringify(mockUserProfile));

      showToast(`Đăng nhập thành công! Chào ${name} quay trở lại.`, "success");

      // Redirect callback
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    });
  }

  // 2. Google SSO Simulator
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      showToast("Đang kết nối giao thức xác thực Google...", "success");

      setTimeout(() => {
        const mockGoogleProfile = {
          name: "Trung Thành (Google)",
          email: "thanh.google@gmail.com",
          phone: "0999 888 777",
          avatarLetter: "G",
          loggedInAt: new Date().toISOString()
        };

        localStorage.setItem("roomie_user", JSON.stringify(mockGoogleProfile));
        showToast("Đăng nhập tài khoản Google thành công!", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);

      }, 1200);
    });
  }

  // 3. Signup simulator
  if (signupLink) {
    signupLink.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Cổng đăng ký đóng băng trong giai đoạn Demo! Xin quý khách vui lòng điền thông tin đăng nhập trực tiếp.", "warn");
    });
  }
}
