// home.js - Xử lý riêng cho trang chủ

document.addEventListener("DOMContentLoaded", function () {
  renderFeaturedRooms();
  setupHeroForm();
});

// Hiển thị 3 phòng nổi bật ở trang chủ
function renderFeaturedRooms() {
  const container = document.getElementById("featured-rooms-container");
  if (!container) return;

  const rooms = window.roomsData || [];
  const featuredRooms = rooms.slice(0, 3);

  container.innerHTML = "";

  if (featuredRooms.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Chưa có phòng nổi bật</h3>
        <p>Hiện chưa có dữ liệu phòng trọ để hiển thị.</p>
      </div>
    `;
    return;
  }

  featuredRooms.forEach(function (room) {
    const favorites = getFavorites();
    const isFavorite = favorites.includes(room.id);
    const price = Number(room.price).toLocaleString("vi-VN") + "đ/tháng";

    const card = document.createElement("article");
    card.className = "room-card glass-panel";

    card.innerHTML = `
      <div class="room-image-wrapper">
        <img src="${room.image}" alt="${room.title}" class="room-thumbnail">

        <span class="room-badge-verified">
          <span class="icon">✓</span>
          Xác thực
        </span>

        <span class="room-card-price">${price}</span>

        <button class="fav-toggle-btn" data-id="${room.id}" type="button">
          <span class="icon ${isFavorite ? "favorite-active" : ""}">
            ${isFavorite ? "♥" : "♡"}
          </span>
        </button>
      </div>

      <div class="room-card-body">
        <div class="room-card-metadata">
          <span>Mã: <strong>${room.code}</strong></span>
          <span>${room.area} m²</span>
          <span class="room-card-type">${room.type}</span>
        </div>

        <h3 class="room-card-title">
          <a href="room-detail.html?id=${room.id}">${room.title}</a>
        </h3>

        <p class="room-card-address">
          <span class="icon">📍</span>
          ${room.district}, ${room.ward}
        </p>

        <div class="room-card-utilities">
          ${room.utilities.slice(0, 3).map(function (item) {
            return `<span class="utility-badge">${item}</span>`;
          }).join("")}
        </div>

        <div class="room-card-actions">
          <a href="room-detail.html?id=${room.id}" class="btn-card-detail">Xem chi tiết</a>
          <a href="booking.html?id=${room.id}" class="btn-card-booking">Đặt lịch</a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  setupFavoriteButtons();
}

// Xử lý nút yêu thích
function setupFavoriteButtons() {
  const buttons = document.querySelectorAll(".fav-toggle-btn");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const roomId = Number(button.dataset.id);
      let favorites = getFavorites();
      const icon = button.querySelector(".icon");

      if (favorites.includes(roomId)) {
        favorites = favorites.filter(function (id) {
          return id !== roomId;
        });

        icon.textContent = "♡";
        icon.classList.remove("favorite-active");

        showToast("Đã xóa khỏi yêu thích", "warn");
      } else {
        favorites.push(roomId);

        icon.textContent = "♥";
        icon.classList.add("favorite-active");

        showToast("Đã thêm vào yêu thích", "success");
      }

      localStorage.setItem("roomie_favorites", JSON.stringify(favorites));
      updateFavoritesBadge();
    });
  });
}

// Form tìm kiếm ở trang chủ
function setupHeroForm() {
  const form = document.getElementById("hero-search-form");
  const input = document.getElementById("hero-search-input");

  if (!form || !input) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const keyword = input.value.trim();

    if (keyword !== "") {
      window.location.href = "rooms.html?search=" + encodeURIComponent(keyword);
    }
  });
}

// Đọc danh sách yêu thích
function getFavorites() {
  return JSON.parse(localStorage.getItem("roomie_favorites") || "[]");
}