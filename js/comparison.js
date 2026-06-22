document.addEventListener("DOMContentLoaded", () => {
  const posted = readArray("roomie_user_posted_rooms");
  const rooms = [...posted, ...(Array.isArray(window.roomsData) ? window.roomsData : [])];
  const selects = ["compare-room-1","compare-room-2","compare-room-3"].map(id => document.getElementById(id));
  const options = rooms.map(room => `<option value="${room.id}">${safe(room.title)}</option>`).join("");
  selects[0].innerHTML = options; selects[1].innerHTML = options; selects[2].insertAdjacentHTML("beforeend", options);
  if (rooms[1]) selects[1].value = rooms[1].id;
  document.getElementById("compare-btn").addEventListener("click", () => renderComparison(rooms, selects));
  renderComparison(rooms, selects);
});
function renderComparison(rooms,selects){const picked=selects.map(s=>rooms.find(r=>String(r.id)===s.value)).filter(Boolean);const root=document.getElementById("comparison-result");if(picked.length<2){root.innerHTML='<div class="empty-state">Hãy chọn ít nhất hai phòng.</div>';return}const rows=[["Tên phòng",r=>r.title],["Giá",r=>Number(r.price).toLocaleString("vi-VN")+"đ/tháng"],["Quận",r=>r.district],["Diện tích",r=>r.area+"m²"],["Loại phòng",r=>r.type],["Tiện ích",r=>(r.utilities||[]).join(", ")||"Chưa cập nhật"],["Trạng thái",r=>r.status||"Còn phòng"],["",r=>`<a class="dashboard-btn" href="room-detail.html?id=${r.id}">Xem chi tiết</a>`]];root.innerHTML=`<table class="comparison-table"><thead><tr><th>Tiêu chí</th>${picked.map((_,i)=>`<th>Phòng ${i+1}</th>`).join("")}</tr></thead><tbody>${rows.map(([label,get])=>`<tr><th>${label}</th>${picked.map(r=>`<td>${label? safe(get(r)):get(r)}</td>`).join("")}</tr>`).join("")}</tbody></table>`}
function readArray(key){try{const v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
