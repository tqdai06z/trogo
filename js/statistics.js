document.addEventListener("DOMContentLoaded", () => {
  const posted = readArray("roomie_user_posted_rooms");
  const allRooms = [...posted, ...(Array.isArray(window.roomsData) ? window.roomsData : [])];
  document.getElementById("stat-rooms").textContent = allRooms.length;
  document.getElementById("stat-favorites").textContent = readArray("roomie_favorites").length;
  document.getElementById("stat-bookings").textContent = readArray("roomie_appointments").length;
  document.getElementById("stat-posts").textContent = posted.length;
  renderChart("district-chart", countBy(allRooms, "district"));
  renderChart("type-chart", countBy(allRooms, "type"));
});
function countBy(items,key){return items.reduce((r,i)=>{const name=i[key]||"Khác";r[name]=(r[name]||0)+1;return r},{})}
function renderChart(id,data){const root=document.getElementById(id);const max=Math.max(1,...Object.values(data));root.innerHTML=Object.entries(data).map(([label,count])=>`<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${count/max*100}%"></div></div><strong>${count}</strong></div>`).join("")||"<p>Chưa có dữ liệu.</p>"}
function readArray(key){try{const v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
