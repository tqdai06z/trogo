document.addEventListener("DOMContentLoaded", renderBookings);

function renderBookings() {
  const container = document.getElementById("booking-list");
  const bookings = readBookings();
  if (!bookings.length) {
    container.innerHTML = '<div class="empty-state"><h2>Chưa có lịch hẹn</h2><p>Bạn chưa đặt lịch xem phòng nào.</p><a class="dashboard-btn" href="rooms.html" style="margin-top:1rem">Tìm phòng ngay</a></div>';
    return;
  }
  container.innerHTML = bookings.map((item, index) => `
    <article class="booking-card glass-panel">
      <div><span class="status-badge ${item.status?.includes("chờ") ? "pending" : ""}">${safe(item.status || "Đang chờ")}</span><h2 style="margin-top:.6rem">${safe(item.roomTitle || "Phòng chưa xác định")}</h2>
      <div class="card-meta"><span>📅 ${safe(item.date || "--")}</span><span>⏰ ${safe(item.time || "--")}</span><span>☎ ${safe(item.phone || "--")}</span>${item.notes ? `<span>📝 ${safe(item.notes)}</span>` : ""}</div></div>
      <button class="dashboard-btn danger" data-delete-booking="${index}">Xóa lịch</button>
    </article>`).join("");
  container.querySelectorAll("[data-delete-booking]").forEach(button => button.addEventListener("click", () => {
    const current = readBookings(); current.splice(Number(button.dataset.deleteBooking), 1);
    localStorage.setItem("roomie_appointments", JSON.stringify(current)); showToast("Đã xóa lịch hẹn", "warn"); renderBookings();
  }));
}
function readBookings(){try{const v=JSON.parse(localStorage.getItem("roomie_appointments")||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
