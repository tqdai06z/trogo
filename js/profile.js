document.addEventListener("DOMContentLoaded", () => {
  const fallback = { name: "Khách Roomie", email: "Chưa cập nhật", phone: "Chưa cập nhật", avatarLetter: "K" };
  let user = readObject("roomie_user") || fallback;
  const form = document.getElementById("profile-edit-form");

  function render() {
    document.getElementById("profile-avatar").textContent = user.avatarLetter || user.name.charAt(0).toUpperCase();
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email || fallback.email;
    document.getElementById("profile-phone").textContent = user.phone || fallback.phone;
    document.getElementById("profile-favorites").textContent = readArray("roomie_favorites").length;
    document.getElementById("profile-bookings").textContent = readArray("roomie_appointments").length;
    document.getElementById("profile-posts").textContent = readArray("roomie_user_posted_rooms").length;
  }

  document.getElementById("edit-profile-btn").addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "block" : "none";
    form.elements[0].value = user.name;
    form.elements[1].value = user.email === fallback.email ? "" : user.email;
    form.elements[2].value = user.phone === fallback.phone ? "" : user.phone;
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    user = { ...user, name: document.getElementById("edit-name").value.trim() || fallback.name, email: document.getElementById("edit-email").value.trim(), phone: document.getElementById("edit-phone").value.trim() };
    user.avatarLetter = user.name.charAt(0).toUpperCase();
    localStorage.setItem("roomie_user", JSON.stringify(user));
    render(); form.style.display = "none"; showToast("Đã cập nhật hồ sơ", "success");
  });
  document.getElementById("profile-logout-btn").addEventListener("click", () => {
    localStorage.removeItem("roomie_user"); showToast("Đã đăng xuất", "success");
    setTimeout(() => location.href = "login.html", 500);
  });
  render();
});

function readArray(key){try{const v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
function readObject(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch{return null}}
