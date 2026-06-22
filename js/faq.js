document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const willOpen = !item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(other => {
        other.classList.remove("open");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-question span:last-child").textContent = "＋";
      });
      if (willOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        button.querySelector("span:last-child").textContent = "−";
      }
    });
  });
});
