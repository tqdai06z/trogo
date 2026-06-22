/*
  main.js - Chức năng dùng chung cho toàn bộ website Roomie AI
  Bao gồm: menu mobile, toast, yêu thích, đăng nhập demo, active menu
*/

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  updateFavoritesBadge();
  updateUserHeader();
  setActiveMenu();
});

/* Mở / đóng menu trên điện thoại */
function initMobileMenu() {
  const menuBtn = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener("click", function () {
    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("show");

    if (mobileMenu.classList.contains("show")) {
      menuBtn.textContent = "✕";
    } else {
      menuBtn.textContent = "☰";
    }
  });
}

/* Hiển thị thông báo nhỏ */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";

  if (type === "success") {
    toast.classList.add("toast-success");
  } else {
    toast.classList.add("toast-warn");
  }

  const icon = type === "success" ? "✓" : "!";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close-btn" type="button">×</button>
  `;

  const closeBtn = toast.querySelector(".toast-close-btn");
  closeBtn.addEventListener("click", function () {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, 3000);
}

window.showToast = showToast;

/* Cập nhật số lượng phòng yêu thích */
function updateFavoritesBadge() {
  const favorites = JSON.parse(localStorage.getItem("roomie_favorites") || "[]");
  const badges = document.querySelectorAll(".fav-count-badge");

  badges.forEach(function (badge) {
    badge.textContent = favorites.length;

    if (favorites.length > 0) {
      badge.classList.remove("badge-hidden");
    } else {
      badge.classList.add("badge-hidden");
    }
  });
}

window.updateFavoritesBadge = updateFavoritesBadge;

/* Hiển thị trạng thái đăng nhập demo */
function updateUserHeader() {
  const user = JSON.parse(localStorage.getItem("roomie_user") || "null");
  const authContainer = document.getElementById("auth-header-container");

  if (!authContainer) return;

  if (user) {
    authContainer.innerHTML = `
      <div class="user-box">
        <span class="user-avatar">${user.avatarLetter || user.name.charAt(0).toUpperCase()}</span>
        <span class="user-name">${user.name}</span>
        <button id="logout-btn" class="logout-btn" type="button">Đăng xuất</button>
      </div>
    `;
  } else {
    authContainer.innerHTML = `<a href="login.html" class="login-link">Đăng nhập</a>`;
  }

  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("roomie_user");
      showToast("Đã đăng xuất thành công!", "success");

      setTimeout(function () {
        window.location.href = "index.html";
      }, 700);
    });
  }
}

window.updateUserHeader = updateUserHeader;

/* Đánh dấu menu đang ở trang hiện tại */
function setActiveMenu() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".nav-menu a, .mobile-menu a");

  links.forEach(function (link) {
    const href = link.getAttribute("href");

    if (href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}