document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    form.querySelectorAll(".field-error").forEach(item => item.textContent = "");

    const data = Object.fromEntries(new FormData(form));
    const errors = {};
    if (data.name.trim().length < 2) errors.name = "Vui lòng nhập họ tên.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Email chưa hợp lệ.";
    if (!/^(0|\+84)\d{9}$/.test(data.phone.replace(/\s/g, ""))) errors.phone = "Số điện thoại chưa hợp lệ.";
    if (!data.subject) errors.subject = "Vui lòng chọn chủ đề.";
    if (data.message.trim().length < 10) errors.message = "Nội dung cần ít nhất 10 ký tự.";

    Object.entries(errors).forEach(([name, message]) => {
      form.elements[name].closest(".field").querySelector(".field-error").textContent = message;
    });
    if (Object.keys(errors).length) return;

    const contacts = readArray("roomie_contacts");
    contacts.unshift({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem("roomie_contacts", JSON.stringify(contacts));
    showToast("Gửi liên hệ thành công", "success");
    form.reset();
  });
});

function readArray(key) {
  try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
