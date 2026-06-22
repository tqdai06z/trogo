document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = parseInt(urlParams.get("id") || "0", 10);

  const postedRooms = JSON.parse(localStorage.getItem("roomie_user_posted_rooms") || "[]");
  const allRooms = [...postedRooms, ...roomsData];
  const room = allRooms.find(r => r.id === roomId);

  renderSelectedRoomWidget(room);
  prefillSessionData();
  setupBookingFormSubmission(room);
});


function renderSelectedRoomWidget(room) {
  const container = document.getElementById("booking-room-widget");
  if (!container) return;

  if (!room) {
    container.innerHTML = `
      <div class="glass-panel" style="padding: 1.25rem; font-size: 0.8rem; line-height: 1.6; border-color: var(--color-slate-800);">
        <p class="page-tag" style="color: var(--color-rose); margin-bottom: 0.5rem;">
          <span class="icon">⚠</span> Chưa chọn phòng cụ thể
        </p>
        <p style="color: var(--color-slate-400);">Hệ thống không tìm thấy phòng kèm theo đường dẫn đặt lịch. Quý khách vẫn có thể gửi thông tin liên hệ, nhân viên tư vấn sẽ liên hệ để hỗ trợ tìm phòng ngẫu nhiên phù hợp.</p>
        <a href="rooms.html" class="btn-card-detail" style="margin-top: 1rem; width: 100%; text-align: center;">Xem danh mục phòng trọ &rarr;</a>
      </div>
    `;
    return;
  }

  const formattedPrice = room.price.toLocaleString("vi-VN") + "đ/tháng";

  container.innerHTML = `
    <div class="room-card glass-panel" style="border-radius: 1rem;">
      <div class="room-image-wrapper" style="height: 9rem;">
        <img src="${room.image}" alt="${room.title}" class="room-thumbnail">
        <div class="room-image-overlay"></div>
        <span class="room-card-price" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">
          ${formattedPrice}
        </span>
      </div>

      <div class="room-card-body" style="padding: 1rem; gap: 0.75rem;">
        <h4 class="room-card-title" style="font-size: 0.9rem; height: auto; -webkit-line-clamp: 2; margin-bottom: 0;">
          <a href="room-detail.html?id=${room.id}">${room.title}</a>
        </h4>

        <div class="form-row form-row-two" style="gap: 0.5rem; font-size: 11px; color: var(--color-slate-400); font-family: monospace;">
          <div>Mã: <strong style="color: var(--color-slate-200);">${room.code}</strong></div>
          <div style="text-align: right;">Loại: <strong style="color: var(--color-slate-200);">${room.type}</strong></div>
          <div>Diện tích: <strong style="color: var(--color-slate-200);">${room.area}m²</strong></div>
          <div style="text-align: right;">Giá bán lẻ: <strong style="color: var(--color-sky);">${(room.price / 1000000).toFixed(1)}Tr</strong></div>
        </div>

        <hr class="divider-line" style="opacity: 0.4;">

        <div class="address-line" style="font-size: 11px; color: var(--color-slate-400); align-items: flex-start;">
          <span class="icon" style="color: var(--color-sky); margin-right: 4px; font-size: 12px;">📍</span>
          <span class="truncate" title="${room.address}">${room.address}</span>
        </div>
      </div>
    </div>
  `;
}

function prefillSessionData() {
  const user = JSON.parse(localStorage.getItem("roomie_user") || "null");
  if (user) {
    const nameInput = document.getElementById("book-name-input");
    const phoneInput = document.getElementById("book-phone-input");
    
    if (nameInput) nameInput.value = user.name;
    if (phoneInput) phoneInput.value = user.phone || "0912 345 678";
  }
  const dateInput = document.getElementById("book-date-input");
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const minDateStr = `${yyyy}-${mm}-${dd}`;
    
    dateInput.value = minDateStr;
    dateInput.min = minDateStr; // Chặn triệt để việc bấm chọn ngày quá khứ
  }
}

function setupBookingFormSubmission(room) {
  const form = document.getElementById("booking-schedule-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const bookerName = document.getElementById("book-name-input").value.trim();
    const bookerPhone = document.getElementById("book-phone-input").value.trim();
    const bookerDate = document.getElementById("book-date-input").value;
    const bookerTime = document.getElementById("book-time-input").value;
    const bookerNotes = document.getElementById("book-notes-input").value.trim();

    const appointment = {
      id: "APT-" + Date.now(),
      roomId: room ? room.id : null,
      roomCode: room ? room.code : "RANDOM-UNASSIGNED",
      roomTitle: room ? room.title : "Tư vấn tìm phòng tự do",
      name: bookerName,
      phone: bookerPhone,
      date: bookerDate,
      time: bookerTime,
      notes: bookerNotes,
      status: "Đã xác nhận lịch",
      createdAt: new Date().toISOString()
    };

    const savedAppointments = JSON.parse(localStorage.getItem("roomie_appointments") || "[]");
    savedAppointments.push(appointment);
    localStorage.setItem("roomie_appointments", JSON.stringify(savedAppointments));

   showToast("Đang chuyển sang trang thanh toán...", "success");

if (typeof createPayOSPayment === "function") {
  createPayOSPayment(room, {
    name: bookerName,
    phone: bookerPhone,
    date: bookerDate,
    time: bookerTime,
    note: bookerNotes
  });
} else {
  showToast("Chưa kết nối được file payment.js", "warn");
}
  });
}